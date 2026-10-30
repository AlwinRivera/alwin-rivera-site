/* The public URL, for absolute links in metadata, the sitemap and social previews.
   Set SITE_URL once you have a domain; on Vercel the production URL is used automatically until then. */
export const siteUrl = (
  process.env.SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "");
