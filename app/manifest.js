export default function manifest() {
  return {
    name: "NOIEO",
    short_name: "NOIEO",
    description: "물리학, 철학, 기독교를 중심으로 지식과 사유를 나누는 한국어 게시판입니다.",
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
