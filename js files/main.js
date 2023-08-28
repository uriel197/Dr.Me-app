const weatherInfo = document.querySelector('.contents'); 
const cityName = document.querySelector('.cityInput');
const ailmentCheckbox = document.querySelector('.checkbox');
const apiKey = '';

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
            'experienced discomfort': 0,
            'no discomfort': 0,
        },
        humidityRange: {
            'experienced discomfort': 0,
            'no discomfort': 0,
        },
        pressureRange: {
            'experienced discomfort': 0,
            'no discomfort': 0,
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
                    'experienced discomfort': 0,
                    'no discomfort': 0,
                },
                temperatureRange: {
                    'experienced discomfort': 0,
                    'no discomfort': 0,
                },
                pressureRange: {
                    'experienced discomfort': 0,
                    'no discomfort': 0,
                },
            };
        }

        table[key].humidityRange[entry.ailment ? 'experienced discomfort' : 'no discomfort'] += 1;
        table[key].temperatureRange[entry.ailment ? 'experienced discomfort' : 'no discomfort'] += 1;
        table[key].pressureRange[entry.ailment ? 'experienced discomfort' : 'no discomfort'] += 1;
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




/************* COMMENTS ************

****** SECURITY COMMENTS *******

trim() is used to remove leading and trailing whitespace from the input.
encodeURIComponent() is used to ensure that the city name is properly encoded for URL use, preventing potential URL injection attacks.
replace(/[^A-Za-z\s]/g, '') uses a regular expression to remove any characters that are not letters (A-Z and a-z) or whitespace.
This combination of validation and sanitization should help mitigate potential security risks associated with user-provided city names. However, remember that server-side validation is also crucial to ensure data integrity and security.

******* REGEX ********
The "g" that you are talking about at the end of your regular expression is called a "modifier". The "g" represents the "global modifier". This means that your replace will replace all copies of the matched string with the replacement string you provide.
A list of useful modifiers:

g - Global replace. Replace all instances of the matched string in the provided text.
i - Case insensitive replace. Replace all instances of the matched string, ignoring differences in case.
m - Multi-line replace. The regular expression should be tested for matches over multiple lines.
You can combine modifiers, such as g and i together, to get a global case insensitive search.

Examples:

//Replace the first lowercase t we find with X
'This is sparta!'.replace(/t/,'X');
//result: 'This is sparXa!'

//Replace the first letter t (upper or lower) with X
'This is sparta!'.replace(/t/i, 'X');
//result: 'Xhis is sparta!'

//Replace all the Ts in the text (upper or lower) with X
'This is sparta!'.replace(/t/gi, 'X' );
//result: 'Xhis is sparXa!'

In our code, the purpose of using the regular expression [^A-Za-z\s] along with the replace function is to sanitize the cityNameValue before using it in a URL for an API request. The regular expression is used to remove any special characters or non-letter characters from the cityNameValue, ensuring that the value passed in the API URL is composed only of letters and whitespace.
This sanitization step is important because URLs should not contain special characters or spaces. URLs are typically composed of a limited set of characters, and using special characters directly in a URL can lead to issues like encoding problems, unexpected behavior, and security vulnerabilities. By sanitizing the city name using the regular expression and replace method, you are ensuring that the resulting sanitizedCityName contains only characters that are safe to include in a URL.
encodeURIComponent() is a JavaScript function that is used to encode special characters in a URL. When you include certain characters in a URL, such as spaces, ampersands, question marks, and others, they need to be properly encoded to ensure that the URL remains valid and correctly interpreted by web browsers and servers.
When constructing URLs for API requests or other web-related operations in JavaScript, it's a good practice to use encodeURIComponent() on any dynamic values that will be included in the URL. This helps prevent issues related to special characters in URLs and ensures that the URL is correctly formed.


***1: in all these functions that deal with saving in storage and removing from storage, you must use the same variable to access, save and remove data from storage. in our case we are using the variable 'info', we must use the same variable in all these functions otherwise, if we used 'info' in the getChart() and then used 'data' for the saveDataToStorage() then localStorage will not connect the 2 of them, so, if you save something inside 'info' then in order to retieve it you must access the same variable.


*** 2: In JavaScript, you can certainly initialize maxPhiFood as let maxPhiFood; without assigning it an initial value. This will make maxPhiFood have the initial value of undefined. Then, you can assign values to it later in the loop, like maxPhiFood = food;.
However, there are a few considerations to keep in mind:

Comparison with undefined: If you initialize maxPhiFood as undefined, you should make sure that your comparison logic later in the loop accounts for this. For example, you can modify the comparison condition to include a check for undefined:

if (phiValue > maxPhiValue || maxPhiFood === undefined) {
maxPhiValue = phiValue;
maxPhiFood = food;
}
Use of an Empty String: Initializing maxPhiFood with an empty string ('') in your provided code is likely done to ensure that maxPhiFood is of type string from the start. This could help avoid potential issues when comparing it with other string values or when concatenating it with strings. If you're sure that food is always a string, you could initialize it as let maxPhiFood; and adjust your comparison and usage logic accordingly.


***3: (entry of info) doesn't refer to each element inside an entry like: ailment, city, foods ...
ailment: true
city: "lima"
foods: (2) ['rice', ' pasta']
humidity: 64
humidityRange: {experienced discomfort: 0, no discomfort: 0}
pressure: 1014
pressureRange: {experienced discomfort: 0, no discomfort: 0}
temperature: 21.14
temperatureRange: {experienced discomfort: 0, no discomfort: 0}

instead, it refers to the entire object which contains all of these elements ailment, city, foods ... it is saying in each one of these, you are gonna add a 1 to either experienced discomfort or no discomfort.


***4: if you are wondering where do table.humidity, temperature, pressure come from, they come from here:

function tableForTemperatureAndHumidity(info) {
    const table = {};
    for (let entry of info) { 
        const humidityRange = getHumidityRange(entry.humidity)
        const temperatureRange = getTemperatureRange(entry.temperature);
        const pressureRange = getPressureRange(entry.pressure);
        const key = `${humidityRange}-${temperatureRange}-${pressureRange}`;

which means, that humidityRange = entry.humidity but expressed as either "low humidity", " mild humidity" or "high humidity" and it gets pushed inside "table".

highestTrueKey: This variable is used to store the key (condition) that corresponds to the highest "experienced discomfort" value among the different conditions present in the table object. It keeps track of the key that has the highest count of "experienced discomfort" for temperature, humidity, and pressure.
table[key]: This expression is used to access a specific entry in the table object using the current key. It represents the data associated with a specific combination of conditions (humidity, temperature, and pressure). For example, table['high humidity-hot temperature-medium pressure'] accesses the data corresponding to the conditions of high humidity, hot temperature, and medium pressure.
In each iteration of the loop, the code accesses the data associated with the current key using table[key], and then extracts the "experienced discomfort" value for temperature, humidity, and pressure. The purpose of highestTrueKey is to keep track of the key that has the highest "experienced discomfort" value among the different conditions. If the current condition has a higher "experienced discomfort" value than the previous highest value, the variables highestTrueKey, highestTrueValue, and highestTrueElement are updated accordingly.

*/
