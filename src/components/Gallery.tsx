import { useCallback, useEffect, useRef, useState } from 'react';
import Masonry from 'react-masonry-css';
import './Gallery.css';
import { Photo } from '../types';
import PhotoModal from './PhotoModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import EditPhotoForm from './EditPhotoForm';
import { Filters } from './Sidebar';
import { getToken } from '../utils/auth';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

interface GalleryProps {
    filters: Filters;
    setTotalElements: (value: number) => void; // 👈 dodany prop
}

function Gallery({ filters, setTotalElements }: GalleryProps) {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const [photoToDelete, setPhotoToDelete] = useState<Photo | null>(null);
    const [photoToEdit, setPhotoToEdit] = useState<Photo | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);

    const isFetchingRef = useRef(false);
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    const navigate = useNavigate();
    const location = useLocation();
    const { photoId } = useParams();
    const previousLocationRef = useRef<string | null>(null);

    const fetchPhotos = useCallback((pageToLoad: number, reset = false) => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;

        const params = new URLSearchParams();
        if (filters.color) params.append('color', filters.color);
        if (filters.type) params.append('type', filters.type);
        if (filters.material) params.append('material', filters.material);
        if (filters.minHeight) params.append('minHeight', String(filters.minHeight));
        if (filters.maxHeight) params.append('maxHeight', String(filters.maxHeight));
        params.append('page', String(pageToLoad));
        params.append('size', '12');

        fetch(`${process.env.REACT_APP_API_URL}/api/photos?${params.toString()}`)
            .then(res => {
                if (!res.ok) throw new Error('Nie udało się pobrać zdjęć');
                return res.json();
            })
            .then(data => {
                setPhotos(prev => reset ? data.content : [...prev, ...data.content]);
                setHasMore(!data.last);
                setPage(pageToLoad + 1);
                setTotalElements(data.totalElements); // 👈 aktualizacja licznika
            })
            .catch(err => setError(err.message))
            .finally(() => {
                setLoading(false);
                isFetchingRef.current = false;
            });
    }, [filters, setTotalElements]);

    useEffect(() => {
        setPhotos([]);
        setPage(0);
        setHasMore(true);
        fetchPhotos(0, true);
    }, [JSON.stringify(filters), fetchPhotos]);

    useEffect(() => {
        if (!hasMore || loading) return;

        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                fetchPhotos(page);
            }
        });

        if (sentinelRef.current) {
            observer.observe(sentinelRef.current);
        }

        return () => observer.disconnect();
    }, [page, hasMore, loading, fetchPhotos]);

    useEffect(() => {
        if (photoId) {
            fetch(`${process.env.REACT_APP_API_URL}/api/photos/${photoId}`)
                .then(res => {
                    if (!res.ok) throw new Error('Nie znaleziono zdjęcia');
                    return res.json();
                })
                .then(data => setSelectedPhoto(data))
                .catch(err => {
                    alert(err.message);
                    navigate('/photos');
                });
        }
    }, [photoId, navigate]);

    const handleDelete = (photoId: number) => {
        fetch(`${process.env.REACT_APP_API_URL}/api/photos/${photoId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${getToken()!}` },
            credentials: 'include'
        })
            .then(res => {
                if (!res.ok) throw new Error('Błąd podczas usuwania zdjęcia');
                setPhotoToDelete(null);
                setPhotos(prev => prev.filter(p => p.id !== photoId));
                navigate(previousLocationRef.current || '/photos');
                // Po usunięciu zdjęcia odśwież dane
                fetchPhotos(0, true);
            })
            .catch(err => alert(err.message));
    };

    const breakpointColumnsObj = {
        default: 4,
        1024: 3,
        600: 2
    };

    if (loading && photos.length === 0) return <p>Ładowanie...</p>;
    if (error) return <p>Błąd: {error}</p>;

    return (
        <>
            <Masonry
                breakpointCols={breakpointColumnsObj}
                className="gallery"
                columnClassName="gallery-column"
            >
                {photos.map(photo => (
                    <div
                        className="photo"
                        key={photo.id}
                        onClick={() => {
                            if (!previousLocationRef.current) {
                                previousLocationRef.current = location.pathname + location.search;
                            }
                            navigate(`/photos/${photo.id}`);
                        }}
                    >
                        <img
                            src={`${process.env.REACT_APP_API_URL}/api/images/${photo.thumbnail ?? photo.filename}`}
                            alt={`${photo.type} - ${photo.color}`}
                            loading="lazy"
                        />
                    </div>
                ))}
            </Masonry>

            {hasMore && (
                <div ref={sentinelRef} style={{ height: '1px' }} />
            )}

            {selectedPhoto && (
                <PhotoModal
                    photo={selectedPhoto}
                    onClose={() => {
                        setSelectedPhoto(null);
                        navigate(previousLocationRef.current || '/photos');
                        setTimeout(() => {
                            previousLocationRef.current = null;
                        }, 0);
                    }}
                    onDelete={() => {
                        setPhotoToDelete(selectedPhoto);
                    }}
                    onEdit={() => {
                        setPhotoToEdit(selectedPhoto);
                    }}
                    isEditing={!!photoToEdit || !!photoToDelete}
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
                    onClose={() => {
                        setPhotoToEdit(null);
                        if (photoToEdit) {
                            setSelectedPhoto(photoToEdit);
                        }
                    }}
                    onSave={() => fetchPhotos(0, true)}
                />
            )}
        </>
    );
}

export default Gallery;
