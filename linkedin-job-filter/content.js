function removeJobsByCompanyList(companyNames) {
  document.querySelectorAll('li').forEach(li => {
    const subtitleDiv = li.querySelector('.artdeco-entity-lockup__subtitle');
    if (subtitleDiv) {
      const companyText = subtitleDiv.textContent.trim();
      if (companyNames.some(name => companyText.includes(name))) {
        li.remove();
      }
    }
  });
}

function waitForElement(selector, callback) {
  const observer = new MutationObserver(() => {
    const el = document.querySelector(selector);
    if (el) {
      observer.disconnect();
      callback(el);
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.position = "fixed";
  toast.style.top = "20px";
  toast.style.right = "20px";
  toast.style.backgroundColor = "#0073b1";
  toast.style.color = "white";
  toast.style.padding = "12px 20px";
  toast.style.borderRadius = "8px";
  toast.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";
  toast.style.fontSize = "14px";
  toast.style.zIndex = "9999";
  toast.style.opacity = "0";
  toast.style.transition = "opacity 0.3s ease";

  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
  });
  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function activateFilter(blockedCompanies) {
  const list = document.querySelector('.scaffold-layout__list-detail ul');
  if (!list) return;

  removeJobsByCompanyList(blockedCompanies);

  list.addEventListener('scroll', () => {
    removeJobsByCompanyList(blockedCompanies);
  });

  const observer = new MutationObserver(() => {
    removeJobsByCompanyList(blockedCompanies);
  });
  observer.observe(list, { childList: true, subtree: true });

  showToast(`✅ Filtering jobs from: ${blockedCompanies.join(', ')}`);
}

// Inject global trigger so popup.js can reapply filtering immediately
window.__jobFilterExtensionTrigger = (blockedCompanies, enabled) => {
  if (enabled) {
    activateFilter(blockedCompanies);
  } else {
    showToast("🚫 Filtering is disabled");
  }
};


chrome.storage.local.get(['blockedCompanies', 'filterEnabled'], (data) => {
  const blocked = data.blockedCompanies || [];
  const isEnabled = data.filterEnabled !== false; // default to true if undefined

  if (!isEnabled || blocked.length === 0) return;

  waitForElement('.scaffold-layout__list-detail ul', () => {
    activateFilter(blocked);
  });
});

