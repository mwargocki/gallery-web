import { useEffect } from 'react';
import './DeleteConfirmModal.css';
import { useTranslation } from 'react-i18next';

interface Props {
    onConfirm: () => void;
    onCancel: () => void;
}

function DeleteConfirmModal({ onConfirm, onCancel }: Props) {
    const { t } = useTranslation();

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

    return (
        <div className="delete-modal-backdrop" onClick={onCancel}>
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
