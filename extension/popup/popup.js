const KNOWN_DOMAINS = [
  { test: (url) => /^https:\/\/www\.linkedin\.com\/jobs\/view\//.test(url), label: "LinkedIn" },
  { test: (url) => /^https:\/\/[^/]*\.greenhouse\.io\//.test(url), label: "Greenhouse" },
  { test: (url) => /^https:\/\/jobs\.lever\.co\//.test(url), label: "Lever" },
  { test: (url) => /^https:\/\/[^/]*\.myworkdayjobs\.com\//.test(url), label: "Workday" },
];

const els = {
  loading: document.getElementById("loading"),
  form: document.getElementById("form"),
  siteBadge: document.getElementById("siteBadge"),
  result: document.getElementById("result"),
  needsSetup: document.getElementById("needsSetup"),
  company: document.getElementById("company"),
  position: document.getElementById("position"),
  jobUrl: document.getElementById("jobUrl"),
  location: document.getElementById("location"),
  salaryMin: document.getElementById("salaryMin"),
  salaryMax: document.getElementById("salaryMax"),
  salaryCurrency: document.getElementById("salaryCurrency"),
  source: document.getElementById("source"),
  workMode: document.getElementById("workMode"),
  applicationType: document.getElementById("applicationType"),
};

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function scrapeViaContentScript(tabId) {
  try {
    const response = await chrome.tabs.sendMessage(tabId, { type: "GET_SCRAPE" });
    return response || null;
  } catch {
    return null; // content script not injected on this page (e.g. loaded before install)
  }
}

async function scrapeGeneric(tabId, tabUrl) {
  try {
    await chrome.scripting.executeScript({ target: { tabId }, files: ["shared/scrape-utils.js"] });
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        const utils = window.JobScrapeUtils;
        const jsonLd = utils ? utils.scrapeJsonLd() : null;
        return {
          position: jsonLd?.position,
          company: jsonLd?.company,
          location: jsonLd?.location,
          salaryMin: jsonLd?.salaryMin,
          salaryMax: jsonLd?.salaryMax,
          salaryCurrency: jsonLd?.salaryCurrency,
          workMode: jsonLd?.workMode,
          jobUrl: window.location.href.split("?")[0],
        };
      },
    });
    return result || { jobUrl: tabUrl };
  } catch {
    return { jobUrl: tabUrl };
  }
}

function fillForm(data, site) {
  els.company.value = data.company || "";
  els.position.value = data.position || "";
  els.jobUrl.value = data.jobUrl || "";
  els.location.value = data.location || "";
  if (data.salaryMin) els.salaryMin.value = data.salaryMin;
  if (data.salaryMax) els.salaryMax.value = data.salaryMax;
  if (data.salaryCurrency) els.salaryCurrency.value = data.salaryCurrency;
  if (data.workMode) els.workMode.value = data.workMode;

  if (data.source && [...els.source.options].some((o) => o.value === data.source)) {
    els.source.value = data.source;
  } else if (site) {
    els.source.value = site === "LinkedIn" ? "linkedin" : "career_site";
  }
  if (data.applicationType) els.applicationType.value = data.applicationType;
}

function showResult(message, kind) {
  els.result.textContent = message;
  els.result.className = kind;
}

async function init() {
  const tab = await getActiveTab();
  const match = KNOWN_DOMAINS.find((d) => tab?.url && d.test(tab.url));
  if (match) els.siteBadge.textContent = match.label;

  let data = match ? await scrapeViaContentScript(tab.id) : null;
  if (!data || (!data.position && !data.company)) {
    data = await scrapeGeneric(tab.id, tab.url);
  }

  fillForm(data || { jobUrl: tab?.url }, match?.label);
  els.loading.classList.add("hidden");
  els.form.classList.remove("hidden");
}

document.getElementById("openOptions").addEventListener("click", (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

els.form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const { apiBaseUrl, apiToken } = await chrome.storage.sync.get(["apiBaseUrl", "apiToken"]);
  if (!apiBaseUrl || !apiToken) {
    els.form.classList.add("hidden");
    els.needsSetup.classList.remove("hidden");
    return;
  }

  const saveButton = document.getElementById("save");
  saveButton.disabled = true;
  showResult("Saving…", "");

  const payload = {
    company: els.company.value.trim(),
    position: els.position.value.trim(),
    jobUrl: els.jobUrl.value.trim() || undefined,
    location: els.location.value.trim() || undefined,
    salaryMin: els.salaryMin.value ? Number(els.salaryMin.value) : undefined,
    salaryMax: els.salaryMax.value ? Number(els.salaryMax.value) : undefined,
    salaryCurrency: els.salaryCurrency.value.trim() || undefined,
    source: els.source.value || undefined,
    workMode: els.workMode.value || undefined,
    applicationType: els.applicationType.value || undefined,
  };

  try {
    const res = await fetch(`${apiBaseUrl}/api/admin/jobs/import`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => null);

    if (!res.ok || !json?.success) {
      showResult(json?.error || `Failed (${res.status})`, "error");
    } else if (json.duplicate) {
      showResult("Already saved — updated nothing.", "success");
    } else {
      showResult("Saved to Job Tracker.", "success");
    }
  } catch {
    showResult("Network error — check the dashboard URL in settings.", "error");
  } finally {
    saveButton.disabled = false;
  }
});

init();
