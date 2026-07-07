// Shared, dependency-free scraping helpers used by every content script and
// by the on-demand generic-site injection. Plain script (not a module) so it
// can be listed alongside a content script / injected file and share globals.
(function (window) {
  // Most job boards embed schema.org/JobPosting JSON-LD for SEO. It's far
  // more stable than hand-picked CSS selectors, so every scraper tries this
  // first and only falls back to DOM selectors if it's missing.
  function scrapeJsonLd() {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (const script of scripts) {
      let data;
      try {
        data = JSON.parse(script.textContent);
      } catch {
        continue;
      }
      const posting = findJobPosting(data);
      if (posting) return jobPostingToFields(posting);
    }
    return null;
  }

  function findJobPosting(node) {
    if (!node || typeof node !== "object") return null;
    if (Array.isArray(node)) {
      for (const item of node) {
        const found = findJobPosting(item);
        if (found) return found;
      }
      return null;
    }
    if (node["@type"] === "JobPosting") return node;
    if (Array.isArray(node["@graph"])) return findJobPosting(node["@graph"]);
    return null;
  }

  function jobPostingToFields(posting) {
    const company =
      posting.hiringOrganization?.name || posting.hiringOrganization || undefined;

    let location;
    const loc = posting.jobLocation;
    const address = Array.isArray(loc) ? loc[0]?.address : loc?.address;
    if (address) {
      location = [address.addressLocality, address.addressRegion, address.addressCountry]
        .filter(Boolean)
        .join(", ");
    }

    let salaryMin, salaryMax, salaryCurrency;
    const salary = posting.baseSalary;
    const value = salary?.value;
    if (value) {
      salaryMin = numberOrUndefined(value.minValue ?? value.value);
      salaryMax = numberOrUndefined(value.maxValue ?? value.value);
      salaryCurrency = salary.currency || undefined;
    }

    let workMode;
    if (posting.jobLocationType === "TELECOMMUTE") workMode = "remote";

    return {
      position: posting.title || undefined,
      company,
      location,
      salaryMin,
      salaryMax,
      salaryCurrency,
      workMode,
    };
  }

  function numberOrUndefined(value) {
    const n = typeof value === "string" ? Number(value.replace(/[^\d.]/g, "")) : Number(value);
    return Number.isFinite(n) && n > 0 ? Math.round(n) : undefined;
  }

  // Best-effort salary parsing from free text, e.g. "$80,000 - $120,000 a year".
  function parseSalaryFromText(text) {
    if (!text) return null;
    const match = text.match(
      /([$£€])\s?([\d,.]+)\s*k?\s*(?:-|to|–)\s*([$£€])?\s?([\d,.]+)\s*k?/i
    );
    if (!match) return null;
    const currencyMap = { $: "USD", "£": "GBP", "€": "EUR" };
    const currency = currencyMap[match[1]] || undefined;
    const isK = /k\s*(?:-|to|–)/i.test(text) || /\d\s*k\b/i.test(text);
    const toNumber = (raw) => {
      let n = Number(raw.replace(/,/g, ""));
      if (isK && n < 1000) n *= 1000;
      return Math.round(n);
    };
    const min = toNumber(match[2]);
    const max = toNumber(match[4]);
    if (!min && !max) return null;
    return { salaryMin: min || undefined, salaryMax: max || undefined, salaryCurrency: currency };
  }

  // Returns the trimmed text of the first element matching any selector.
  function queryText(selectors) {
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      const text = el?.textContent?.trim();
      if (text) return text;
    }
    return undefined;
  }

  function pick(...values) {
    return values.find((v) => typeof v === "string" && v.trim().length > 0);
  }

  window.JobScrapeUtils = { scrapeJsonLd, parseSalaryFromText, queryText, pick };
})(window);
