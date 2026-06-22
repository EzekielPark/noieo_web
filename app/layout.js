import "./globals.css";

export const metadata = {
  title: "NOIEO",
  description: "A minimal glassmorphism community board.",
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
