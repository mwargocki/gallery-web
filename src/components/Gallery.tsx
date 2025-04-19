import { useEffect, useState } from 'react';
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
    const [error, setError] = useState<string | null>(null);
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const [photoToDelete, setPhotoToDelete] = useState<Photo | null>(null);
    const [photoToEdit, setPhotoToEdit] = useState<Photo | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchPhotos = (activeFilters: Filters) => {
        setLoading(true);

        const params = new URLSearchParams();
        if (activeFilters.color) params.append('color', activeFilters.color);
        if (activeFilters.type) params.append('type', activeFilters.type);
        if (activeFilters.material) params.append('material', activeFilters.material);
        if (activeFilters.minHeight) params.append('minHeight', String(activeFilters.minHeight));
        if (activeFilters.maxHeight) params.append('maxHeight', String(activeFilters.maxHeight));
        params.append('page', '0');
        params.append('size', '20');

        fetch(`http://localhost:8080/api/photos?${params.toString()}`)
            .then(response => {
                if (!response.ok) throw new Error('Nie udało się pobrać zdjęć');
                return response.json();
            })
            .then(data => setPhotos(data.content))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchPhotos(filters);
    }, [filters, refreshKey]);

    const handleDelete = (photoId: number) => {
        fetch(`http://localhost:8080/api/photos/${photoId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${getToken()!}`
            },
            credentials: 'include'
        })
            .then(res => {
                if (!res.ok) throw new Error('Błąd podczas usuwania zdjęcia');
                setPhotoToDelete(null);
                setRefreshKey(k => k + 1);
            })
            .catch(err => alert(err.message));
    };

    if (loading) return <p>Ładowanie...</p>;
    if (error) return <p>Błąd: {error}</p>;

    return (
        <>
            <section className="gallery">
                {photos.map(photo => (
                    <div className="photo" key={photo.id}>
                        <img
                            src={`http://localhost:8080${photo.imageUrl}`}
                            alt={`${photo.type} - ${photo.color}`}
                            onClick={() => setSelectedPhoto(photo)}
                        />
                    </div>
                ))}
            </section>

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
                    onSave={() => setRefreshKey(k => k + 1)}
                />
            )}
        </>
    );
}

export default Gallery;
