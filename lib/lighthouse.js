import { launch } from "chrome-launcher";
import lighthouse from "lighthouse";

async function runLighthouse(url, formFactor) {
  const chrome = await launch({ chromeFlags: ["--headless"] });
  const options = {
    logLevel: "info",
    output: "json",
    onlyCategories: ["performance", "seo"],
    port: chrome.port,
    emulatedFormFactor: formFactor,
  };
  const runnerResult = await lighthouse(url, options);

  const reportJson = JSON.parse(runnerResult.report);

  chrome.kill();

  return {
    performance: reportJson.categories.performance.score * 100,
    seo: reportJson.categories.seo.score * 100,
  };
}

export async function getPerformanceScore(url) {
  const mobileScores = await runLighthouse(url, "mobile");
  const desktopScores = await runLighthouse(url, "desktop");

  return {
    mobile: {
      load_speed: mobileScores.performance,
      seo: mobileScores.seo,
    },
    desktop: {
      load_speed: desktopScores.performance,
      seo: desktopScores.seo,
    },
  };
}
