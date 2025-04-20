import { useEffect } from 'react';
import './PhotoModal.css';
import { Photo } from '../types';
import { isLoggedIn } from '../utils/auth';

interface Props {
    photo: Photo;
    onClose: () => void;
    onDelete?: () => void;
    onEdit?: () => void;
    isEditing?: boolean;
}

function PhotoModal({ photo, onClose, onDelete, onEdit, isEditing = false }: Props) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isEditing) {
                e.preventDefault();
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, isEditing]);

    return (
        <div className="photo-modal-backdrop" onClick={onClose}>
            <div className="photo-modal" onClick={e => e.stopPropagation()}>
                <img src={`http://localhost:8080${photo.imageUrl}`} alt={photo.type} />
                <div className="photo-details">
                    <p><strong>ID:</strong> {photo.id}</p>
                    <p><strong>Typ:</strong> {photo.type}</p>
                    <p><strong>Kolor:</strong> {photo.color}</p>
                    <p><strong>Materiał:</strong> {photo.material}</p>
                    <p><strong>Wysokość:</strong> {photo.height} cm</p>
                    <p><strong>Dodano:</strong> {new Date(photo.createdAt).toLocaleDateString('pl-PL')}</p>
                </div>
                <div className="modal-actions">
                    {isLoggedIn() && onEdit && (
                        <button onClick={onEdit}>Edytuj</button>
                    )}
                    {isLoggedIn() && onDelete && (
                        <button className="danger" onClick={onDelete}>Usuń zdjęcie</button>
                    )}
                    <button onClick={onClose}>Zamknij</button>
                </div>
            </div>
        </div>
    );
}

export default PhotoModal;
