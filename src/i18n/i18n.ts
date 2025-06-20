import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

const resources = {
  en: { translation: require('./locales/en.json') },
  fr: { translation: require('./locales/fr.json') },
  ar: { translation: require('./locales/ar.json') },
};

const deviceLanguage = Localization.locale?.split('-')[0] || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: deviceLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
