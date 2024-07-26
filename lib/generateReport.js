import { fetchPage } from "./fetchPage.js";
import { seoReport } from "./seoReport.js";

export async function generateReport(keyword, url) {
  const { html, server } = await fetchPage(url);
  if (server !== null) {
    const report = seoReport(html, server, keyword, url);
    return report;
  }

  return {
    message: "I'm Block by Robots... :(",
  };
}
