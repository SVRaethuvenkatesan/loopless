import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Loopless",
    short_name: "Loopless",
    description: "Break the cycle. Keep your calm.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0d",
    theme_color: "#0a0a0d",
    orientation: "portrait",
    scope: "/",
    categories: ["health", "lifestyle", "medical"],
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon-large",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-large",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    shortcuts: [
      {
        name: "Check In",
        short_name: "Check In",
        description: "Log how you're feeling now",
        url: "/checkin",
        icons: [{ src: "/icon.png", sizes: "192x192" }],
      },
      {
        name: "Coping Tools",
        short_name: "Tools",
        description: "Use a coping tool right now",
        url: "/coping",
        icons: [{ src: "/icon.png", sizes: "192x192" }],
      },
    ],
  };
}
