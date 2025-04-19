import './Sidebar.css';
import { useEffect, useState } from 'react';

interface FilterProps {
    onChange: (filters: Filters) => void;
}

export interface Filters {
    color?: string;
    type?: string;
    material?: string;
    minHeight?: number;
    maxHeight?: number;
}

function Sidebar({ onChange }: FilterProps) {
    const [colors, setColors] = useState<string[]>([]);
    const [types, setTypes] = useState<string[]>([]);
    const [materials, setMaterials] = useState<string[]>([]);
    const [filters, setFilters] = useState<Filters>({});

    useEffect(() => {
        fetch('http://localhost:8080/api/filters/colors').then(res => res.json()).then(setColors);
        fetch('http://localhost:8080/api/filters/types').then(res => res.json()).then(setTypes);
        fetch('http://localhost:8080/api/filters/materials').then(res => res.json()).then(setMaterials);
    }, []);

    const handleChange = (key: keyof Filters, value: string) => {
        const updated = { ...filters, [key]: value || undefined };
        setFilters(updated);
        onChange(updated);
    };

    return (
        <aside className="sidebar">
            <h2>Filtry</h2>

            <div className="filter-group">
                <label>Kolor</label>
                <select onChange={(e) => handleChange('color', e.target.value)}>
                    <option value="">Wszystkie</option>
                    {colors.map(color => <option key={color}>{color}</option>)}
                </select>
            </div>

            <div className="filter-group">
                <label>Typ</label>
                <select onChange={(e) => handleChange('type', e.target.value)}>
                    <option value="">Wszystkie</option>
                    {types.map(type => <option key={type}>{type}</option>)}
                </select>
            </div>

            <div className="filter-group">
                <label>Materiał</label>
                <select onChange={(e) => handleChange('material', e.target.value)}>
                    <option value="">Wszystkie</option>
                    {materials.map(m => <option key={m}>{m}</option>)}
                </select>
            </div>

            <div className="filter-group">
                <label>Wysokość (min)</label>
                <input
                    type="number"
                    onChange={(e) => handleChange('minHeight', e.target.value)}
                    placeholder="np. 100"
                />
            </div>

            <div className="filter-group">
                <label>Wysokość (max)</label>
                <input
                    type="number"
                    onChange={(e) => handleChange('maxHeight', e.target.value)}
                    placeholder="np. 300"
                />
            </div>
        </aside>
    );
}

export default Sidebar;
