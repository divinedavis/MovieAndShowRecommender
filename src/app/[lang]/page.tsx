import { Metadata } from 'next';
import { generateMetadata as baseGenerateMetadata } from '../page';
import Home from '../page';

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return baseGenerateMetadata({ lang });
}

export default async function MultilingualHome({ params }: Props) {
  const { lang } = await params;
  return <Home lang={lang} />;
}
