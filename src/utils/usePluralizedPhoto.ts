import { useTranslation } from 'react-i18next';

export function usePluralizedPhoto() {
    const { t } = useTranslation();

    return (count: number): string => {
        const lastDigit = count % 10;
        const lastTwoDigits = count % 100;

        let key: string;

        if (count === 0) {
            key = 'counter.count_0';
        } else if (count === 1) {
            key = 'counter.count_1';
        } else if ([2, 3, 4].includes(lastDigit) && ![12, 13, 14].includes(lastTwoDigits)) {
            key = 'counter.count_234';
        } else {
            key = 'counter.count_other';
        }

        return `${count} ${t(key)}`;
    };
}
