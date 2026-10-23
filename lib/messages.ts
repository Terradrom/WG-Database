// Every user-facing string lives here so a translation can be added later.
export const messages = {
  app: {
    name: "Team Knowledge Base",
    description: "Instructions, guidelines and rules for the team.",
  },
  login: {
    title: "Sign in",
    subtitle: "Use the email address your invitation was sent to.",
    email: "Email",
    emailPlaceholder: "name@example.com",
    password: "Password",
    submit: "Sign in",
    magicLink: "Email me a sign-in link",
    forgotPassword: "Forgot password?",
    or: "or",
    inviteOnly: "Accounts are by invitation only. Ask an admin if you need access.",
    notReady: "Sign-in opens in the next build step. This page is a preview.",
  },
} as const;
