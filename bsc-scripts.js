// Create BSC namespace and script registry
window.BSC = window.BSC || {
  _initFunctions: [],

  registerInit(fn) {
    this._initFunctions.push(fn);
  },

  runAll() {
    this._initFunctions.forEach(fn => {
      try {
        fn();
      } catch (e) {
        console.error("BSC script error:", e);
      }
    });
  }
};

// === Feature: Add RSVP Now Button ===
BSC.registerInit(function addRSVPButton() {
  const calendarSections = document.querySelectorAll('.Calendar');

  calendarSections.forEach(section => {
    const titleEl = section.querySelector('.Title.AnonId_title');

    if (titleEl && titleEl.textContent.includes('Bend Swim Club Team Celebration')) {
      const actionsContainer = section.querySelector('.Actions.AnonId_actionContainer.HasActions');
      if (!actionsContainer || actionsContainer.querySelector('.rsvp-btn')) return;

      const button = document.createElement('a');
      button.className = 'Button Primary rsvp-btn';
      button.href = 'https://forms.gle/YjAKW2TxnofkCNSo7';
      button.target = '_blank';

      const icon = document.createElement('icon');
      icon.className = 'pencil';

      const span = document.createElement('span');
      span.textContent = 'RSVP Now';

      button.appendChild(icon);
      button.appendChild(span);

      actionsContainer.appendChild(button);
    }
  });
});

// === Feature: Guest Table Search & Sort with Font Awesome Arrows ===
BSC.enableGuestListTable = function () {
  // Inject Font Awesome if not already present
  (function loadFontAwesome() {
    if (!document.querySelector('link[href*="font-awesome"]')) {
      const faLink = document.createElement('link');
      faLink.rel = 'stylesheet';
      faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
      faLink.crossOrigin = 'anonymous';
      document.head.appendChild(faLink);
    }
  })();

  const initGuestTables = () => {
    const tables = document.querySelectorAll("table.guestTable");

    tables.forEach((table) => {
      if (table.dataset.initialized === "true") return;
      table.dataset.initialized = "true";

      // Insert search input into a new thead row
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Search...";
      input.className = "guestTableSearchInput";

      const thead = table.querySelector("thead");
      if (thead) {
        const th = document.createElement("th");
        th.colSpan = table.querySelectorAll("thead th").length;
        th.appendChild(input);

        const tr = document.createElement("tr");
        tr.appendChild(th);

        thead.insertBefore(tr, thead.firstChild);
      }

      input.addEventListener("keyup", function () {
        const filter = this.value.toLowerCase();
        const rows = table.querySelectorAll("tbody tr");
        rows.forEach(row => {
          const text = row.textContent.toLowerCase();
          row.style.display = text.includes(filter) ? "" : "none";
        });
      });

      // Make headers sortable with icons
      const headers = table.querySelectorAll("th");
      headers.forEach((header, colIndex) => {
        header.style.cursor = "pointer";

        // Add icon span if missing
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

        // Update icons
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
  };

  // Wait for table to exist before running logic
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

  waitForElement("table.guestTable", () => {
    initGuestTables();
  });
};

// === Auto-run all registered scripts ===
document.addEventListener("DOMContentLoaded", function () {
  BSC.runAll();

  // ✅ This is the critical fix — direct call instead of registration
  BSC.enableGuestListTable();  // ← highlighted change
});
