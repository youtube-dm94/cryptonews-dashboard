
export enum LanguageCode {
  RU = 'RU',
  CN = 'CN',
  JP = 'JP',
  KR = 'KR',
  ES = 'ES',
  PT = 'PT',
  TR = 'TR',
  EN = 'EN',
  VN = 'VN',
  AR = 'AR',
  EU = 'EU'
}

export const LanguageNames: Record<LanguageCode, string> = {
  [LanguageCode.RU]: 'Russian',
  [LanguageCode.CN]: 'Chinese',
  [LanguageCode.JP]: 'Japanese',
  [LanguageCode.KR]: 'Korean',
  [LanguageCode.ES]: 'Spanish',
  [LanguageCode.PT]: 'Portuguese',
  [LanguageCode.TR]: 'Turkish',
  [LanguageCode.EN]: 'English',
  [LanguageCode.VN]: 'Vietnamese',
  [LanguageCode.AR]: 'Arabic',
  [LanguageCode.EU]: 'European (German/French)'
};

export interface NewsItem {
  id: string;
  date: string;
  language: LanguageCode;
  headlineOriginal: string;
  headlineEnglish: string;
  link: string;
  source: string;
}

export interface NewsState {
  items: NewsItem[];
  isLoading: boolean;
  lastUpdated: string | null;
  activeLanguage: LanguageCode | 'ALL';
}
