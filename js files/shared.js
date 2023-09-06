        'use strict';
        // shared.js;
        const body = document.body;
        const retrieveFromLocalStorage = document.getElementById('buttonText');

        function toggleDarkMode() {
            body.classList.toggle('dark-mode');  /* 1 */
            setUserPreference('color-mode', body.classList.contains('dark-mode') ? 'dark' : 'light');
            setUserPreference('color-mode-text', body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode');
        }

        // Function to set user preference
        function setUserPreference(keyName, mode) {
            localStorage.setItem(keyName, mode);
        }
        
        // Function to get user preference
        function getUserPreference(keyName) {
            return localStorage.getItem(keyName); // Retrieve from local storage
        }
          

        // Function to apply color mode based on user preference
        function applyColorMode() { 
            const userPreference = getUserPreference('color-mode');           
            if (userPreference === 'dark') {
                body.classList.add('dark-mode');
            }
            const colorModeText = getUserPreference('color-mode-text'); 
            if(!retrieveFromLocalStorage) {
                return;
            } else {
                retrieveFromLocalStorage.textContent = colorModeText;
            }
        } 
        
// Apply color mode on page load
applyColorMode();

const incrementAmount = 4; // Increment amount in pixels
// Retrieve the font size preference from local storage
const storedFontSize = JSON.parse(getUserPreference('font-size-increased')) || false;

// If a font size preference is stored and increased, apply it as the root font size
if (storedFontSize) {
    const root = document.documentElement;
    const currentFontSize = parseFloat(getComputedStyle(root).fontSize);
    const newFontSize = currentFontSize + incrementAmount;
    root.style.fontSize = `${newFontSize}px`;
}

