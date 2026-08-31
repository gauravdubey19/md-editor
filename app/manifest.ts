import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Markdown Studio | Edit, Format & Context Sharing",
    short_name: "Markdown Studio",
    description:
      "A modern, bidirectional Markdown editor and interactive live preview studio with synchronized scrolling, time-limited context sharing (TTL), and shadcn/ui.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
