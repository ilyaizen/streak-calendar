export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 p-8">
      <h1 className="text-3xl font-bold">About Streak Calendar</h1>

      <section className="space-y-4">
        <p className="text-lg text-muted-foreground">
          Streak Calendar is a simple yet powerful habit tracking tool based on the &quot;Don&apos;t Break the
          Chain&quot; method popularized by Jerry Seinfeld. The concept is simple: mark an X for each day you complete a
          habit, creating an unbroken chain that motivates you to maintain your streak.
        </p>

        <p className="text-lg text-muted-foreground">
          Built with modern web technologies including Next.js, Tailwind CSS, and Convex DB, Streak Calendar helps you
          visualize your progress and stay motivated through:
        </p>

        <ul className="ml-6 list-disc space-y-2 text-muted-foreground">
          <li>Visual calendar view of your habits</li>
          <li>Detailed statistics and insights</li>
          <li>Weekly targets and completion tracking</li>
          <li>Streak counting and milestone tracking</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">How It Works</h2>
        <ol className="ml-6 list-decimal space-y-2 text-muted-foreground">
          <li>Create an account to get started</li>
          <li>Add habits you want to track</li>
          <li>Set weekly frequency targets</li>
          <li>Mark habits complete each day</li>
          <li>Watch your streaks grow!</li>
        </ol>
      </section>

      <section className="rounded-lg border bg-muted/50 p-6">
        <p className="text-center text-sm text-muted-foreground">
          Version 1.0.0 • Created by Ilya Aizenberg • {new Date().getFullYear()}
        </p>
      </section>
    </div>
  );
}
