// Gallery.tsx (poprawka: blokowanie wielokrotnych zapytań przy tym samym page)
import { useEffect, useState, useRef, useCallback } from 'react';
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
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const [photoToDelete, setPhotoToDelete] = useState<Photo | null>(null);
    const [photoToEdit, setPhotoToEdit] = useState<Photo | null>(null);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const lastFetchedPage = useRef<number | null>(null);

    const observer = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const fetchPhotos = useCallback((pageToLoad: number, reset = false) => {
        if (!reset && lastFetchedPage.current === pageToLoad) return;
        lastFetchedPage.current = pageToLoad;

        const params = new URLSearchParams();
        if (filters.color) params.append('color', filters.color);
        if (filters.type) params.append('type', filters.type);
        if (filters.material) params.append('material', filters.material);
        if (filters.minHeight) params.append('minHeight', String(filters.minHeight));
        if (filters.maxHeight) params.append('maxHeight', String(filters.maxHeight));
        params.append('page', String(pageToLoad));
        params.append('size', '12');

        const url = `http://localhost:8080/api/photos?${params.toString()}`;

        if (reset) setLoading(true);
        else setLoadingMore(true);

        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error('Nie udało się pobrać zdjęć');
                return res.json();
            })
            .then(data => {
                const newPhotos = data.content;
                setPhotos(prev => reset ? newPhotos : [...prev, ...newPhotos]);
                setHasMore(!data.last);
                if (reset) {
                    setPage(1);
                } else {
                    setPage(prev => prev + 1);
                }
            })
            .catch(err => setError(err.message))
            .finally(() => {
                setLoading(false);
                setLoadingMore(false);
            });
    }, [filters]);

    useEffect(() => {
        setPhotos([]);
        setPage(0);
        setHasMore(true);
        lastFetchedPage.current = null;
        setError(null);
        setSelectedPhoto(null);
        setPhotoToDelete(null);
        setPhotoToEdit(null);
        fetchPhotos(0, true);
    }, [filters, fetchPhotos]);

    useEffect(() => {
        if (!hasMore || loadingMore || loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                fetchPhotos(page);
            }
        });

        if (loadMoreRef.current) {
            observer.current.observe(loadMoreRef.current);
        }
    }, [fetchPhotos, hasMore, loadingMore, loading, page]);

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

    if (loading) return <p>Ładowanie...</p>;
    if (error) return <p>Błąd: {error}</p>;

    return (
        <>
            <div className="gallery">
                {photos.map(photo => (
                    <div className="photo" key={photo.id} onClick={() => setSelectedPhoto(photo)}>
                        <img
                            src={`http://localhost:8080${photo.imageUrl}`}
                            alt={`${photo.type} - ${photo.color}`}
                        />
                    </div>
                ))}
                <div ref={loadMoreRef} style={{ height: '1px' }}></div>
            </div>

            {loadingMore && <p style={{ textAlign: 'center' }}>Ładowanie kolejnych zdjęć...</p>}

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
                    onSave={() => fetchPhotos(0, true)}
                />
            )}
        </>
    );
}

export default Gallery;
