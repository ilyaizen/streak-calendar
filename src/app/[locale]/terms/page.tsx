import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

export default function TermsPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  const t = useTranslations("terms");

  return (
    <div className="mx-auto max-w-3xl space-y-8 p-8">
      <h1 className="text-3xl font-bold">{t("title")}</h1>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{t("acceptance.title")}</h2>
        <p className="text-muted-foreground">{t("acceptance.content")}</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{t("license.title")}</h2>
        <p className="text-muted-foreground">{t("license.content")}</p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">{t("userData.title")}</h2>
        <p className="text-muted-foreground">{t("userData.content")}</p>
      </section>
    </div>
  );
}
