// src/pages/blog/rss.xml.ts — RSS feed, generated at build from the same data layer.
import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getAllPosts } from "../../lib/wp";
import { href } from "../../lib/url";

export async function GET(context: APIContext) {
  const posts = await getAllPosts();
  return rss({
    title: "Rockcruit Blog",
    description: "Hiring insights from the Rockcruit team.",
    // `site` from astro.config plus the base path.
    site: new URL(href("/"), context.site!).toString(),
    items: posts.map((p) => ({
      title: p.title,
      pubDate: new Date(p.date),
      description: p.excerpt.replace(/<[^>]+>/g, "").trim(),
      link: href(`/blog/${p.slug}/`), // base-aware for GitHub Pages
    })),
  });
}
