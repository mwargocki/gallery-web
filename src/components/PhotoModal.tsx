import { useEffect, useRef } from 'react';
import './PhotoModal.css';
import { Photo } from '../types';
import { isLoggedIn } from '../utils/auth';
import { useTranslation } from 'react-i18next';
import { translateOrFallback } from '../utils/translateOrFallback';
import { Palette, Hammer, Layers, Ruler } from 'lucide-react';

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
    const { t } = useTranslation();
    const backdropRef = useRef<HTMLDivElement>(null);

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

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.target === backdropRef.current) {
            onClose();
        }
    };

    return (
        <div
            className="photo-modal-backdrop"
            ref={backdropRef}
            onMouseDown={handleMouseDown}
        >
            <div className="photo-modal" onClick={e => e.stopPropagation()}>
                {onPrev && (
                    <button className="nav-arrow left" onClick={onPrev}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>
                )}

                <img src={`${process.env.REACT_APP_API_URL}/api/images/${photo.filename}`} alt={t('photo.alt', { id: photo.id })} />

                {onNext && (
                    <button className="nav-arrow right" onClick={onNext}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </button>
                )}

                <div className="photo-details">
                    <p><strong>{t('photo.id')}:</strong> {photo.id}</p>
                    <p><Palette size={16} /><strong>{t('photo.color')}:</strong> {translateOrFallback('color', photo.color)}</p>
                    <p><Layers size={16} /><strong>{t('photo.type')}:</strong> {translateOrFallback('type', photo.type)}</p>
                    <p><Hammer size={16} /><strong>{t('photo.material')}:</strong> {translateOrFallback('material', photo.material)}</p>
                    <p><Ruler size={16} /><strong>{t('photo.height')}:</strong> {photo.height} cm</p>
                    <p><strong>{t('photo.added')}:</strong> {new Date(photo.createdAt).toLocaleDateString('pl-PL')}</p>
                </div>

                <div className="modal-actions">
                    {isLoggedIn() && onEdit && (
                        <button onClick={onEdit}>{t('photo.edit')}</button>
                    )}
                    {isLoggedIn() && onDelete && (
                        <button className="danger" onClick={onDelete}>{t('photo.delete')}</button>
                    )}
                    <button onClick={onClose}>{t('photo.close')}</button>
                </div>
            </div>
        </div>
    );
}

export default PhotoModal;
