// Greenhouse job boards (*.greenhouse.io/*). Standard (non-SPA) semantic
// DOM, so the selector fallback is fairly reliable if JSON-LD is missing.
(function () {
  const { scrapeJsonLd, queryText, parseSalaryFromText, pick } = window.JobScrapeUtils;

  function scrape() {
    const jsonLd = scrapeJsonLd() || {};

    const position = pick(
      jsonLd.position,
      queryText(["#header .app-title", ".job__title h1", "h1"])
    );
    const company = pick(
      jsonLd.company,
      queryText(["#header .company-name", ".company-name"]),
      document.title.split(" at ")[1]?.trim()
    );
    const location = pick(
      jsonLd.location,
      queryText(["#header .location", ".job__location", ".location"])
    );

    const bodyText = document.body.innerText || "";
    const salary = jsonLd.salaryMin || jsonLd.salaryMax ? jsonLd : parseSalaryFromText(bodyText) || {};

    return {
      position,
      company,
      location,
      salaryMin: salary.salaryMin ?? jsonLd.salaryMin,
      salaryMax: salary.salaryMax ?? jsonLd.salaryMax,
      salaryCurrency: salary.salaryCurrency ?? jsonLd.salaryCurrency,
      workMode: jsonLd.workMode,
      jobUrl: window.location.href.split("?")[0],
      source: "career_site",
      applicationType: "external_website",
    };
  }

  let cached = null;
  try {
    cached = scrape();
  } catch {
    cached = null;
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === "GET_SCRAPE") {
      sendResponse(cached);
    }
  });
})();
