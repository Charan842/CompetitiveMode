export const isNetlifyRuntime = () =>
  process.env.NETLIFY === "true" || process.env.NETLIFY_LOCAL === "true";
