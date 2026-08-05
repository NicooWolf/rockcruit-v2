import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://www.rockcruit.com",
  integrations: [sitemap()],
});
