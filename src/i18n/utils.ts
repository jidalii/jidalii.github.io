import {en} from './en'

const ui: Record<string, Record<string, string>> = { en }

export function useTranslations(lang: string) {
  return function t(key: string) {
    return ui[lang]?.[key] || ui['en']?.[key] || key;
  }
}

export const t = useTranslations('en')
