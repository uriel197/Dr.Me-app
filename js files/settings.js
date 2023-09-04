
const rails = document.querySelectorAll('.btn-rail');
const buttons = document.querySelectorAll('.rail-btn');
const darkModeToggle = document.getElementById('buttonText');

function buttonToggle(button, rail) {
    button.classList.toggle('btn-on'); // Toggle between on and off classes
    rail.classList.toggle('rail-on');
}


buttons.forEach((button, index) => {
    button.addEventListener('click', () => {
        const rail = rails[index];
        buttonToggle(button, rail); 
        if(index === 0) {    
            if (darkModeToggle.innerText === 'Dark Mode') {
                darkModeToggle.innerText = 'Light Mode';
            } else {
                darkModeToggle.innerText = 'Dark Mode';
            }
            toggleDarkMode();
        }             
    });
});

buttons.forEach((button, index) => {
    button.addEventListener('keydown', function(e) {
        if(e.key === 'Enter' && index === 0) {   
            if (darkModeToggle.innerText === 'Dark Mode') {
                darkModeToggle.innerText = 'Light Mode';
            } else {
                darkModeToggle.innerText = 'Dark Mode';
            }
            toggleDarkMode();
        }
    })
})

const fontSizeButton = document.getElementById('fontSizeButton');
const root = document.documentElement; // Get the <html> element

buttons.forEach((button, index) => {
    button.addEventListener('click', () => {
        if(index === 1) {
            const isIncreased = JSON.parse(localStorage.getItem('font-size-increased')) || false;

            if(!isIncreased) {
                const currentFontSize = parseFloat(getComputedStyle(root).fontSize);
                const newFontSize = currentFontSize + incrementAmount;
                root.style.fontSize = `${newFontSize}px`;
            } else {
                root.style.fontSize = null
            }
            localStorage.setItem('font-size-increased', JSON.stringify(!isIncreased));
        }
    })
});

buttons.forEach((button, index) => {
    button.addEventListener('keydown', function(e) {
        if(e.key === 'Enter' && index === 1) {
            const isIncreased = JSON.parse(localStorage.getItem('font-size-increased')) || false;

            if(!isIncreased) {
                const currentFontSize = parseFloat(getComputedStyle(root).fontSize);
                const newFontSize = currentFontSize + incrementAmount;
                root.style.fontSize = `${newFontSize}px`;
            } else {
                root.style.fontSize = null
            }
            localStorage.setItem('font-size-increased', JSON.stringify(!isIncreased));
        }
    })
});













