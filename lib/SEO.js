import jsdom from "jsdom";
const { JSDOM } = jsdom;

class SEOReport {
  constructor(parseHtml, query) {
    const dom = new JSDOM(parseHtml);
    this.document = dom.window.document;
    this.query = query;
  }

  checkLength(content) {
    return content ? content.length : 0;
  }

  findHeadings(tag) {
    try {
      const headers = this.document.querySelectorAll(tag);
      return Array.from(headers).map((header) => header.textContent.trim());
    } catch {
      return null;
    }
  }

  checkMetaTag(att, type = "property") {
    try {
      const metaTag = this.document.querySelector(`meta[${type}='${att}']`);
      return metaTag ? metaTag.getAttribute("content") : null;
    } catch {
      return null;
    }
  }

  checkInternalLink(link, website) {
    const websiteUrl = new URL(website);
    const linkUrl = link ? new URL(link, websiteUrl) : null;
    const websiteHostname = websiteUrl.hostname.replace("www.", "");
    const linkHostname = linkUrl ? linkUrl.hostname : null;
    return linkHostname === websiteHostname || linkHostname === null;
  }

  h1Info(headings) {
    if (headings.length === 0) {
      return "No H1 tag found. please add a H1 heading";
    } else if (headings.length > 1) {
      return "Multiple H1 tags found. Please Use single H1 heading";
    } else {
      return "Good your Website use H1 heading Once.";
    }
  }

  findKeywordInText(keyword) {
    const bodyText = this.document.body.textContent
      .replace(/\n/g, "")
      .toLowerCase();
    const keywordCount = bodyText.split(keyword.toLowerCase()).length - 1;
    return keywordCount;
  }

  generateKeywordPhrases() {
    const words = this.query.split(" ");
    const numWords = words.length;
    const allPhrases = [];

    for (let n = numWords; n > 0; n--) {
      for (let i = 0; i <= numWords - n; i++) {
        allPhrases.push(words.slice(i, i + n).join(" "));
      }
    }

    return allPhrases;
  }

  findStrongWords(elements) {
    return Array.from(elements).map((element) => element.textContent.trim());
  }

  isMobileFriendly() {
    try {
      const viewportMeta = this.checkMetaTag("viewport", "name");
      return viewportMeta ? true : false;
    } catch {
      return false;
    }
  }

  isCharset() {
    try {
      const charset = this.document.characterSet;
      return charset ? charset : "not found";
    } catch {
      return "error";
    }
  }

  doctype() {
    try {
      const docType = this.document.doctype;
      return docType ? "HTML 5" : "HTML 4.0";
    } catch {
      return "error";
    }
  }

  isLangSet() {
    try {
      const lang = this.document.documentElement.lang;
      return lang ? lang : "not found";
    } catch {
      return "error";
    }
  }

  getMeta() {
    const metaTitle = this.document.querySelector("title");
    const metaDescription = this.checkMetaTag("description", "name");
    const ogTitle = this.checkMetaTag("og:title");
    const ogType = this.checkMetaTag("og:type");
    const ogDescription = this.checkMetaTag("og:description");
    const ogUrl = this.checkMetaTag("og:url");

    return {
      title: metaTitle ? metaTitle.textContent.trim() : null,
      title_length: metaTitle ? metaTitle.textContent.trim().length : 0,
      title_info:
        metaTitle && metaTitle.textContent.trim().length <= 70
          ? "good"
          : "too long",
      description: metaDescription,
      description_length: metaDescription ? metaDescription.length : 0,
      description_info:
        metaDescription && metaDescription.length <= 160 ? "good" : "too long",
      og_title: ogTitle,
      og_description: ogDescription,
      og_type: ogType,
      og_url: ogUrl,
      og_info:
        ogTitle && ogDescription && ogType && ogUrl
          ? "congratulation open graph info found make sure its relevant to your content and use primary keyword and secondary keyword accordingly"
          : "Open Graph information is missing please fix it",
    };
  }

  getHeadings() {
    const headings = {
      h1: this.findHeadings("h1"),
      h2: this.findHeadings("h2"),
      h3: this.findHeadings("h3"),
      h4: this.findHeadings("h4"),
      h5: this.findHeadings("h5"),
      h6: this.findHeadings("h6"),
      info: `${this.h1Info(
        this.findHeadings("h1")
      )}. Please make sure you properly use your primary keyword and secondary keywords in Headings.`,
    };
    return headings;
  }

  getStrongWords() {
    const strongTags = this.findStrongWords(
      this.document.querySelectorAll("strong")
    );
    const italicTags = this.findStrongWords(
      this.document.querySelectorAll("em")
    );
    const strongWords = strongTags.concat(italicTags);
    const message =
      strongWords.length > 0
        ? `${strongWords.length} strong word founds`
        : "We don't see you use any strong word in your content. Please use strong words for better SEO";
    return {
      words: strongWords,
      info: `${message}. Please make sure you properly use your primary keyword and secondary keywords as bold, italic text.`,
    };
  }

  getImages() {
    const images = this.document.querySelectorAll("img");
    const missingAlt = [];
    const imageList = [];

    images.forEach((image) => {
      if (!image.getAttribute("alt")) {
        missingAlt.push(image.getAttribute("src"));
      }
      imageList.push({
        src: image.getAttribute("src"),
        alt: image.getAttribute("alt") || null,
      });
    });

    return {
      total_image: imageList.length,
      missing_alt: missingAlt.length,
      images: imageList,
      info:
        missingAlt.length > 0
          ? `${missingAlt.length} images has no alt tag please add relevant alt tag for better SEO`
          : "all images have alt text, make sure it's relevant to your keyword",
    };
  }

  getLinks(website) {
    const links = this.document.querySelectorAll("a");
    const internalLinks = [];
    const externalLinks = [];

    links.forEach((link) => {
      if (this.checkInternalLink(link.getAttribute("href"), website)) {
        internalLinks.push({
          href: link.getAttribute("href"),
          text: link.textContent.trim(),
        });
      } else {
        externalLinks.push({
          href: link.getAttribute("href"),
          text: link.textContent.trim(),
        });
      }
    });

    return {
      internal: {
        total: internalLinks.length,
        links: internalLinks,
      },
      external: {
        total: externalLinks.length,
        links: externalLinks,
      },
      info: "Make sure you add relevant anchor text to your internal and external links. We suggest using secondary keyword as anchor text",
    };
  }

  getStructuredData() {
    const structuredDataList = [];
    const scripts = this.document.querySelectorAll(
      "script[type='application/ld+json']"
    );

    scripts.forEach((script) => {
      try {
        structuredDataList.push(JSON.parse(script.textContent));
      } catch (e) {
        // Handle JSON parse error if needed
      }
    });

    return {
      total_structured_data: structuredDataList.length,
      structured_data: structuredDataList,
      info:
        structuredDataList.length > 0
          ? `congratulation we found ${structuredDataList.length} structured data`
          : "structured data is missing",
    };
  }

  keywordMention() {
    const totalK = [];
    const kChunk = this.generateKeywordPhrases();

    kChunk.forEach((x) => {
      const kMention = this.findKeywordInText(x);
      totalK.push({
        keyword: x,
        mentioned: kMention,
      });
    });

    const primaryKeywordCount = this.findKeywordInText(kChunk[0]);

    return {
      keywords: totalK,
      info:
        primaryKeywordCount <= 4 && primaryKeywordCount >= 1
          ? `Great!! Primary keyword found ${primaryKeywordCount} times in your content. Using primary keyword 2-3 times is a good practice.`
          : `Primary keyword use ${primaryKeywordCount} times. Using primary keyword 2-4 times is a good practice.`,
    };
  }

  getContent() {
    // Remove <script> and <style> tags
    const scripts = this.document.querySelectorAll("script");
    const styles = this.document.querySelectorAll("style");
    scripts.forEach((script) => script.remove());
    styles.forEach((style) => style.remove());

    const bodyText = this.document.body.textContent.replace(/\n/g, "").trim();
    const wordCount = bodyText.split(/\s+/).length;

    return {
      word_count: wordCount,
      content: bodyText,
      info:
        wordCount > 1000
          ? `Great!! Your website has ${wordCount} words. Google loves long informative content.`
          : `Your website has ${wordCount} words. Please try to add some more relevant content.`,
    };
  }
}

export default SEOReport;
