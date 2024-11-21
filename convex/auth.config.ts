const authConfig = {
  providers: [
    {
      domain: process.env.CLERK_DOMAIN ?? 'https://clerk.streakcalendar.com',
      applicationID: 'convex',
      issuer: process.env.CLERK_DOMAIN ?? 'https://clerk.streakcalendar.com',
    },
  ],
};

export default authConfig;
