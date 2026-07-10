import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://noieo.com"),
  title: {
    default: "NOIEO",
    template: "%s | NOIEO",
  },
  description: "NOIEO는 물리학, 철학, 기독교를 중심으로 지식과 사유를 나누는 한국어 게시판입니다.",
  keywords: ["NOIEO", "물리학", "철학", "기독교", "인문학", "자연과학", "게시판"],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "NOIEO",
    description: "물리학, 철학, 기독교를 중심으로 지식과 사유를 나누는 한국어 게시판입니다.",
    url: "https://noieo.com",
    siteName: "NOIEO",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "NOIEO",
    description: "물리학, 철학, 기독교를 중심으로 지식과 사유를 나누는 한국어 게시판입니다.",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/noieo-psi-v2.ico", sizes: "64x64", type: "image/x-icon" },
      { url: "/noieo-psi-v2-64.png", sizes: "64x64", type: "image/png" },
    ],
    shortcut: "/noieo-psi-v2.ico",
    apple: [
      { url: "/noieo-psi-v2-apple.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
