import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://rockcruit-v2.github.io",
  integrations: [sitemap()],
});
