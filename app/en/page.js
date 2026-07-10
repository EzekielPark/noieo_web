import Link from "next/link";
import Image from "next/image";
import { getTranslateUrl } from "../lib/i18n";

export const metadata = {
  title: "NOIEO in English",
  description: "NOIEO is a Korean board for physics, philosophy, and Christianity.",
  alternates: {
    canonical: "/en",
    languages: {
      ko: "/",
      en: "/en",
    },
  },
  openGraph: {
    title: "NOIEO in English",
    description: "A Korean board for physics, philosophy, and Christianity.",
    url: "https://noieo.com/en",
    siteName: "NOIEO",
    locale: "en_US",
    type: "website",
  },
};

export default function EnglishHome() {
  return (
    <div className="page-shell">
      <div className="page-container">
        <div className="landing-wrap">
          <section className="landing-panel">
            <h1 className="brand-title">NOIEO</h1>
            <div className="landing-image-wrap">
              <Image
                className="landing-image"
                src="/main-portrait.png"
                alt="NOIEO main portrait"
                width={960}
                height={726}
                priority
              />
              <a className="enter-link" href={getTranslateUrl("/test/")} target="_blank" rel="noreferrer">
                <Image
                  className="enter-sign"
                  src="/enter-sign.png"
                  alt="Enter board"
                  width={225}
                  height={225}
                />
              </a>
            </div>
            <p className="landing-quote">The history of humanity is the history of the struggle for recognition.</p>
            <nav className="language-switch" aria-label="Language">
              <Link className="language-switch__item" href="/">
                KR
              </Link>
              <span className="language-switch__item is-active">EN</span>
            </nav>
          </section>
        </div>
      </div>
    </div>
  );
}
