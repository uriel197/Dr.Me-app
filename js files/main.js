const weatherInfo = document.querySelector('.contents'); 
const cityName = document.querySelector('.cityInput');
const ailmentCheckbox = document.querySelector('.checkbox');
const apiKey = 'YOUR_API_KEY';

const contentTips = [
["Be consistent in your naming of foods, for example: if you eat french fries one day, don't call it fries, instead, call it potatoes so that if another day you eat potatoes then the App will count them both when making the diagnose."], ["to help our App make a better diagnose, try to go to places with different climate conditions in order to test all options."], ["if you happen to be traveling outside of your city, don't forget to enter the name of the city you were in most of the day and not the city where you live."],
];
const tip = Math.floor(Math.random() * contentTips.length);       

 
async function processData() {
    const cityNameValue = cityName.value.trim();
    const foods = document.querySelector('.foodsInput');
    const getChart = document.querySelector('.chartBtn');  
    const ailment = document.querySelector('.checkbox').checked;
    // Sanitize the input using a simple regular expression to remove potentially harmful characters
    const sanitizedCityName = cityNameValue.replace(/[^A-Za-z\s]/g, ''); /* see regex in the comments */
    // Construct the API URL
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(sanitizedCityName)}&appid=${apiKey}&units=metric`;

    if(cityNameValue === '') {
        showAlert('Please enter a city name', 'error');
        return;
    }

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if(data.cod === 404) {
            weatherInfo.textContent = 'City not found, please try again';
        } else {

            const temperature = data.main.temp;
            const humidity = data.main.humidity;
            const foodList = foods.value.split(',');  
            const pressure = data.main.pressure;                

            // Save the weather data to local storage
            const chartData = {
                city: cityNameValue,
                temperature: temperature,
                humidity: humidity,
                pressure: pressure,
                foods: foodList,
                ailment: ailment,
            };

            addDataToStorage(chartData);
            cityName.value = '';
            foods.value = '';
            showAlert('Entry has been successfully added!', 'success');

            let chart = getChartInfo();
            if(chart.length > 21) {
                document.querySelector('.listBtn').classList.remove('hidden');
                getChart.classList.add('hidden');
            }
        }
    } catch(error) {
        console.error('Error fetching weather data:', error);
        weatherInfo.textContent = 'An error occurred while fetching weather data.'; 
    }
}

const burgerWrap = document.getElementById('burgerWrap');
const sideMenu = document.getElementById('side-menu');
const closeBtn = document.querySelector('.btn-close');
const links = sideMenu.querySelectorAll('a');
let sideNavOpen = false;

function openSlideMenu() {
    sideMenu.style.width = '250px';
    sideNavOpen = true;
    updateFocus();
}

function closeSlideMenu() {
    sideMenu.style.width = '0';
    sideNavOpen = false;
    updateFocus();
}

function updateFocus() {
    if (sideNavOpen) {
        burgerWrap.setAttribute('aria-expanded', 'true');
        closeBtn.focus();
    } else {
        burgerWrap.setAttribute('aria-expanded', 'false');
        burgerWrap.focus();
    }

    links.forEach(link => {
        link.tabIndex = sideNavOpen ? '1' : '-1';
    });
}


function showAlert(alert, classToAdd) {
    const div = document.createElement('div');
    div.classList.add(classToAdd);
    div.innerText = alert;
    cityName.insertAdjacentElement('beforebegin', div);

    setTimeout(() => {
        div.remove();
        // Reset checkbox
        ailmentCheckbox.checked = false;
    }, 3000);
}    

function getChartInfo() {
    let info;
    if(localStorage.getItem('info') == null) {
        info = [];
    } else {
        info = JSON.parse(localStorage.getItem('info'));
    }
    return info;
}

let chart = getChartInfo();
console.log(chart);

function addDataToStorage(data) {
    const info = getChartInfo();  /* 1 */
    info.push({
        ...data,
        temperatureRange: {
            discomfort: 0,
            noDiscomfort: 0,
        },
        humidityRange: {
            discomfort: 0,
            noDiscomfort: 0,
        },
        pressureRange: {
            discomfort: 0,
            noDiscomfort: 0,
        },
    });
    localStorage.setItem('info', JSON.stringify(info));
}

function removeDataFromStorage() {            
    localStorage.removeItem('info');
}


function tableFor(food, data) {
    let table = [0, 0, 0, 0];
    for (let entry of data) {
        let index = 0;
        if (entry.foods.includes(food)) index += 1;
        if (entry.ailment) index += 2; 
        table[index] += 1;
    }
    return table;
}


function foodTable(data) {
    let foods = [];
    for (let entry of data) {
        for (let food of entry.foods) {
            if (!foods.includes(food)) {
                foods.push(food);
            }
        }
    }
    return foods;
}


function phi(table) {
    return (table[3] * table[0] - table[2] * table[1]) /
        Math.sqrt((table[2] + table[3]) *
                (table[0] + table[1]) *
                (table[1] + table[3]) *
                (table[0] + table[2]));
}



/* this next function returns the name of the food with the highest value */
function highestRatedFood(data) {
    let maxPhiValue = -Infinity;//Number.NEGATIVE_INFINITY;
    let maxPhiFood = '';  /* 2 */

    for (let food of foodTable(data)) {
        const phiValue = phi(tableFor(food, data));

        if (phiValue > maxPhiValue) {
            maxPhiValue = phiValue;
            maxPhiFood = food;
        }
    }

    return maxPhiFood ;
}

const higherFood = highestRatedFood(chart);


function tableForTemperatureAndHumidity(info) {
    const table = {};

    for (let entry of info) {  /* 3 */
        const humidityRange = getHumidityRange(entry.humidity);
        const temperatureRange = getTemperatureRange(entry.temperature);
        const pressureRange = getPressureRange(entry.pressure);
        const key = `${humidityRange}-${temperatureRange}-${pressureRange}`;

        if (!table[key]) {  /* table[key] is the key above */
            table[key] = {
                humidityRange: {
                    discomfort: 0,
                    noDiscomfort: 0,
                },
                temperatureRange: {
                    discomfort: 0,
                    noDiscomfort: 0,
                },
                pressureRange: {
                    discomfort: 0,
                    noDiscomfort: 0,
                },
            };
        }

        table[key].humidityRange[entry.ailment ? 'discomfort' : 'noDiscomfort'] += 1;
        table[key].temperatureRange[entry.ailment ? 'discomfort' : 'noDiscomfort'] += 1;
        table[key].pressureRange[entry.ailment ? 'discomfort' : 'noDiscomfort'] += 1;
    }

    return table;
}

const temperatureHumidityTable = tableForTemperatureAndHumidity(chart);
console.log(temperatureHumidityTable);


function getHumidityRange(humidity) {
    if (humidity < 40) return 'low humidity';
    if (humidity >= 40 && humidity < 60) return 'mild humidity';
    return 'high humidity';
}

function getTemperatureRange(temperature) {
    if (temperature < 10) return 'cold temperature';
    if (temperature >= 10 && temperature < 25) return 'mild temperature';
    return 'hot temperature';
}

function getPressureRange(pressure) {
    if (pressure < 1000) return 'low pressure';
    if (pressure >= 1000 && pressure < 1010) return 'medium pressure';
    return 'high pressure';
}



function getKeysWithNoDiscomfortZero(data) {
    const keysWithNoDiscomfortZero = [];

    for (const key in data) {
        const temperatureRange = data[key].temperatureRange;

        if (temperatureRange['no discomfort'] === 0) {
            keysWithNoDiscomfortZero.push(key.split('-'));
        }
    }
    return keysWithNoDiscomfortZero;
}

const result = getKeysWithNoDiscomfortZero(temperatureHumidityTable);
console.log(result);

function findCommonElement(arrays) {
    if (arrays == null || arrays.length === 0) {
        return;
    } else {
        const commonElements = arrays.reduce((acc, currentArray) => {
            return acc.filter(element => currentArray.includes(element));
        }, arrays[0]); // Use the first array as the initial value

        if(commonElements.length === 0) return 'the weather is not';
        return `${commonElements.join(' and ')} is`;
    }
}

const commonElement = findCommonElement(result);
console.log(commonElement);


function finalDiagnose() {
    const doctorNote = document.getElementById('doctorsNote');
    const contents = document.querySelector('.contents');
    const p1 = document.querySelector('.cursive1');
    const p2 = document.querySelector('.cursive2');
    contents.classList.add('hidden');
    doctorNote.classList.remove('hidden');
    p1.innerText = `It appears that consuming ${higherFood} is causing your discomfort, I would recommend that you stop eating it and test again.`;
    p2.innerText = `It appears that ${commonElement} a determining factor in your discomfort`;
}


document.querySelector('.tips').innerText = `${contentTips[tip]}`;

document.querySelector('.chartBtn').addEventListener('click', processData);

document.querySelector('.listBtn').addEventListener('click', function() {
    finalDiagnose();
    removeDataFromStorage();
});

burgerWrap.addEventListener('click', () => {
    openSlideMenu();
});

burgerWrap.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        openSlideMenu();
    }
});

closeBtn.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
        closeSlideMenu(); 
    }
});


