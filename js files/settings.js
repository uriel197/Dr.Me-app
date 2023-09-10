'use strict';
const rails = document.querySelectorAll('.btn-rail');
const buttons = document.querySelectorAll('.rail-btn');

function toggleDarkMode() {    
    if (retrieveFromLocalStorage.textContent === 'Dark Mode') {
        retrieveFromLocalStorage.textContent = 'Light Mode';
    } else {
        retrieveFromLocalStorage.textContent = 'Dark Mode';
    }
    body.classList.toggle('dark-mode');  /* 1 */
    setUserPreference('color-mode', body.classList.contains('dark-mode') ? 'dark' : 'light');
    setUserPreference('color-mode-text', body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode');
}


function fontSizeToggle() {
    const isIncreased = JSON.parse(localStorage.getItem('font-size-increased')) || false;
    if(!isIncreased) {
        const currentFontSize = parseFloat(getComputedStyle(root).fontSize);
        const newFontSize = currentFontSize + incrementAmount;
        root.style.fontSize = `${newFontSize}px`;
    } else {
        root.style.fontSize = "";
    }
    localStorage.setItem('font-size-increased', JSON.stringify(!isIncreased));
}

function buttonToggle(button, rail) {
    button.classList.toggle('btn-on'); // Toggle between on and off classes
    rail.classList.toggle('rail-on');
}


buttons.forEach((button, index) => {
    button.addEventListener('click', () => {
        const rail = rails[index];
        buttonToggle(button, rail); 
        if(index === 0) {
            toggleDarkMode();
        }             
    });
});

buttons.forEach((button, index) => {
    button.addEventListener('keydown', (e) => {
        if(e.key === 'Enter' && index === 0) {
            toggleDarkMode();
        }
    })
})       


const fontSizeButton = document.getElementById('fontSizeButton');
const root = document.documentElement; // Get the <html> element

buttons.forEach((button, index) => {
    button.addEventListener('click', () => {
        if(index === 1) {
            fontSizeToggle();
        }
    })
});

buttons.forEach((button, index) => {
    button.addEventListener('keydown', function(e) {
        if(e.key === 'Enter' && index === 1) {
            fontSizeToggle();
        }
    })
});










