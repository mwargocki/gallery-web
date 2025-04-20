import { useEffect } from 'react';
import './DeleteConfirmModal.css';

interface Props {
    onConfirm: () => void;
    onCancel: () => void;
}

function DeleteConfirmModal({ onConfirm, onCancel }: Props) {
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
                <h2>Czy na pewno chcesz usunąć to zdjęcie?</h2>
                <div className="delete-modal-actions">
                    <button className="danger" onClick={onConfirm}>Tak, usuń</button>
                    <button onClick={onCancel}>Anuluj</button>
                </div>
            </div>
        </div>
    );
}

export default DeleteConfirmModal;
