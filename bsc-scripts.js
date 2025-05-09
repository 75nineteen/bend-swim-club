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

// Later you can add more functions like:
// BSC.doSomethingElse = function() {
//  console.log('Another function executed!');
// };
