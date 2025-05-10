import { t } from 'i18next';

/**
 * Tłumaczy wartość z danej kategorii, np. color.red → Czerwony.
 * Jeśli tłumaczenia brak, zwraca oryginalną wartość.
 */
export function translateOrFallback(category: string, value: string): string {
    const key = `${category}.${value}`;
    const translated = (t as any)(key); // 👈 tu rzutowanie
    return translated === key ? value : translated;
}
