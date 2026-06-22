export default function manifest() {
  return {
    name: "NOIEO",
    short_name: "NOIEO",
    description: "A minimal glassmorphism community board.",
    start_url: "/",
    display: "standalone",
    background_color: "#111214",
    theme_color: "#111214",
    icons: [
      {
        src: "/noieo-psi-v2-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/noieo-psi-v2-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
