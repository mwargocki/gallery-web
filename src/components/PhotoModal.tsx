import './PhotoModal.css';
import { Photo } from '../types';
import { isLoggedIn } from '../utils/auth';

interface Props {
    photo: Photo;
    onClose: () => void;
    onDelete?: () => void;
}

function PhotoModal({ photo, onClose, onDelete }: Props) {
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <img src={`http://localhost:8080${photo.imageUrl}`} alt={photo.type} />
                <div className="photo-details">
                    <p><strong>Typ:</strong> {photo.type}</p>
                    <p><strong>Kolor:</strong> {photo.color}</p>
                    <p><strong>Materiał:</strong> {photo.material}</p>
                    <p><strong>Wysokość:</strong> {photo.height} cm</p>
                    <p><strong>Dodano:</strong> {new Date(photo.createdAt).toLocaleDateString('pl-PL')}</p>
                </div>
                <div className="modal-actions">
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
