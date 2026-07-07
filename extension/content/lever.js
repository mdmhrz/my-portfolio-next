// Lever job boards (jobs.lever.co/{company}/{postingId}).
(function () {
  const { scrapeJsonLd, queryText, parseSalaryFromText, pick } = window.JobScrapeUtils;

  function companyFromUrl() {
    const match = window.location.pathname.match(/^\/([^/]+)\//);
    return match ? match[1].replace(/[-_]/g, " ") : undefined;
  }

  function scrape() {
    const jsonLd = scrapeJsonLd() || {};

    const position = pick(jsonLd.position, queryText([".posting-headline h2", "h2"]));
    const company = pick(jsonLd.company, companyFromUrl());
    const location = pick(
      jsonLd.location,
      queryText([".posting-categories .location", ".location"])
    );

    const bodyText = document.body.innerText || "";
    const salary = parseSalaryFromText(bodyText) || {};

    return {
      position,
      company,
      location,
      salaryMin: jsonLd.salaryMin ?? salary.salaryMin,
      salaryMax: jsonLd.salaryMax ?? salary.salaryMax,
      salaryCurrency: jsonLd.salaryCurrency ?? salary.salaryCurrency,
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
