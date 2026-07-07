// Workday job postings (*.myworkdayjobs.com/*). Workday is a heavily
// componentized SPA — content renders asynchronously after navigation, so a
// single read at document_idle often races the render. Recompute on every
// scrape request instead of trusting a load-time cache, and give the DOM a
// short grace window to finish rendering if key fields are still empty.
(function () {
  const { scrapeJsonLd, queryText, parseSalaryFromText, pick } = window.JobScrapeUtils;

  function scrape() {
    const jsonLd = scrapeJsonLd() || {};

    const position = pick(
      jsonLd.position,
      queryText(['[data-automation-id="jobPostingHeader"]', "h1"])
    );
    const company = pick(jsonLd.company, document.title.split(" - ")[0]?.trim());
    const location = pick(jsonLd.location, queryText(['[data-automation-id="locations"]']));

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

  function waitForRender(maxWaitMs) {
    return new Promise((resolve) => {
      const start = Date.now();
      const tryOnce = () => {
        let result;
        try {
          result = scrape();
        } catch {
          result = null;
        }
        if ((result && result.position) || Date.now() - start > maxWaitMs) {
          resolve(result);
          return;
        }
        setTimeout(tryOnce, 250);
      };
      tryOnce();
    });
  }

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === "GET_SCRAPE") {
      waitForRender(4000).then(sendResponse);
      return true; // keep the message channel open for the async response
    }
  });
})();
