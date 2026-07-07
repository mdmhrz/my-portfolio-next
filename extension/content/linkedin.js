// LinkedIn job posting pages (linkedin.com/jobs/view/*).
// LinkedIn's DOM class names drift periodically — JSON-LD is tried first as
// the stable signal, CSS selectors below are just a best-effort fallback.
(function () {
  const { scrapeJsonLd, queryText, pick } = window.JobScrapeUtils;

  function scrape() {
    const jsonLd = scrapeJsonLd() || {};

    const position = pick(
      jsonLd.position,
      queryText([
        ".job-details-jobs-unified-top-card__job-title h1",
        ".jobs-unified-top-card__job-title",
        "h1",
      ])
    );
    const company = pick(
      jsonLd.company,
      queryText([
        ".job-details-jobs-unified-top-card__company-name a",
        ".jobs-unified-top-card__company-name",
      ])
    );
    const location = pick(
      jsonLd.location,
      queryText([
        ".job-details-jobs-unified-top-card__tertiary-description-container",
        ".jobs-unified-top-card__bullet",
      ])
    );

    const easyApply = !!Array.from(document.querySelectorAll("button")).find((btn) =>
      /easy apply/i.test(btn.textContent || "")
    );

    return {
      position,
      company,
      location,
      salaryMin: jsonLd.salaryMin,
      salaryMax: jsonLd.salaryMax,
      salaryCurrency: jsonLd.salaryCurrency,
      workMode: jsonLd.workMode,
      jobUrl: window.location.href.split("?")[0],
      source: "linkedin",
      applicationType: easyApply ? "easy_apply" : "external_website",
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
