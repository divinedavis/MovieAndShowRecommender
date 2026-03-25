export type Language = 'en' | 'fr' | 'es' | 'ko' | 'hi' | string;

export interface Translations {
  region: string;
  compare: string;
  netflix: string;
  max: string;
  viewAll: string;
  winnersAndNominees: string;
  topMoviesThisMonth: string;
  mostPopularReleases: string;
  theAbsoluteBestMovies: string;
  trendingShows: string;
  topBoxOffice: string;
  more: string;
  searchRegion: string;
  allRegions: string;
  backToDiscovery: string;
  upcomingReleases: string;
  bestOf: string;
  seoTitle: string;
  seoDesc: string;
  awardsSeoTitle: string;
  awardsSeoDesc: string;
  calendarSeoTitle: string;
  calendarSeoDesc: string;
}

const translations: Record<string, Translations> = {
  en: {
    region: 'Region',
    compare: 'Compare',
    netflix: 'Netflix',
    max: 'Max',
    viewAll: '+ VIEW ALL',
    winnersAndNominees: 'Winners & Nominees',
    topMoviesThisMonth: 'Top 2026 Movies This',
    mostPopularReleases: 'Most Popular Releases in',
    theAbsoluteBestMovies: 'The Absolute Best Movies of the Previous Year',
    trendingShows: 'Trending Shows',
    topBoxOffice: 'Top Box Office in',
    more: 'More',
    searchRegion: 'Search region...',
    allRegions: 'All Regions',
    backToDiscovery: '← BACK TO DISCOVERY',
    upcomingReleases: 'Upcoming Cinematic Releases',
    bestOf: 'Best of',
    seoTitle: 'Movie Recommender - Top Movies & Shows in',
    seoDesc: 'Discover the top box office hits, streaming favorites on Netflix and Max, and award winners in',
    awardsSeoTitle: 'Winners & Nominees in',
    awardsSeoDesc: 'The complete list of movie award winners and nominees for',
    calendarSeoTitle: 'Movies Coming Out in',
    calendarSeoDesc: 'The complete list of every movie release date for'
  },
  fr: {
    region: 'Région',
    compare: 'Comparer',
    netflix: 'Netflix',
    max: 'Max',
    viewAll: '+ VOIR TOUT',
    winnersAndNominees: 'Gagnants et Nominés',
    topMoviesThisMonth: 'Top Films 2026 de ce',
    mostPopularReleases: 'Sorties les Plus Populaires en',
    theAbsoluteBestMovies: 'Les Absolument Meilleurs Films de l\'Année Précédente',
    trendingShows: 'Séries Tendances',
    topBoxOffice: 'Top Box-Office en',
    more: 'Plus',
    searchRegion: 'Rechercher une région...',
    allRegions: 'Toutes les Régions',
    backToDiscovery: '← RETOUR À LA DÉCOUVERTE',
    upcomingReleases: 'Sorties Cinématographiques à Venir',
    bestOf: 'Le meilleur de',
    seoTitle: 'Recommandation de Films - Top Films et Séries en',
    seoDesc: 'Découvrez les plus grands succès du box-office, les favoris du streaming sur Netflix et Max, et les lauréats de prix en',
    awardsSeoTitle: 'Gagnants et Nominés en',
    awardsSeoDesc: 'La liste complète des gagnants et nominés aux prix du cinéma pour',
    calendarSeoTitle: 'Films Sortant en',
    calendarSeoDesc: 'La liste complète de toutes les dates de sortie de films pour'
  },
  es: {
    region: 'Región',
    compare: 'Comparar',
    netflix: 'Netflix',
    max: 'Max',
    viewAll: '+ VER TODO',
    winnersAndNominees: 'Ganadores y Nominados',
    topMoviesThisMonth: 'Mejores Películas de 2026 de este',
    mostPopularReleases: 'Estrenos Más Populares en',
    theAbsoluteBestMovies: 'Las Mejores Películas del Año Anterior',
    trendingShows: 'Series en Tendencia',
    topBoxOffice: 'Top Taquilla en',
    more: 'Más',
    searchRegion: 'Buscar región...',
    allRegions: 'Todas las Regiones',
    backToDiscovery: '← VOLVER AL DESCUBRIMIENTO',
    upcomingReleases: 'Próximos Estrenos Cinematográficos',
    bestOf: 'Lo mejor de',
    seoTitle: 'Recomendador de Películas - Mejores Películas y Series en',
    seoDesc: 'Descubre los éxitos de taquilla, favoritos de streaming en Netflix y Max, y ganadores de premios en',
    awardsSeoTitle: 'Ganadores y Nominados en',
    awardsSeoDesc: 'La lista completa de ganadores y nominados de premios de cine para',
    calendarSeoTitle: 'Películas que se Estrenan en',
    calendarSeoDesc: 'La lista completa de todas las fechas de estreno de películas para'
  },
  ko: {
    region: '지역',
    compare: '비교',
    netflix: '넷플릭스',
    max: '맥스',
    viewAll: '+ 모두 보기',
    winnersAndNominees: '수상작 및 후보작',
    topMoviesThisMonth: '이번 달의 2026년 인기 영화',
    mostPopularReleases: '인기 개봉작 -',
    theAbsoluteBestMovies: '지난해 최고의 영화들',
    trendingShows: '인기 시리즈',
    topBoxOffice: '박스오피스 순위 -',
    more: '더 보기',
    searchRegion: '지역 검색...',
    allRegions: '모든 지역',
    backToDiscovery: '← 디스커버리로 돌아가기',
    upcomingReleases: '개봉 예정작',
    bestOf: '최고의',
    seoTitle: '영화 추천 - 인기 영화 및 시리즈 -',
    seoDesc: '박스오피스 히트작, 넷플릭스 및 맥스 추천작, 주요 시상식 수상작 확인 -',
    awardsSeoTitle: '수상작 및 후보작 -',
    awardsSeoDesc: '영화 시상식 수상 및 후보 전체 리스트 -',
    calendarSeoTitle: '개봉 영화 -',
    calendarSeoDesc: '전체 영화 개봉 일정 확인 -'
  },
  hi: {
    region: 'क्षेत्र',
    compare: 'तुलना करें',
    netflix: 'नेटफ्लिक्स',
    max: 'मैक्स',
    viewAll: '+ सभी देखें',
    winnersAndNominees: 'विजेता और नामांकित',
    topMoviesThisMonth: 'इस महीने की शीर्ष 2026 फिल्में',
    mostPopularReleases: 'सबसे लोकप्रिय रिलीज़ -',
    theAbsoluteBestMovies: 'पिछले वर्ष की सर्वश्रेष्ठ फिल्में',
    trendingShows: 'ट्रेंड잉 शो',
    topBoxOffice: 'बॉक्स ऑफिस -',
    more: 'अधिक',
    searchRegion: 'क्षेत्र खोजें...',
    allRegions: 'सभी क्षेत्र',
    backToDiscovery: '← खोज पर वापस जाएं',
    upcomingReleases: 'आगामी सिनेमाई रिलीज़',
    bestOf: 'सर्वश्रेष्ठ',
    seoTitle: 'मूवी अनुशंसा - शीर्ष फिल्में और शो -',
    seoDesc: 'बॉक्स ऑफिस हिट, नेटफ्लिक्स और मैक्स पर स्ट्रीमिंग पसंदीदा, और पुरस्कार विजेताओं की खोज करें -',
    awardsSeoTitle: 'विजेता और नामांकित -',
    awardsSeoDesc: 'पुरस्कार विजेताओं और नामांकित व्यक्तियों की पूरी सूची -',
    calendarSeoTitle: 'में आने वाली फिल्में -',
    calendarSeoDesc: 'मूवी रिलीज की तारीखों की पूरी सूची -'
  }
};

export function getTranslations(lang: string): Translations {
  const shortLang = lang.split('-')[0];
  return translations[shortLang] || translations.en;
}
