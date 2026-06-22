import Link from "next/link";
import Image from "next/image";

export default function Home() {
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
              <Link className="enter-link" href="/test/">
                <Image
                  className="enter-sign"
                  src="/enter-sign.png"
                  alt="Enter board"
                  width={225}
                  height={225}
                />
              </Link>
            </div>
            <p className="landing-quote">
              {"\uC778\uB958\uC758 \uC5ED\uC0AC\uB294 \uC778\uC815 \uD22C\uC7C1\uC758 \uC5ED\uC0AC\uB2E4."}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
