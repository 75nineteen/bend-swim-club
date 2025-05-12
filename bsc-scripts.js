window.BSC = window.BSC || {}; // Create a global namespace to hold your functions

// RSVP Button insertion function
BSC.addRSVPButton = function() {
  const calendarSections = document.querySelectorAll('.Calendar');

  calendarSections.forEach(section => {
    const titleEl = section.querySelector('.Title.AnonId_title');

    if (titleEl && titleEl.textContent.includes('Bend Swim Club Team Celebration')) {
      const actionsContainer = section.querySelector('.Actions.AnonId_actionContainer.HasActions');

      if (actionsContainer) {
        const button = document.createElement('a');
        button.className = 'Button Primary';
        button.href = 'https://forms.gle/YjAKW2TxnofkCNSo7';
        button.target = '_blank';

        const icon = document.createElement('icon');
        icon.className = 'pencil';

        const span = document.createElement('span');
        span.textContent = 'RSVP Now';

        button.appendChild(icon);
        button.appendChild(span);

        actionsContainer.appendChild(button);
      } else {
        console.warn('Actions container not found in this Calendar section.');
      }
    }
  });
};

// Insert table search and sort
BSC.enableGuestListTable = function() {
  const container = document.getElementById("searchContainer");
  const table = document.getElementById("guestTable");

  // Exit quietly if required elements don't exist
  if (!container || !table) return;

  // Prevent double-initialization
  if (container.dataset.initialized === "true") return;
  container.dataset.initialized = "true";

  // Create and add the search box
  const input = document.createElement("input");
  input.setAttribute("type", "text");
  input.setAttribute("id", "searchInput");
  input.setAttribute("placeholder", "Search...");
  container.appendChild(input);

  input.addEventListener("keyup", function() {
    const filter = this.value.toLowerCase();
    const rows = table.querySelectorAll("tbody tr");
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(filter) ? "" : "none";
    });
  });

  const headers = table.querySelectorAll("th");
  headers.forEach((header, index) => {
    header.style.cursor = "pointer";
    header.addEventListener("click", () => sortTableByColumn(table, index));
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
};
