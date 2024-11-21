# Streak Calendar

**Streak Calendar** is a habit-tracking tool inspired by the "Don't Break the Chain" method. It helps users build better routines and stay motivated by visualizing their progress as unbroken chains.

## Features

- **Account Management**: Secure authentication with Clerk.
- **Habit Tracking**: Add habits, set weekly frequency targets, and mark daily completions.
- **Visual Streaks**: View your progress through a calendar interface.
- **Milestone Tracking**: Monitor your longest and current streaks.
- **Customizable Themes**: Personalize calendars with color themes.

## Tech Stack

- **Framework**: Next.js
- **Styling**: Tailwind CSS, Shadcn UI
- **Backend**: Convex
- **Authentication**: Clerk

## Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/ilyaizen/streak-calendar.git
   cd streak-calendar
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables in `.env.local`:

   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_CONVEX_URL`

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Visit `http://localhost:3000` to view the application.

## Project Structure

```plaintext
├── src
│   ├── app                # Next.js app directory
│   ├── components         # Reusable UI components
│   ├── lib                # Utility functions
│   ├── middleware.ts      # Next.js middleware
├── convex                 # Backend logic with Convex
├── public                 # Static assets
├── README.md              # Project documentation
├── LICENSE                # License file
└── package.json           # Project metadata and dependencies
```

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests on the [GitHub repository](https://github.com/ilyaizen/streak-calendar).

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Happy tracking! 🎯
