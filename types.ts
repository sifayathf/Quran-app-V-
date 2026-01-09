
export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  text: string;
  translatedText?: string;
  numberInSurah: number;
  juz: number;
  surahName?: string;
}

export type HadithGrading = 'Sahih' | 'Hasan' | 'Da\'if' | 'Mawdu' | 'Unknown';

export interface Hadith {
  id: string;
  collection: string;
  bookNumber: string;
  hadithNumber: string;
  arabicText: string;
  englishText: string;
  tamilText?: string;
  grading: HadithGrading;
  gradedBy?: string;
  isnad?: string;
  chapterTitle?: string;
}

export type CollectionCategory = 'Primary' | 'Fiqh' | 'Grading' | 'Moral';

export interface CollectionMetadata {
  id: string;
  name: string;
  description: string;
  totalHadiths: number;
  category: CollectionCategory;
  colorTheme: string;
}

export type ArabicFontStyle = 'majeedi' | 'naskh' | 'amiri';
export type TranslationLang = 'en' | 'ta';

export enum AppView {
  HOME = 'home',
  QURAN_LIST = 'quran_list',
  SURAH_DETAIL = 'surah_detail',
  HADITH_COLLECTIONS = 'hadith_collections',
  HADITH_LIST = 'hadith_list',
  SEARCH = 'search',
  ISNAD_ANALYZER = 'isnad_analyzer',
  BOOKS_EXPLORER = 'books_explorer'
}
