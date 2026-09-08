// src/lib/wp.ts — the ONLY file in the project allowed to know WordPress exists.
// Build-time WPGraphQL queries. Runs during `astro build`, never in a browser.

const ENDPOINT =
  import.meta.env.WP_GRAPHQL_ENDPOINT ?? "https://rblog.rockcruit.com/graphql";

// Build-time kill switch. Set WP_ENABLED=false to build without WordPress:
// blog list renders its empty state, zero post pages generate, RSS is empty.
// Any other value (or unset) = WP required, and failures still kill the build loudly.
export const WP_ENABLED = import.meta.env.WP_ENABLED !== "false";

// ── Types ────────────────────────────────────────────────────────────────
// The owner confirmed these ACF groups on rblog.rockcruit.com:
//   Post group  = postFields   (postImage, subtitle, description,
//                               readingTime, author)
//   Author group = authorFields (firstName, lastName, profilePhoto,
//                               role, linkedin, email)
// WPGraphQL-for-ACF exposes each snake_case field as camelCase.
// TODO(ACF): the field list is still not final. Confirm categories, tags,
// and media subfields (altText) before you rely on them.

// A WPGraphQL media field returns one connected node.
export interface MediaField {
  node: {
    sourceUrl: string;
    altText?: string;
  } | null;
}

// One Author custom post, joined through the post `author` relation.
export interface AuthorFields {
  // The first-name field is exposed as `name` in WPGraphQL (see the old
  // Apollo query). The ACF slug is first_name, but the GraphQL name is `name`.
  name?: string;
  lastName?: string;
  role?: string;
  linkedin?: string;
  email?: string;
  profilePhoto?: MediaField | null;
}

export interface PostFields {
  subtitle?: string;
  description?: string;
  readingTime?: number;
  postImage?: MediaField | null;
  author?: { nodes: { authorFields?: AuthorFields }[] } | null;
}

export interface Post {
  slug: string;
  title: string;
  date: string; // ISO string from WP
  excerpt: string; // HTML
  content?: string; // HTML — fetched only for single posts
  postFields?: PostFields;
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

// ── Shared selection ───────────────────────────────────────────────────────
// One place holds the ACF selection. Both queries reuse it. A field change
// happens here one time. (See the old Apollo GET_ALL_POSTS query for the shape.)
const POST_FIELDS_SELECTION = `
  postFields {
    subtitle
    description
    readingTime
    postImage { node { sourceUrl altText } }
    author {
      nodes {
        ... on Author {
          authorFields {
            name
            lastName
            role
            linkedin
            email
            profilePhoto { node { sourceUrl altText } }
          }
        }
      }
    }
  }
`;

// ── Public API ───────────────────────────────────────────────────────────
export async function getAllPosts(): Promise<Post[]> {
  if (!WP_ENABLED) return [];
  const data = await gql<{ posts: { nodes: Post[] } }>(`
    query AllPosts {
      posts(where: { status: PUBLISH }, first: 100) {
        nodes {
          slug
          title
          date
          excerpt
          ${POST_FIELDS_SELECTION}
        }
      }
    }
  `);
  return data.posts.nodes;
}
// first:100 is deliberate — cursor pagination gets added HERE (callers unchanged)
// when the post count approaches it. Not before (speculative abstraction).

export async function getPostBySlug(slug: string): Promise<Post | null> {
  if (!WP_ENABLED) return null;
  const data = await gql<{ post: Post | null }>(
    `
    query PostBySlug($slug: ID!) {
      post(id: $slug, idType: SLUG) {
        slug
        title
        date
        excerpt
        content
        ${POST_FIELDS_SELECTION}
      }
    }
  `,
    { slug },
  );
  return data.post;
}
