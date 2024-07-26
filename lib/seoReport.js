import SEOReport from "./SEO.js";

export function seoReport(html_parse, server, keyword, url) {
  const seo = new SEOReport(html_parse, keyword);
  return {
    url: url,
    keyword: keyword,
    server: server,
    docType: seo.doctype(),
    carSet: seo.isCharset(),
    langSet: seo.isLangSet(),
    isMobileFriendly: seo.isMobileFriendly(),
    meta: seo.getMeta(),
    headings: seo.getHeadings(),
    strong_words: seo.getStrongWords(),
    images_info: seo.getImages(),
    links: seo.getLinks(url),
    structured_data: seo.getStructuredData(),
    keyword_mentioned: seo.keywordMention(),
    content: seo.getContent(),
  };
}
