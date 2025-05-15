export function formatHeight(height: number): string {
    return height.toLocaleString('pl-PL', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
        useGrouping: false, // ustaw na true jeśli chcesz spacje tysięczne
    });
}