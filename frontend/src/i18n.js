import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import esTranslations from './locales/es.json'
import enTranslations from './locales/en.json'

const resources = {
  es: {
    translation: esTranslations
  },
  en: {
    translation: enTranslations
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es', // Spanish as default language
    fallbackLng: 'en',
    
    interpolation: {
      escapeValue: false // React already does escaping
    }
  })

export default i18n