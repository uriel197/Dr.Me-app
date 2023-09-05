        // shared.js
        const body = document.body;
        const darkModeToggle = document.getElementById('buttonText');

        function toggleDarkMode() {
            body.classList.toggle('dark-mode');  /* 1 */
            setUserPreference('color-mode', body.classList.contains('dark-mode') ? 'dark' : 'light');
            setUserPreference('color-mode-text', body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode');
        }

        // Function to set user's preference
        function setUserPreference(keyName, mode) {
            localStorage.setItem(keyName, mode); // Store in local storage
        }
        
        // Function to get user's preference
        function getUserPreference(keyName) {
            return localStorage.getItem(keyName); // Retrieve from local storage
        }
        
        // Function to apply color mode based on user preference
        function applyColorMode() {
            const userPreference = getUserPreference();
                if (userPreference === 'dark') {
                    body.classList.add('dark-mode');
                }
                const colorModeText = getUserPreference('color-mode-text'); 
                if(colorModeText !== null) {
                    darkModeToggle.innerText = colorModeText;
                }
            }        
        
// Apply color mode on page load
applyColorMode();



const incrementAmount = 4; // Increment amount in pixels
// Retrieve the font size preference from local storage
const storedFontSize = JSON.parse(localStorage.getItem('font-size-increased')) || false;

// If a font size preference is stored and increased, apply it as the root font size
if (storedFontSize) {
    const root = document.documentElement;
    const currentFontSize = parseFloat(getComputedStyle(root).fontSize);
    const newFontSize = currentFontSize + incrementAmount;
    root.style.fontSize = `${newFontSize}px`;
}



/************** COMMENTS *************

*** 1:  'light' and 'dark'  are variables that we are giving to localStorage to identify body.dark-mode with 'dark' and body.light-mode with 'light'. These values are used to represent the user's preference and are stored in the local storage using localStorage.setItem('color-mode', mode) under the key 'color-mode' like this: 
color-mode: 'light' or color-mode: 'dark'
then, When the page loads or when the user revisits the page, you retrieve the value from the local storage using localStorage.getItem('color-mode'). This value will be either 'dark' or 'light'.
*/
