import { useEffect, useRef, useState } from 'react';
import Masonry from 'react-masonry-css';
import InfiniteScroll from 'react-infinite-scroll-component';
import './Gallery.css';
import { Photo } from '../types';
import PhotoModal from './PhotoModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import EditPhotoForm from './EditPhotoForm';
import { Filters } from './Sidebar';
import { getToken } from '../utils/auth';

interface GalleryProps {
    filters: Filters;
}

function Gallery({ filters }: GalleryProps) {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const [photoToDelete, setPhotoToDelete] = useState<Photo | null>(null);
    const [photoToEdit, setPhotoToEdit] = useState<Photo | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Ref trzymający aktualną stronę
    const pageRef = useRef(0);

    const loadPhotos = (pageToLoad: number, reset = false) => {
        console.log('🟡 WYWOŁANIE loadPhotos');
        console.log('➡️ pageToLoad:', pageToLoad);
        console.log('📦 reset:', reset);

        const params = new URLSearchParams();
        if (filters.color) params.append('color', filters.color);
        if (filters.type) params.append('type', filters.type);
        if (filters.material) params.append('material', filters.material);
        if (filters.minHeight) params.append('minHeight', String(filters.minHeight));
        if (filters.maxHeight) params.append('maxHeight', String(filters.maxHeight));
        params.append('page', String(pageToLoad));
        params.append('size', '12');

        const url = `http://localhost:8080/api/photos?${params.toString()}`;

        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error('Nie udało się pobrać zdjęć');
                return res.json();
            })
            .then(data => {
                console.log('✅ Odpowiedź z backendu:', data);
                if (reset) {
                    setPhotos(data.content);
                } else {
                    setPhotos(prev => [...prev, ...data.content]);
                }

                setHasMore(!data.last);
                const newPage = pageToLoad + 1;
                console.log('🔁 INKREMENTUJĘ page do:', newPage);
                pageRef.current = newPage;
            })
            .catch(err => setError(err.message));
    };

    const loadPhotosRef = useRef(() => {});
    loadPhotosRef.current = () => {
        console.log('🟢 next() wywołane przy scrollu (gallery-scroll)');
        loadPhotos(pageRef.current);
    };

    useEffect(() => {
        console.log('🔄 resetuję galerię');
        pageRef.current = 0;
        setHasMore(true);
        loadPhotos(0, true);
    }, [filters]);

    const handleDelete = (photoId: number) => {
        fetch(`http://localhost:8080/api/photos/${photoId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${getToken()!}` },
            credentials: 'include'
        })
            .then(res => {
                if (!res.ok) throw new Error('Błąd podczas usuwania zdjęcia');
                setPhotoToDelete(null);
                setPhotos(prev => prev.filter(p => p.id !== photoId));
            })
            .catch(err => alert(err.message));
    };

    const breakpointColumnsObj = {
        default: 3,
        1024: 2,
        600: 1
    };

    if (error) return <p>Błąd: {error}</p>;

    return (
        <>
            <InfiniteScroll
                dataLength={photos.length}
                next={loadPhotosRef.current}
                hasMore={hasMore}
                loader={<p style={{ textAlign: 'center' }}>Ładowanie...</p>}
                endMessage={<p style={{ textAlign: 'center' }}>Koniec wyników</p>}
                scrollableTarget="gallery-scroll"
                scrollThreshold={0.9}
            >
                <Masonry
                    breakpointCols={breakpointColumnsObj}
                    className="gallery"
                    columnClassName="gallery-column"
                >
                    {photos.map(photo => (
                        <div className="photo" key={photo.id} onClick={() => setSelectedPhoto(photo)}>
                            <img
                                src={`http://localhost:8080${photo.imageUrl}`}
                                alt={`${photo.type} - ${photo.color}`}
                                loading="lazy"
                            />
                        </div>
                    ))}
                </Masonry>
            </InfiniteScroll>

            {selectedPhoto && (
                <PhotoModal
                    photo={selectedPhoto}
                    onClose={() => setSelectedPhoto(null)}
                    onDelete={() => {
                        setPhotoToDelete(selectedPhoto);
                        setSelectedPhoto(null);
                    }}
                    onEdit={() => {
                        setPhotoToEdit(selectedPhoto);
                        setSelectedPhoto(null);
                    }}
                />
            )}

            {photoToDelete && (
                <DeleteConfirmModal
                    onCancel={() => setPhotoToDelete(null)}
                    onConfirm={() => handleDelete(photoToDelete.id)}
                />
            )}

            {photoToEdit && (
                <EditPhotoForm
                    photo={photoToEdit}
                    onClose={() => setPhotoToEdit(null)}
                    onSave={() => loadPhotos(0, true)}
                />
            )}
        </>
    );
}

export default Gallery;
