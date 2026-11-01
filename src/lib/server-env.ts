import "server-only";

/** Server-only secrets. Importing this from a Client Component fails the build. */
export const serverEnv = {
  sanityWriteToken: process.env.SANITY_API_WRITE_TOKEN || "",
  sanityReadToken: process.env.SANITY_API_READ_TOKEN || "",
  revalidateSecret: process.env.SANITY_REVALIDATE_SECRET || "",
  resendApiKey: process.env.RESEND_API_KEY || "",
  notifyEmail: process.env.ENQUIRY_NOTIFY_EMAIL || "",
  fromEmail: process.env.ENQUIRY_FROM_EMAIL || "",
  isProduction: process.env.NODE_ENV === "production",
};
