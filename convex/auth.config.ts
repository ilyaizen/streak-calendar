const authConfig = {
  providers: [
    {
      domain: process.env.CLERK_DOMAIN ?? 'https://clerk.streakcalendar.com/',
      applicationID: 'convex',
    },
  ],
};

export default authConfig;
