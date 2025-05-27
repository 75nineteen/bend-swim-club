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

// 🚀 Form testing
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

  // Add or find .bsc-user-info row
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

  // Load CONTEXT data
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

  // Simulated editable cells
  function makeCellEditable(cell, placeholderText) {
    if (!cell) return;

    if (!cell.innerText.trim()) {
      cell.innerText = placeholderText;
    }

    cell.addEventListener("click", function () {
      if (cell.querySelector("input")) return;

      const existingText = cell.innerText.trim();
      const input = document.createElement("input");
      input.type = "text";
      input.value = existingText === placeholderText ? "" : existingText;
      input.style.width = "100%";
      input.style.boxSizing = "border-box";
      input.style.fontSize = "inherit";
      input.style.border = "1px solid #ccc";
      input.style.padding = "4px";

      cell.innerHTML = "";
      cell.appendChild(input);
      input.focus();

      function finalize() {
        const newValue = input.value.trim();
        cell.innerText = newValue || placeholderText;
      }

      input.addEventListener("blur", finalize);
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          input.blur();
        }
      });
    });
  }

  makeCellEditable(eventCell, "Click here and type");
  makeCellEditable(tshirtCell, "Click here and type");
  makeCellEditable(notesCell, "Click here and type");

  // Form submission
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

// === BSC Upcoming Event Button Injection ===
// This function waits for the homepage upcoming events section and injects a button
// (styled like "Edit Commitment") into the "Team Fiesta Gathering" event box,
// immediately after its .Content div. Easily extensible for other events.
BSC.addEventActionButton = function () {
  // Helper: Waits for elements to appear in the DOM
  function waitForElement(selector, callback, retries = 20, delay = 300) {
    const el = document.querySelector(selector);
    if (el) {
      callback(el);
    } else if (retries > 0) {
      setTimeout(() => waitForElement(selector, callback, retries - 1, delay), delay);
    } // else: give up silently
  }

  // Main logic: Finds all matching event boxes and adds buttons
  function injectButton() {
    // Select the CMS upcoming events section (matches homepage section)
    const eventsSection = document.querySelector('.CMSComponentUpcomingEvents');
    if (!eventsSection) return; // Section not found

    // For future-proofing, target all event "boxes" inside this section
    // (Assuming each event is a .EventRow or similar; adjust selector as needed)
    const eventBoxes = eventsSection.querySelectorAll('.EventRow, .Row, [class*="Event"]'); // Add more specific selectors if needed

    eventBoxes.forEach(eventBox => {
      // Find the .Content div in the event box
      const contentDiv = eventBox.querySelector('.Content');
      if (!contentDiv) return;

      // Find all possible title elements, including <a class="Title">
      const titleEls = contentDiv.querySelectorAll('a.Title, .Title, h3, h2, h1');
      let foundFiesta = false;
      titleEls.forEach(el => {
        // Debugging: Log the event title text
        // console.log('Event title text:', el.textContent.trim());
        if (/team fiesta gathering/i.test(el.textContent.trim())) {
          foundFiesta = true;
        }
      });

      if (foundFiesta) {
        // Prevent duplicate buttons (in case of re-runs)
        if (eventBox.querySelector('.bsc-event-action-btn')) return;

        // Create the button
        const btn = document.createElement('a');
        btn.href = 'https://forms.gle/SKD1o1vMaMSrEKqf8';
        btn.target = '_blank';
        btn.rel = 'noopener noreferrer';
        btn.className = 'bsc-event-action-btn EditCommitmentButton';
        btn.innerText = 'RSVP for Fiesta Gathering';

        // Insert after .Content div
        contentDiv.parentNode.insertBefore(btn, contentDiv.nextSibling);
        // Debugging: Log success
        // console.log('RSVP button inserted for Team Fiesta Gathering');
      }
    });
  }

  // Wait for the main CMS section to be present before running injectButton
  waitForElement('.CMSComponentUpcomingEvents', injectButton);
};

// ✅ Call this function on load (after DOM ready)
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    BSC.addEventActionButton();
  });
} else {
  BSC.addEventActionButton();
}
