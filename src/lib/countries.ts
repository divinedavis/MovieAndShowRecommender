export interface CountryConfig {
  code: string;
  name: string;
  lang: string;
  awardCeremony: string;
}

export const TOP_COUNTRIES: CountryConfig[] = [
  { code: 'US', name: 'United States', lang: 'en-US', awardCeremony: 'The Oscars' },
  { code: 'FR', name: 'France', lang: 'fr-FR', awardCeremony: 'César Awards' },
  { code: 'ES', name: 'Spain', lang: 'es-ES', awardCeremony: 'Goya Awards' },
  { code: 'KR', name: 'South Korea', lang: 'ko-KR', awardCeremony: 'Blue Dragon Film Awards' },
  { code: 'IN', name: 'India', lang: 'hi-IN', awardCeremony: 'Filmfare Awards' },
  { code: 'GB', name: 'United Kingdom', lang: 'en-GB', awardCeremony: 'BAFTA Awards' },
  { code: 'CA', name: 'Canada', lang: 'en-CA', awardCeremony: 'Canadian Screen Awards' },
  { code: 'AU', name: 'Australia', lang: 'en-AU', awardCeremony: 'AACTA Awards' },
  { code: 'DE', name: 'Germany', lang: 'de-DE', awardCeremony: 'German Film Award' },
  { code: 'IT', name: 'Italy', lang: 'it-IT', awardCeremony: 'David di Donatello' },
  { code: 'BR', name: 'Brazil', lang: 'pt-BR', awardCeremony: 'Grande Prêmio do Cinema Brasileiro' },
  { code: 'MX', name: 'Mexico', lang: 'es-MX', awardCeremony: 'Ariel Awards' },
  { code: 'JP', name: 'Japan', lang: 'ja-JP', awardCeremony: 'Japan Academy Film Prize' },
  { code: 'CN', name: 'China', lang: 'zh-CN', awardCeremony: 'Golden Rooster Awards' },
  { code: 'RU', name: 'Russia', lang: 'ru-RU', awardCeremony: 'Nika Award' },
  { code: 'TR', name: 'Turkey', lang: 'tr-TR', awardCeremony: 'Golden Orange Film Festival' },
  { code: 'NL', name: 'Netherlands', lang: 'nl-NL', awardCeremony: 'Golden Calf' },
  { code: 'AR', name: 'Argentina', lang: 'es-AR', awardCeremony: 'Sur Awards' },
  { code: 'SE', name: 'Sweden', lang: 'sv-SE', awardCeremony: 'Guldbagge Awards' },
  { code: 'NO', name: 'Norway', lang: 'no-NO', awardCeremony: 'Amanda Award' },
  { code: 'DK', name: 'Denmark', lang: 'da-DK', awardCeremony: 'Robert Award' },
  { code: 'FI', name: 'Finland', lang: 'fi-FI', awardCeremony: 'Jussi Awards' },
  { code: 'ID', name: 'Indonesia', lang: 'id-ID', awardCeremony: 'Festival Film Indonesia' },
  { code: 'PL', name: 'Poland', lang: 'pl-PL', awardCeremony: 'Polish Film Awards' },
  { code: 'PT', name: 'Portugal', lang: 'pt-PT', awardCeremony: 'Sophia Awards' },
  { code: 'IE', name: 'Ireland', lang: 'en-IE', awardCeremony: 'IFTA Awards' },
  { code: 'NZ', name: 'New Zealand', lang: 'en-NZ', awardCeremony: 'New Zealand Film Awards' },
  { code: 'GR', name: 'Greece', lang: 'el-GR', awardCeremony: 'Hellenic Film Academy Awards' },
  { code: 'CZ', name: 'Czech Republic', lang: 'cs-CZ', awardCeremony: 'Czech Lion Awards' },
  { code: 'BE', name: 'Belgium', lang: 'fr-BE', awardCeremony: 'Magritte Awards' },
  { code: 'CH', name: 'Switzerland', lang: 'de-CH', awardCeremony: 'Swiss Film Award' },
  { code: 'AT', name: 'Austria', lang: 'de-AT', awardCeremony: 'Austrian Film Award' },
  { code: 'IL', name: 'Israel', lang: 'he-IL', awardCeremony: 'Ophir Award' },
  { code: 'ZA', name: 'South Africa', lang: 'en-ZA', awardCeremony: 'SAFTAs' },
  { code: 'EG', name: 'Egypt', lang: 'ar-EG', awardCeremony: 'Cairo International Film Festival' },
  { code: 'NG', name: 'Nigeria', lang: 'en-NG', awardCeremony: 'AMAA' },
  { code: 'TW', name: 'Taiwan', lang: 'zh-TW', awardCeremony: 'Golden Horse Awards' },
  { code: 'HK', name: 'Hong Kong', lang: 'zh-HK', awardCeremony: 'Hong Kong Film Awards' },
  { code: 'MY', name: 'Malaysia', lang: 'ms-MY', awardCeremony: 'Malaysia Film Festival' },
  { code: 'SG', name: 'Singapore', lang: 'en-SG', awardCeremony: 'Star Awards' },
  { code: 'VN', name: 'Vietnam', lang: 'vi-VN', awardCeremony: 'Golden Kite Awards' },
  { code: 'PH', name: 'Philippines', lang: 'tl-PH', awardCeremony: 'FAMAS Awards' },
  { code: 'TH', name: 'Thailand', lang: 'th-TH', awardCeremony: 'Suphannahong National Film Awards' },
  { code: 'CO', name: 'Colombia', lang: 'es-CO', awardCeremony: 'Macondo Awards' },
  { code: 'CL', name: 'Chile', lang: 'es-CL', awardCeremony: 'Caleuche Awards' },
  { code: 'PE', name: 'Peru', lang: 'es-PE', awardCeremony: 'Peruvian Film Awards' },
  { code: 'PK', name: 'Pakistan', lang: 'ur-PK', awardCeremony: 'Lux Style Awards' },
  { code: 'IR', name: 'Iran', lang: 'fa-IR', awardCeremony: 'Fajr International Film Festival' },
  { code: 'UA', name: 'Ukraine', lang: 'uk-UA', awardCeremony: 'Golden Dzyga' },
  { code: 'RO', name: 'Romania', lang: 'ro-RO', awardCeremony: 'Gopo Awards' }
];

export function getCountryByCode(code: string): CountryConfig {
  return TOP_COUNTRIES.find(c => c.code.toLowerCase() === code.toLowerCase()) || TOP_COUNTRIES[0];
}

export function getCountryByLang(lang: string): CountryConfig {
  const shortLang = lang.split('-')[0];
  return TOP_COUNTRIES.find(c => c.lang.startsWith(shortLang)) || TOP_COUNTRIES[0];
}
