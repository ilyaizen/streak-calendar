import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t dark:border-gray-800">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
            <Link href="/about" className="hover:text-gray-900 dark:hover:text-gray-200">
              About
            </Link>
            <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-gray-200">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-gray-900 dark:hover:text-gray-200">
              Terms
            </Link>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">© 2024 Streak Calendar</p>
        </div>
      </div>
    </footer>
  );
}
