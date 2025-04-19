import './DeleteConfirmModal.css';

interface Props {
    onConfirm: () => void;
    onCancel: () => void;
}

function DeleteConfirmModal({ onConfirm, onCancel }: Props) {
    return (
        <div className="delete-modal-backdrop" onClick={onCancel}>
            <div className="delete-modal" onClick={e => e.stopPropagation()}>
                <p>Czy na pewno chcesz usunąć to zdjęcie?</p>
                <div className="delete-modal-actions">
                    <button className="danger" onClick={onConfirm}>Tak, usuń</button>
                    <button onClick={onCancel}>Anuluj</button>
                </div>
            </div>
        </div>
    );
}

export default DeleteConfirmModal;
