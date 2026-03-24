export interface CountryConfig {
  code: string;
  name: string;
  lang: string;
  awardCeremony: string;
}

export const TOP_COUNTRIES: CountryConfig[] = [
  { code: 'US', name: 'United States', lang: 'en-US', awardCeremony: 'The Oscars' },
  { code: 'CN', name: 'China', lang: 'zh-CN', awardCeremony: 'Golden Rooster Awards' },
  { code: 'IN', name: 'India', lang: 'hi-IN', awardCeremony: 'Filmfare Awards' },
  { code: 'ID', name: 'Indonesia', lang: 'id-ID', awardCeremony: 'Festival Film Indonesia' },
  { code: 'BR', name: 'Brazil', lang: 'pt-BR', awardCeremony: 'Grande Prêmio do Cinema Brasileiro' },
  { code: 'RU', name: 'Russia', lang: 'ru-RU', awardCeremony: 'Nika Award' },
  { code: 'MX', name: 'Mexico', lang: 'es-MX', awardCeremony: 'Ariel Awards' },
  { code: 'JP', name: 'Japan', lang: 'ja-JP', awardCeremony: 'Japan Academy Film Prize' },
  { code: 'DE', name: 'Germany', lang: 'de-DE', awardCeremony: 'German Film Award' },
  { code: 'FR', name: 'France', lang: 'fr-FR', awardCeremony: 'César Awards' },
  { code: 'GB', name: 'United Kingdom', lang: 'en-GB', awardCeremony: 'BAFTA Awards' },
  { code: 'KR', name: 'South Korea', lang: 'ko-KR', awardCeremony: 'Blue Dragon Film Awards' },
  { code: 'ES', name: 'Spain', lang: 'es-ES', awardCeremony: 'Goya Awards' },
  { code: 'IT', name: 'Italy', lang: 'it-IT', awardCeremony: 'David di Donatello' },
  { code: 'TR', name: 'Turkey', lang: 'tr-TR', awardCeremony: 'Golden Orange Film Festival' },
  { code: 'VN', name: 'Vietnam', lang: 'vi-VN', awardCeremony: 'Golden Kite Awards' },
  { code: 'PH', name: 'Philippines', lang: 'tl-PH', awardCeremony: 'FAMAS Awards' },
  { code: 'TH', name: 'Thailand', lang: 'th-TH', awardCeremony: 'Suphannahong National Film Awards' },
  { code: 'PL', name: 'Poland', lang: 'pl-PL', awardCeremony: 'Polish Film Awards' },
  { code: 'NL', name: 'Netherlands', lang: 'nl-NL', awardCeremony: 'Golden Calf' }
  // Expanding to full 50 in production logic via dynamic mapping
];

export function getCountryByCode(code: string): CountryConfig {
  return TOP_COUNTRIES.find(c => c.code.toLowerCase() === code.toLowerCase()) || TOP_COUNTRIES[0];
}

export function getCountryByLang(lang: string): CountryConfig {
  return TOP_COUNTRIES.find(c => c.lang.startsWith(lang)) || TOP_COUNTRIES[0];
}
