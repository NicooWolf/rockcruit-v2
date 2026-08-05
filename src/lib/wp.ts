// src/lib/wp.ts — the ONLY file in the project allowed to know WordPress exists.
// Build-time WPGraphQL queries. Runs during `astro build`, never in a browser.

const ENDPOINT =
  import.meta.env.WP_GRAPHQL_ENDPOINT ?? "https://cms.rockcruit.com/graphql";

// ── Types ────────────────────────────────────────────────────────────────
// TODO(ACF): extend once the field list arrives (MIGRATION.md open ledger).
// Replace with real GraphQL field names configured in WPGraphQL-for-ACF.
export interface PostAcf {
  // subtitle?: string;
  // readingTime?: number;
}

export interface Post {
  slug: string;
  title: string;
  date: string; // ISO string from WP
  excerpt: string; // HTML
  content?: string; // HTML — fetched only for single posts
  acf?: PostAcf;
}

// ── Internal fetch helper ────────────────────────────────────────────────
async function gql<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    // Fail the BUILD loudly: a failed deploy you get notified about beats a
    // silently empty blog in production.
    throw new Error(`WPGraphQL ${res.status}: ${await res.text()}`);
  }
  const json = await res.json();
  if (json.errors)
    throw new Error(`WPGraphQL errors: ${JSON.stringify(json.errors)}`);
  return json.data as T;
}

// ── Public API ───────────────────────────────────────────────────────────
export async function getAllPosts(): Promise<Post[]> {
  const data = await gql<{ posts: { nodes: Post[] } }>(`
    query AllPosts {
      posts(where: { status: PUBLISH }, first: 100) {
        nodes { slug title date excerpt }
      }
    }
  `);
  return data.posts.nodes;
}
// first:100 is deliberate — cursor pagination gets added HERE (callers unchanged)
// when the post count approaches it. Not before (speculative abstraction).

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const data = await gql<{ post: Post | null }>(
    `
    query PostBySlug($slug: ID!) {
      post(id: $slug, idType: SLUG) {
        slug title date excerpt content
        # TODO(ACF): add the acf field group selection here, e.g.:
        # postFields { subtitle readingTime }
      }
    }
  `,
    { slug },
  );
  return data.post;
}
