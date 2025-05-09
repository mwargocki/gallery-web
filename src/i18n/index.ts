import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import pl from './pl.json';
import en from './en.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            pl: { translation: pl },
            en: { translation: en }
        },
        fallbackLng: 'pl',           // jeśli nic nie znaleziono – użyj polskiego
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],  // zapamiętuj język w localStorage
        },
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
