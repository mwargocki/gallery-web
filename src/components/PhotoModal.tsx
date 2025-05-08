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
    onPrev?: () => void;
    onNext?: () => void;
}

function PhotoModal({ photo, onClose, onDelete, onEdit, isEditing = false, onPrev, onNext }: Props) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isEditing) {
                e.preventDefault();
                onClose();
            } else if (e.key === 'ArrowLeft' && onPrev && !isEditing) {
                e.preventDefault();
                onPrev();
            } else if (e.key === 'ArrowRight' && onNext && !isEditing) {
                e.preventDefault();
                onNext();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, onPrev, onNext, isEditing]);

    return (
        <div className="photo-modal-backdrop" onClick={onClose}>
            <div className="photo-modal" onClick={e => e.stopPropagation()}>
                {onPrev && <button className="nav-arrow left" onClick={onPrev}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>}
                <img src={`${process.env.REACT_APP_API_URL}/api/images/${photo.filename}`} alt={`Zdjęcie - ${photo.id}`} />
                {onNext && <button className="nav-arrow right" onClick={onNext}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>}

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
