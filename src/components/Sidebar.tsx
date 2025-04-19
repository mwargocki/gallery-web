import './Sidebar.css';

function Sidebar() {
    return (
        <aside className="sidebar">
            <h2>Filtry</h2>
            <div className="filter-group">
                <label>Kolor</label>
                <select><option value="">Wszystkie</option></select>
            </div>
            <div className="filter-group">
                <label>Typ</label>
                <select><option value="">Wszystkie</option></select>
            </div>
            <div className="filter-group">
                <label>Materiał</label>
                <select><option value="">Wszystkie</option></select>
            </div>
            <div className="filter-group">
                <label>Wysokość (min–max)</label>
                <input type="number" placeholder="min" />
                <input type="number" placeholder="max" />
            </div>
        </aside>
    );
}

export default Sidebar;