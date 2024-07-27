class Filter {
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
      return {
        status: "error",
        message: "No H1 tag found. Please use H1 tag",
      };
    } else if (headings.length > 1) {
      return {
        status: "error",
        message: "You have multiple H1 tags. Please use only one H1 tag",
      };
    } else {
      return {
        status: "good",
        message: "You have one H1 tag. Good job!",
      };
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
}

export default Filter;
