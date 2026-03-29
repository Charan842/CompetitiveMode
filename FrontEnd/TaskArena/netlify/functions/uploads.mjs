import { getStore } from "@netlify/blobs";

export default async (_request, context) => {
  const key = context.params?.splat;
  if (!key) {
    return new Response("Missing upload key", { status: 400 });
  }

  const uploads = getStore("uploads");
  const entry = await uploads.getWithMetadata(key, { type: "arrayBuffer" });

  if (!entry) {
    return new Response("File not found", { status: 404 });
  }

  return new Response(entry.data, {
    headers: {
      "Content-Type": entry.metadata?.contentType || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
};
