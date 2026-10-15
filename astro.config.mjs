import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// CI sets SITE_URL for each environment. Local builds use the production URL.
export default defineConfig({
  site: process.env.SITE_URL || "https://rockcruit.com",
  integrations: [sitemap()],
});
