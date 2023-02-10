import { createWriteStream } from "fs";
import { SitemapStream } from "sitemap";

// Creates a sitemap object given the input configuration with URLs
const sitemap = new SitemapStream({
  hostname: "https://www.clothingloop.org",
  readableObjectMode: true,
});

const writeStream = createWriteStream("./build/sitemap.xml");
sitemap.pipe(writeStream);

function i18nUrl(url) {
  return {
    url: url,
    links: ["en", "nl", "fr", "sv"].map((lng) => ({
      lang: lng,
      url: `/${lng}${url}`,
    })),
  };
}

sitemap.write({ ...i18nUrl(`/`), changefreq: "daily", priority: 0.8 });
sitemap.write({
  ...i18nUrl(`/about`),
  changefreq: "daily",
  priority: 0.5,
  video: [
    {
      thumbnail_loc:
        "https://i.vimeocdn.com/video/1365223845-cfaad9880ed58dede1afa1a48a496352ccf41cb45fec29bea76edb20eb36b0e4-d?mw=500&mh=282",
      title: "What is the Clothing Loop",
      description:
        "The Clothing Loop is an initiative that offers an easy way for people to swap clothes with others in their own neighborhood. It’s fun, free and sustainable! The idea is simple: (large) bags filled with clothes travel along a route past all participants in a certain city or district.",
    },
  ],
});
sitemap.write({ ...i18nUrl(`/faq`), changefreq: "daily", priority: 0.5 });
sitemap.write({ ...i18nUrl(`/donate`), changefreq: "daily", priority: 0.5 });
sitemap.write({
  ...i18nUrl(`/contact-us`),
  changefreq: "daily",
  priority: 0.6,
});
sitemap.write({
  ...i18nUrl(`/loops/find`),
  changefreq: "daily",
  priority: 0.3,
});
sitemap.write({
  ...i18nUrl(`/loops/new/users/signup`),
  changefreq: "daily",
  priority: 0.5,
});
sitemap.write({
  ...i18nUrl(`/users/login`),
  changefreq: "daily",
  priority: 0.3,
});

sitemap.end();
