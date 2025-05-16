// === Guest Table Search & Sort ===
window.BSC = window.BSC || {};

BSC.enableGuestListTable = function () {
  // Load Font Awesome (for sort icons)
  (function loadFontAwesome() {
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const faLink = document.createElement('link');
      faLink.rel = 'stylesheet';
      faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
      faLink.crossOrigin = 'anonymous';
      document.head.appendChild(faLink);
    }
  })();

  function initGuestTables() {
    const tables = document.querySelectorAll("table.guestTable");

    tables.forEach((table) => {
      if (table.dataset.initialized === "true") return;
      table.dataset.initialized = "true";

      // Insert search input above .TableWrapper (or fallback above table)
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Search...";
      input.className = "guestTableSearchInput";

      const wrapper = table.closest('.TableWrapper');
      if (wrapper && wrapper.parentNode) {
        wrapper.parentNode.insertBefore(input, wrapper);
      } else {
        table.parentNode.insertBefore(input, table);
      }

      input.addEventListener("keyup", function () {
        const filter = this.value.toLowerCase();
        const rows = table.querySelectorAll("tbody tr");
        rows.forEach(row => {
          const text = row.textContent.toLowerCase();
          row.style.display = text.includes(filter) ? "" : "none";
        });
      });

      // Sortable headers with icons
      const headers = table.querySelectorAll("th");
      headers.forEach((header, colIndex) => {
        header.style.cursor = "pointer";

        if (!header.querySelector('.sort-icon')) {
          const icon = document.createElement('span');
          icon.className = 'sort-icon fas fa-sort';
          header.appendChild(icon);
        }

        header.addEventListener("click", () => sortTableByColumn(table, colIndex));
      });

      function sortTableByColumn(table, columnIndex) {
        const rows = Array.from(table.querySelectorAll("tbody tr"));
        const isAsc = table.getAttribute("data-sort-col") == columnIndex && table.getAttribute("data-sort-dir") !== "asc";

        rows.sort((a, b) => {
          const aText = a.children[columnIndex].textContent.trim().toLowerCase();
          const bText = b.children[columnIndex].textContent.trim().toLowerCase();
          return aText.localeCompare(bText) * (isAsc ? 1 : -1);
        });

        rows.forEach(row => table.querySelector("tbody").appendChild(row));
        table.setAttribute("data-sort-col", columnIndex);
        table.setAttribute("data-sort-dir", isAsc ? "asc" : "desc");

        table.querySelectorAll("th").forEach((header, i) => {
          const icon = header.querySelector('.sort-icon');
          if (icon) {
            icon.className = 'sort-icon fas ' + (
              i === columnIndex
                ? (isAsc ? 'fa-sort-up' : 'fa-sort-down')
                : 'fa-sort'
            );
          }
        });
      }
    });
  }

  // Wait for the table to appear in the DOM
  function waitForElement(selector, callback, maxAttempts = 20, delay = 300) {
    let attempts = 0;
    const interval = setInterval(() => {
      const el = document.querySelector(selector);
      if (el) {
        clearInterval(interval);
        callback(el);
      } else if (++attempts >= maxAttempts) {
        clearInterval(interval);
        console.warn("BSC: Element not found:", selector);
      }
    }, delay);
  }

  waitForElement("table.guestTable", initGuestTables);
};

// ✅ Run regardless of document load timing
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    BSC.enableGuestListTable();
  });
} else {
  BSC.enableGuestListTable();
}

// Form testing
function waitForElement(selector, callback, retries = 20, delay = 300) {
  const el = document.querySelector(selector);
  if (el) {
    console.log("Found element:", selector);
    callback(el);
  } else if (retries > 0) {
    console.log("Waiting for element:", selector);
    setTimeout(() => waitForElement(selector, callback, retries - 1, delay), delay);
  } else {
    console.warn("Failed to find element:", selector);
  }
}

waitForElement(".bsc-rsvp-form", () => {
  const table = document.querySelector(".bsc-rsvp-form");
  const eventCell = table.querySelector(".bsc-event");
  const tshirtCell = table.querySelector(".bsc-tshirt");
  const notesCell = table.querySelector(".bsc-notes");
  const nameCell = table.querySelector(".bsc-name");
  const emailCell = table.querySelector(".bsc-email");
  const submitButton = table.querySelector(".bsc-submit");
  const confirmation = table.querySelector(".bsc-confirmation");

  // Insert .bsc-user-info row if it doesn't exist
  let userInfo = table.querySelector(".bsc-user-info");
  if (!userInfo) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.setAttribute("colspan", "2");
    const strong = document.createElement("strong");
    strong.className = "bsc-user-info";
    cell.appendChild(strong);
    row.appendChild(cell);
    const tbody = table.querySelector("tbody");
    if (tbody) {
      tbody.insertBefore(row, tbody.firstChild);
      userInfo = strong;
    }
  }

  if (!eventCell || !tshirtCell || !notesCell || !nameCell || !emailCell || !submitButton || !confirmation || !userInfo) {
    console.warn("Missing one or more expected RSVP elements.");
    return;
  }

  function waitForContext(retries = 10) {
    if (typeof CONTEXT !== "undefined" && CONTEXT.accountDisplayName && CONTEXT.accountEmail) {
      console.log("Loaded CONTEXT:", CONTEXT);
      nameCell.innerText = CONTEXT.accountDisplayName;
      emailCell.innerText = CONTEXT.accountEmail;
      userInfo.innerText = "You are logged in as " + CONTEXT.accountDisplayName + " (" + CONTEXT.accountEmail + "). Your RSVP will be recorded with this information.";
    } else if (retries > 0) {
      console.log("Waiting for CONTEXT...");
      setTimeout(() => waitForContext(retries - 1), 300);
    } else {
      userInfo.innerText = "Could not detect account information. Please ensure you are logged in.";
    }
  }

  waitForContext();

  submitButton.addEventListener("click", function (e) {
    e.preventDefault();

    const formObject = {
      event: eventCell.innerText.trim(),
      tshirt: tshirtCell.innerText.trim(),
      notes: notesCell.innerText.trim(),
      accountDisplayName: nameCell.innerText.trim(),
      accountEmail: emailCell.innerText.trim()
    };

    console.log("RSVP Submission:", formObject);

    confirmation.style.display = "inline";
    submitButton.style.display = "none";

    [eventCell, tshirtCell, notesCell].forEach(cell => {
      cell.style.opacity = 0.6;
    });
  });
});
