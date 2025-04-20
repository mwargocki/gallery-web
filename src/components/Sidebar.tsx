import './Sidebar.css';
import { useEffect, useState } from 'react';
import {
    Palette,
    Hammer,
    Layers,
    Ruler
} from 'lucide-react';

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
            <p className="sidebar-section-title">Atrybuty</p>

            <div className="sidebar-item tight">
                <Palette size={20} />
                <select onChange={(e) => handleChange('color', e.target.value)}>
                    <option value="">Kolor</option>
                    {colors.map(color => <option key={color}>{color}</option>)}
                </select>
            </div>

            <div className="sidebar-item tight">
                <Hammer size={20} />
                <select onChange={(e) => handleChange('material', e.target.value)}>
                    <option value="">Materiał</option>
                    {materials.map(m => <option key={m}>{m}</option>)}
                </select>
            </div>

            <div className="sidebar-item tight">
                <Layers size={20} />
                <select onChange={(e) => handleChange('type', e.target.value)}>
                    <option value="">Typ</option>
                    {types.map(type => <option key={type}>{type}</option>)}
                </select>
            </div>

            <p className="sidebar-section-title">Wysokość</p>

            <div className="sidebar-item tight">
                <Ruler size={20} />
                <input
                    type="number"
                    placeholder="min (cm)"
                    onChange={(e) => handleChange('minHeight', e.target.value)}
                />
            </div>

            <div className="sidebar-item tight">
                <Ruler size={20} />
                <input
                    type="number"
                    placeholder="max (cm)"
                    onChange={(e) => handleChange('maxHeight', e.target.value)}
                />
            </div>
        </aside>
    );
}

export default Sidebar;
