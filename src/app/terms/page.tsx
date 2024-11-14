export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 p-8">
      <h1 className="text-3xl font-bold">Terms of Service</h1>

      <section className="prose dark:prose-invert">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using Streak Calendar, you agree to be bound by these Terms of Service and all applicable
          laws and regulations.
        </p>

        <h2>2. Use License</h2>
        <p>
          Permission is granted to temporarily use Streak Calendar for personal, non-commercial purposes. This is the
          grant of a license, not a transfer of title.
        </p>

        <h2>3. User Data</h2>
        <p>
          You retain all rights to your data. We collect and process data as outlined in our Privacy Policy. You are
          responsible for maintaining the confidentiality of your account.
        </p>

        <h2>4. Service Modifications</h2>
        <p>
          We reserve the right to modify or discontinue Streak Calendar at any time, with or without notice. We shall
          not be liable to you or any third party for any modification, suspension, or discontinuance.
        </p>

        <h2>5. Limitations</h2>
        <p>
          In no event shall Streak Calendar be liable for any damages arising out of the use or inability to use our
          services. We provide the service &quot;as is&quot; without warranties of any kind.
        </p>

        <h2>6. Contact</h2>
        <p>Questions about the Terms of Service should be sent to us at support@streakcalendar.com</p>

        <p className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      </section>
    </div>
  );
}
