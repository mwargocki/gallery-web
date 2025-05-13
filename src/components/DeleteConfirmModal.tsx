import { useEffect, useRef } from 'react';
import './DeleteConfirmModal.css';
import { useTranslation } from 'react-i18next';

interface Props {
    onConfirm: () => void;
    onCancel: () => void;
}

function DeleteConfirmModal({ onConfirm, onCancel }: Props) {
    const { t } = useTranslation();
    const backdropRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onCancel();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onCancel]);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.target === backdropRef.current) {
            onCancel();
        }
    };

    return (
        <div
            className="delete-modal-backdrop"
            ref={backdropRef}
            onMouseDown={handleMouseDown}
        >
            <div className="delete-modal" onClick={e => e.stopPropagation()}>
                <h2>{t('deleteConfirm.title')}</h2>
                <div className="delete-modal-actions">
                    <button className="danger" onClick={onConfirm}>{t('deleteConfirm.confirm')}</button>
                    <button onClick={onCancel}>{t('deleteConfirm.cancel')}</button>
                </div>
            </div>
        </div>
    );
}

export default DeleteConfirmModal;
