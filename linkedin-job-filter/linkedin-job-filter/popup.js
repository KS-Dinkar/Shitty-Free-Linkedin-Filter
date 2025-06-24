document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('companyList');
  const saveBtn = document.getElementById('saveBtn');
  const toggle = document.getElementById('toggleFilter');

  // Load stored settings
  chrome.storage.local.get(['blockedCompanies', 'filterEnabled'], (data) => {
    if (data.blockedCompanies) {
      textarea.value = data.blockedCompanies.join(', ');
    }
    toggle.checked = data.filterEnabled !== false; // default ON
  });

  saveBtn.addEventListener('click', () => {
    const companies = textarea.value
      .split(',')
      .map(c => c.trim())
      .filter(c => c.length > 0);

    const filterEnabled = toggle.checked;

    chrome.storage.local.set({
      blockedCompanies: companies,
      filterEnabled: filterEnabled
    }, () => {
      saveBtn.textContent = 'Saved!';

      // Apply filtering live
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: (companies, enabled) => {
            window.__jobFilterExtensionTrigger?.(companies, enabled);
          },
          args: [companies, filterEnabled]
        });
      });

      setTimeout(() => saveBtn.textContent = 'Save', 1500);
    });
  });
});
