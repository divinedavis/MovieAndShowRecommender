import { getMediaData } from '@/lib/tmdb';
import Home from '../page';

interface Props {
  params: Promise<{ lang: string }>;
}

export default async function MultilingualHome({ params }: Props) {
  const { lang } = await params;
  // This wraps the original Home component but passes the language parameter to fetchers
  return <Home lang={lang} />;
}
