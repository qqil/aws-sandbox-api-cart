export const ensureTrailingSlash = (url: string) => {
  if (url.substring(url.length - 1) === '/') return url;

  return `${url}/`;
};
