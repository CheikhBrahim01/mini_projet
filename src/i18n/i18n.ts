import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

const resources = {
  en: { translation: require('./locales/en.json') },
  fr: { translation: require('./locales/fr.json') },
  ar: { translation: require('./locales/ar.json') },
};

// Get device language and validate it
const deviceLanguage = Localization.locale?.split('-')[0] || 'en';
const supportedLanguages = ['en', 'fr', 'ar'];
const initialLanguage = supportedLanguages.includes(deviceLanguage) ? deviceLanguage : 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;