export const href = (path: string): string => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const internalPath = path.startsWith("/") ? path : `/${path}`;

  return `${base}${internalPath}`;
};
