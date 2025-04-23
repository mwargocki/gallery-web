export function pluralizePhoto(count: number): string {
    if (count === 1) return '1 zdjęcie';
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;

    if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) {
        return `${count} zdjęcia`;
    }

    return `${count} zdjęć`;
}