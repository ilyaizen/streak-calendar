export default {
  providers: [
    {
      domain: process.env.CLERK_DOMAIN ?? 'https://clerk.streakcalendar.com',
      applicationID: 'convex',
    },
  ],
};
