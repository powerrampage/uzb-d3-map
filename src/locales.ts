import type { Locale } from "./types";

/**
 * Region translations for all supported locales
 */
export type RegionTranslations = {
  "uz-cyrl": string;
  "uz-latn": string;
  ru: string;
  en: string;
};

/**
 * Region name translations
 * Key is the region key (e.g., "35", "33", etc.)
 */
export const regionTranslations: Record<string, RegionTranslations> = {
  "35": {
    "uz-cyrl": "Қорақалпоғистон",
    "uz-latn": "Qoraqalpog'iston",
    ru: "Каракалпакстан",
    en: "Karakalpakstan",
  },
  "33": {
    "uz-cyrl": "Хоразм",
    "uz-latn": "Xorazm",
    ru: "Хорезм",
    en: "Khorezm",
  },
  "6": {
    "uz-cyrl": "Бухоро",
    "uz-latn": "Buxoro",
    ru: "Бухара",
    en: "Bukhara",
  },
  "12": {
    "uz-cyrl": "Навоий",
    "uz-latn": "Navoiy",
    ru: "Навои",
    en: "Navoi",
  },
  "18": {
    "uz-cyrl": "Самарқанд",
    "uz-latn": "Samarqand",
    ru: "Самарканд",
    en: "Samarkand",
  },
  "8": {
    "uz-cyrl": "Жиззах",
    "uz-latn": "Jizzax",
    ru: "Джизак",
    en: "Jizzakh",
  },
  "24": {
    "uz-cyrl": "Сирдарё",
    "uz-latn": "Sirdaryo",
    ru: "Сырдарья",
    en: "Sirdaryo",
  },
  "30": {
    "uz-cyrl": "Фарғона",
    "uz-latn": "Farg'ona",
    ru: "Фергана",
    en: "Fergana",
  },
  "3": {
    "uz-cyrl": "Андижон",
    "uz-latn": "Andijon",
    ru: "Андижан",
    en: "Andijan",
  },
  "14": {
    "uz-cyrl": "Наманган",
    "uz-latn": "Namangan",
    ru: "Наманган",
    en: "Namangan",
  },
  "22": {
    "uz-cyrl": "Сурхондарё",
    "uz-latn": "Surxondaryo",
    ru: "Сурхандарья",
    en: "Surkhandarya",
  },
  "10": {
    "uz-cyrl": "Қашқадарё",
    "uz-latn": "Qashqadaryo",
    ru: "Кашкадарья",
    en: "Kashkadarya",
  },
  "27": {
    "uz-cyrl": "Тошкент в.",
    "uz-latn": "Toshkent v.",
    ru: "Ташкент обл.",
    en: "Tashkent Region",
  },
  "26": {
    "uz-cyrl": "Тошкент ш.",
    "uz-latn": "Toshkent sh.",
    ru: "Ташкент г.",
    en: "Tashkent City",
  },
};

/**
 * Get region name for a specific locale
 * @param regionKey - The region key
 * @param locale - The target locale
 * @param fallback - Fallback name if translation not found
 * @returns Translated region name
 */
export function getRegionName(
  regionKey: string,
  locale: Locale,
  fallback?: string
): string {
  const translations = regionTranslations[regionKey];
  if (!translations) {
    return fallback || regionKey;
  }
  return translations[locale] || translations["uz-latn"] || fallback || regionKey;
}

