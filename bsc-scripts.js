// === Bend Swim Club Custom Script ===
window.BSC = window.BSC || {};

// === Guest Table Search & Sort ===
BSC.enableGuestListTable = function () {
  // Inject Font Awesome
  if (!document.querySelector('link[href*="font-awesome"]')) {
    const faLink = document.createElement('link');
    faLink.rel = 'stylesheet';
    faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
    faLink.crossOrigin = 'anonymous';
    document.head.appendChild(faLink);
  }

  function initGuestTables() {
    const tables = document.querySelectorAll("table.guestTable");

    tables.forEach((table) => {
      if (table.dataset.initialized === "true") return;
      table.dataset.initialized = "true";

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

  // Wait for table to exist
  const check = setInterval(() => {
    const table = document.querySelector("table.guestTable");
    if (table) {
      clearInterval(check);
      initGuestTables();
    }
  }, 300);
};

// === Confirm RSVP Button — With MutationObserver ===
BSC.addConfirmButton = function () {
  function injectButton() {
    const items = document.querySelectorAll('.Calendar .CalendarItem');

    items.forEach(item => {
      const titleEl = item.querySelector('.Title.AnonId_title');
      const cleanText = titleEl?.textContent?.trim()?.toLowerCase();

      if (cleanText && cleanText.includes('bend swim club team celebration')) {
        const actionsContainer = item.querySelector('.Actions.AnonId_actionContainer.HasActions');
        if (!actionsContainer || actionsContainer.querySelector('.confirm-btn')) return;

        const button = document.createElement('a');
        button.className = 'Button Primary confirm-btn';
        button.href = 'https://www.bendswimclub.com/page/system/res/219538';
        button.target = '_blank';

        const icon = document.createElement('icon');
        icon.className = 'pencil';

        const span = document.createElement('span');
        span.textContent = 'Confirm RSVP';

        button.appendChild(icon);
        button.appendChild(span);
        actionsContainer.appendChild(button);
      }
    });
  }

  const calendar = document.querySelector('.Calendar');
  if (!calendar) return;

  // Inject immediately
  injectButton();

  // Re-inject on any DOM changes to calendar items
  const observer = new MutationObserver(() => {
    injectButton();
  });

  observer.observe(calendar, { childList: true, subtree: true });
};

// === Run both features when DOM is ready ===
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    BSC.enableGuestListTable();
    BSC.addConfirmButton();
  });
} else {
  BSC.enableGuestListTable();
  BSC.addConfirmButton();
}
