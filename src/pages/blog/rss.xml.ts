// src/pages/blog/rss.xml.ts — RSS feed, generated at build from the same data layer.
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getAllPosts } from '../../lib/wp';

export async function GET(context: APIContext) {
  const posts = await getAllPosts();
  return rss({
    title: 'Rockcruit Blog',
    description: 'Hiring insights from the Rockcruit team.',
    site: context.site!, // from astro.config `site`
    items: posts.map((p) => ({
      title: p.title,
      pubDate: new Date(p.date),
      description: p.excerpt.replace(/<[^>]+>/g, '').trim(),
      link: `/blog/${p.slug}/`
    }))
  });
}
