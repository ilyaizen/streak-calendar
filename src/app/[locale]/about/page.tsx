import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

export default function AboutPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = useTranslations('about');

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-8">
      <h1 className="text-3xl font-bold">{t('title')}</h1>

      <section className="space-y-4">
        <p className="text-lg text-muted-foreground">{t('description')}</p>
        <p className="text-lg text-muted-foreground">{t('features.description')}</p>
        <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
          {['calendar', 'tracking', 'streaks', 'themes'].map((feature) => (
            <li key={feature}>{t(`features.list.${feature}`)}</li>
          ))}
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">{t('howItWorks.title')}</h2>
        <ol className="ml-6 list-decimal space-y-2 text-muted-foreground">
          {['step1', 'step2', 'step3', 'step4', 'step5'].map((step) => (
            <li key={step}>{t(`howItWorks.steps.${step}`)}</li>
          ))}
        </ol>
      </section>
    </div>
  );
}
