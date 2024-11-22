import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

export default function PrivacyPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = useTranslations('privacy');

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-8">
      <h1 className="text-3xl font-bold">{t('title')}</h1>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{t('collection.title')}</h2>
        <p className="text-muted-foreground">{t('collection.content')}</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{t('usage.title')}</h2>
        <p className="text-muted-foreground">{t('usage.content')}</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{t('security.title')}</h2>
        <p className="text-muted-foreground">{t('security.content')}</p>
      </section>
    </div>
  );
}
