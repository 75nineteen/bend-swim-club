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

// === Feature: Guest Table Search & Sort ===
BSC.enableGuestListTable = function () {
  // Find all guest tables by class
  const tables = document.querySelectorAll("table.guestTable");

  tables.forEach((table, index) => {
    // Avoid re-initializing
    if (table.dataset.initialized === "true") return;
    table.dataset.initialized = "true";

    // Insert search input just before the table
    const searchBox = document.createElement("input");
    searchBox.type = "text";
    searchBox.placeholder = "Search...";
    searchBox.className = "guestTableSearchInput";

    table.parentNode.insertBefore(searchBox, table);

    // Add filtering behavior
    searchBox.addEventListener("keyup", function () {
      const filter = this.value.toLowerCase();
      const rows = table.querySelectorAll("tbody tr");
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(filter) ? "" : "none";
      });
    });

    // Add sortable headers
    const headers = table.querySelectorAll("th");
    headers.forEach((header, colIndex) => {
      header.style.cursor = "pointer";
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
    }
  });
};

// === Auto-run all registered scripts ===
document.addEventListener("DOMContentLoaded", function () {
  BSC.runAll();
});
