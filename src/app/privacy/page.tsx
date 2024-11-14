export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 p-8">
      <h1 className="text-3xl font-bold">Privacy Policy</h1>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Data Collection</h2>
        <p className="text-muted-foreground">
          We collect minimal data necessary to provide the Streak Calendar service. This includes:
        </p>
        <ul className="list-disc pl-6 text-muted-foreground">
          <li>Basic account information (email, name)</li>
          <li>Habit tracking data you create</li>
          <li>Usage analytics to improve the service</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Data Usage</h2>
        <p className="text-muted-foreground">
          Your data is used solely to provide and improve the Streak Calendar service. We do not sell or share your
          personal information with third parties.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Data Protection</h2>
        <p className="text-muted-foreground">We implement security measures to protect your data, including:</p>
        <ul className="list-disc pl-6 text-muted-foreground">
          <li>Encryption in transit and at rest</li>
          <li>Secure authentication via Clerk</li>
          <li>Regular security audits</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Your Rights</h2>
        <p className="text-muted-foreground">You have the right to:</p>
        <ul className="list-disc pl-6 text-muted-foreground">
          <li>Access your personal data</li>
          <li>Request data deletion</li>
          <li>Export your data</li>
          <li>Opt out of analytics</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Contact Us</h2>
        <p className="text-muted-foreground">
          For privacy-related questions, please contact us at privacy@streakcalendar.com
        </p>
      </section>

      <footer className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</footer>
    </div>
  );
}
