import './Sidebar.css';
import { useEffect, useState } from 'react';
import {
    Palette,
    Hammer,
    Layers,
    Ruler,
    Camera
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { usePluralizedPhoto } from '../utils/usePluralizedPhoto';
import { translateOrFallback } from '../utils/translateOrFallback';

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
    totalElements: number;
}

function Sidebar({ filters, onChange, totalElements }: FilterProps) {
    const { t } = useTranslation();
    const pluralizePhoto = usePluralizedPhoto();

    const [colors, setColors] = useState<string[]>([]);
    const [types, setTypes] = useState<string[]>([]);
    const [materials, setMaterials] = useState<string[]>([]);

    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${process.env.REACT_APP_API_URL}/api/filters/colors`).then(res => res.json()).then(setColors);
        fetch(`${process.env.REACT_APP_API_URL}/api/filters/types`).then(res => res.json()).then(setTypes);
        fetch(`${process.env.REACT_APP_API_URL}/api/filters/materials`).then(res => res.json()).then(setMaterials);
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

    const resetFilters = () => {
        onChange({});
        navigate({ search: '' }, { replace: true });
    };

    return (
        <aside className="sidebar">
            <p className="sidebar-section-title">{t('sidebar.attributes')}</p>

            <div className="sidebar-item tight">
                <Palette size={20} />
                <select value={filters.color || ''} onChange={(e) => handleChange('color', e.target.value)}>
                    <option value="">{t('sidebar.color')}</option>
                    {colors.map(color => (
                        <option key={color} value={color}>
                            {translateOrFallback('color', color)}
                        </option>
                    ))}
                </select>
            </div>

            <div className="sidebar-item tight">
                <Hammer size={20} />
                <select value={filters.material || ''} onChange={(e) => handleChange('material', e.target.value)}>
                    <option value="">{t('sidebar.material')}</option>
                    {materials.map(material => (
                        <option key={material} value={material}>
                            {translateOrFallback('material', material)}
                        </option>
                    ))}
                </select>
            </div>

            <div className="sidebar-item tight">
                <Layers size={20} />
                <select value={filters.type || ''} onChange={(e) => handleChange('type', e.target.value)}>
                    <option value="">{t('sidebar.type')}</option>
                    {types.map(type => (
                        <option key={type} value={type}>
                            {translateOrFallback('type', type)}
                        </option>
                    ))}
                </select>
            </div>

            <p className="sidebar-section-title">{t('sidebar.height')}</p>

            <div className="sidebar-item tight">
                <Ruler size={20} />
                <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min="0"
                    max="1000000"
                    placeholder={t('sidebar.min')}
                    value={filters.minHeight ?? ''}
                    onChange={(e) => handleChange('minHeight', e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'e' || e.key === 'E') {
                            e.preventDefault();
                        }
                    }}
                />
            </div>

            <div className="sidebar-item tight">
                <Ruler size={20} />
                <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min="0"
                    max="1000000"
                    placeholder={t('sidebar.max')}
                    value={filters.maxHeight ?? ''}
                    onChange={(e) => handleChange('maxHeight', e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'e' || e.key === 'E') {
                            e.preventDefault();
                        }
                    }}
                />
            </div>

            <button className="reset-button" onClick={resetFilters}>
                {t('sidebar.reset')}
            </button>

            <div className="sidebar-counter">
                <Camera size={18} strokeWidth={1.8} />
                <span>{pluralizePhoto(totalElements)}</span>
            </div>
        </aside>
    );
}

export default Sidebar;
