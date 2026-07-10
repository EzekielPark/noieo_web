export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/en", "/test", "/test/with/"],
        disallow: ["/admin/", "/api/", "/write", "/edit/", "/delete/"],
      },
    ],
    sitemap: "https://noieo.com/sitemap.xml",
    host: "https://noieo.com",
  };
}
