# Project Overview

Build _Seinfeld Calendar_, a simple habit-tracking tool based on the "Don't Break the Chain" method. Each day you complete a task, mark an X to create an unbroken chain of progress. The growing streak gamifies consistency and keeps you motivated.

Tech Stack: Next.js, Tailwind CSS, Shadcn UI, Convex DB, Clerk Auth

# Core Requirements

The user should be able to:

- Create an account and log in
- Add a habit with a name and a target frequency (e.g., "Exercise" and "3 times per week")
- Mark an X for a habit if they complete it today
- View a calendar view of their habit completion streak

# Documentation

- [Clerk Auth](https://clerk.com/docs)
- [Convex DB](https://www.convex.dev/docs)
- [Shadcn UI](https://ui.shadcn.com/docs)

# File Structure

├── README.md
├── components.json
├── convex
│ ├── \_generated
│ │ ├── api.d.ts
│ │ ├── api.js
│ │ ├── dataModel.d.ts
│ │ ├── server.d.ts
│ │ └── server.js
│ └── auth.config.ts
├── instructions.md
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── public
│ ├── file.svg
│ ├── globe.svg
│ ├── next.svg
│ ├── vercel.svg
│ └── window.svg
├── src
│ ├── app
│ │ ├── favicon.ico
│ │ ├── fonts
│ │ │ ├── GeistMonoVF.woff
│ │ │ └── GeistVF.woff
│ │ ├── globals.css
│ │ ├── layout.tsx
│ │ └── page.tsx
│ ├── components
│ │ └── ui
│ │ └── button.tsx
│ ├── lib
│ │ └── utils.ts
│ └── middleware.ts
├── tailwind.config.ts
└── tsconfig.json
