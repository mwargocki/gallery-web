import './Sidebar.css';
import { useEffect, useState } from 'react';
import {
    Palette,
    Hammer,
    Layers,
    Ruler
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface Filters {
    color?: string;
    type?: string;
    material?: string;
    minHeight?: number;
    maxHeight?: number;
}

interface FilterProps {
    filters: Filters;
    onChange: (filters: Filters) => void;
}

function Sidebar({ filters, onChange }: FilterProps) {
    const [colors, setColors] = useState<string[]>([]);
    const [types, setTypes] = useState<string[]>([]);
    const [materials, setMaterials] = useState<string[]>([]);

    const navigate = useNavigate();

    useEffect(() => {
        fetch('http://localhost:8080/api/filters/colors').then(res => res.json()).then(setColors);
        fetch('http://localhost:8080/api/filters/types').then(res => res.json()).then(setTypes);
        fetch('http://localhost:8080/api/filters/materials').then(res => res.json()).then(setMaterials);
    }, []);

    const handleChange = (key: keyof Filters, value: string) => {
        const updated: Filters = { ...filters, [key]: value || undefined };
        onChange(updated);

        const params = new URLSearchParams();
        if (updated.color) params.set('color', updated.color);
        if (updated.type) params.set('type', updated.type);
        if (updated.material) params.set('material', updated.material);
        if (updated.minHeight) params.set('minHeight', String(updated.minHeight));
        if (updated.maxHeight) params.set('maxHeight', String(updated.maxHeight));

        navigate({ search: params.toString() }, { replace: true });
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-item tight">
                <Palette size={20} />
                <select value={filters.color || ''} onChange={(e) => handleChange('color', e.target.value)}>
                    <option value="">Wszystkie</option>
                    {colors.map(color => <option key={color}>{color}</option>)}
                </select>
            </div>

            <div className="sidebar-item tight">
                <Hammer size={20} />
                <select value={filters.material || ''} onChange={(e) => handleChange('material', e.target.value)}>
                    <option value="">Wszystkie</option>
                    {materials.map(m => <option key={m}>{m}</option>)}
                </select>
            </div>

            <div className="sidebar-item tight">
                <Layers size={20} />
                <select value={filters.type || ''} onChange={(e) => handleChange('type', e.target.value)}>
                    <option value="">Wszystkie</option>
                    {types.map(type => <option key={type}>{type}</option>)}
                </select>
            </div>

            <p className="sidebar-section-title">Wysokość</p>

            <div className="sidebar-item tight">
                <Ruler size={20} />
                <input
                    type="number"
                    placeholder="min (cm)"
                    value={filters.minHeight ?? ''}
                    onChange={(e) => handleChange('minHeight', e.target.value)}
                />
            </div>

            <div className="sidebar-item tight">
                <Ruler size={20} />
                <input
                    type="number"
                    placeholder="max (cm)"
                    value={filters.maxHeight ?? ''}
                    onChange={(e) => handleChange('maxHeight', e.target.value)}
                />
            </div>
        </aside>
    );
}

export default Sidebar;
