import jsdom from "jsdom";
import { contains_power_word, isKeywordMentioned } from "../filter.js";
import Filter from "./Filter.js";
const { JSDOM } = jsdom;

class SEOReport extends Filter {
  constructor(parseHtml, query) {
    const dom = new JSDOM(parseHtml);
    super();
    this.document = dom.window.document;
    this.query = query;
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
      return false;
    }
  }

  doctype() {
    try {
      const docType = this.document.doctype;
      return docType ? "HTML5" : "HTML4.0";
    } catch {
      return false;
    }
  }

  isLangSet() {
    try {
      const lang = this.document.documentElement.lang;
      return lang ? lang : false;
    } catch {
      return false;
    }
  }

  getMeta() {
    const metaTitle = this.document.querySelector("title");
    const metaDescription = this.checkMetaTag("description", "name");
    const ogTitle = this.checkMetaTag("og:title");
    const ogType = this.checkMetaTag("og:type");
    const ogDescription = this.checkMetaTag("og:description");
    const ogUrl = this.checkMetaTag("og:url");
    const ogImg = this.checkMetaTag("og:image");
    const ogSite = this.checkMetaTag("og:site_name");

    return {
      meta_title: {
        title: metaTitle ? metaTitle.textContent.trim() : null,
        info: {
          length: metaTitle ? metaTitle.textContent.trim().length : 0,
          hasPowerWords: contains_power_word(metaTitle.textContent.trim()),
          isKeywordMentioned: isKeywordMentioned(
            this.query,
            metaTitle.textContent.trim()
          ),
        },
      },
      meta_description: {
        description: metaDescription ? metaDescription : null,
        info: {
          length: metaDescription ? metaDescription.length : 0,
          isKeywordMentioned: isKeywordMentioned(
            this.query,
            metaDescription ? metaDescription : ""
          ),
        },
      },
      og_tags: {
        siteName: ogSite,
        og_title: ogTitle,
        og_description: ogDescription,
        og_type: ogType,
        og_url: ogUrl,
        og_src: ogImg,
        og_info: {
          error:
            ogTitle && ogDescription && ogType && ogUrl && ogImg ? false : true,
          message:
            ogTitle && ogDescription && ogType && ogUrl && ogImg
              ? "Congratulation all open graph info are present"
              : "Open graph info are missing please fix it",
          hints:
            "make sure your open graph information is relevant to your content and primary keyword and secondary keywords",
        },
      },
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
      info: {
        message: this.h1Info(this.findHeadings("h1")),
        hints:
          "Use H1 tag for your primary keyword and H2, H3, H4, H5, H6 for secondary keywords",
      },
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
    const isStrongWord = strongWords.length > 0 ? true : false;
    return {
      words: strongWords,
      info: {
        message: {
          status: isStrongWord ? true : false,
          message: isStrongWord
            ? "Strong words found"
            : "No strong words found",
        },
        hints: "Use strong words for your primary and secondary keywords",
      },
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
      info: {
        message: {
          status: missingAlt.length > 0 ? true : false,
          message:
            missingAlt.length > 0
              ? `${missingAlt.length} images are missing alt text`
              : "All images have alt text",
        },

        hints:
          "Add alt text to your images. Alt text helps search engines understand what the image is about",
      },
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
        primaryKeywordCount <= 3 && primaryKeywordCount >= 1
          ? `Great!! Primary keyword found ${primaryKeywordCount} times in your content. keyword density 1-2%  is a good practice.`
          : `Primary keyword found ${primaryKeywordCount} times. keyword density 1-2%  is a good practice.`,
    };
  }

  getContent() {
    // Remove <script> and <style> tags
    const scripts = this.document.querySelectorAll("script");
    const styles = this.document.querySelectorAll("style");
    scripts.forEach((script) => script.remove());
    styles.forEach((style) => style.remove());

    const bodyText = this.document.body.textContent
      .replace(/[\n\t]/g, "")
      .trim();
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
