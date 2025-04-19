import { useEffect, useState } from 'react';
import './Gallery.css';
import { Photo } from '../types';

function Gallery() {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('http://localhost:8080/api/photos?page=0&size=20')
            .then(response => {
                if (!response.ok) throw new Error('Nie udało się pobrać zdjęć');
                return response.json();
            })
            .then(data => setPhotos(data.content)) // bo Spring Boot zwraca Page<Photo>
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p>Ładowanie...</p>;
    if (error) return <p>Błąd: {error}</p>;

    return (
        <section className="gallery">
            {photos.map(photo => (
                <div className="photo" key={photo.id}>
                    <img src={`http://localhost:8080${photo.imageUrl}`} alt={photo.type} />
                </div>
            ))}
        </section>
    );
}

export default Gallery;
