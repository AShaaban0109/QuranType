import utils from './utils.js';

const QURAN_SYMBOLS = ["۞‎", "﴾","﴿", "۩‎"]

// Check for saved dark mode preference
const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
let isDarkMode = localStorage.getItem('darkMode') === 'enabled' || prefersDarkMode;

let MAX_ROWS = 5

let rows = []
let rowEndIndices = []
let rowIndex = 0
let currentLetterIndex = 0
let mainQuranWordIndex = 0 // this will be one ahead of notashkeet due to the ayah numbers
let noTashkeelWordIndex = 0

// Function to retrieve and populate a Surah into the div
function getSurah(surahNumber = 1) {
    // clear everything
    rowIndex = 0
    rows = []
    rowEndIndices = []
    currentLetterIndex = 0
    mainQuranWordIndex = 0
    noTashkeelWordIndex = 0

    // Make an API request to fetch the Surah data
    $.ajax({
        url: `http://api.alquran.cloud/v1/surah/${surahNumber}`,
        type: "GET",
        dataType: "json",

        success: function (data) {
        displaySurahFromJson(data)     
        },

        error: function (error) {
        console.log("Error:", error);
        }
    });
}

// Extract and display the Surah content from the API response
function displaySurahFromJson(data) {
    const quranContainer = document.getElementById("Quran-container");
    const surahName = document.getElementById("Surah-name");
    const BasmallahContainer = document.getElementById("Basmallah");
    
    let noTashkeelAyahs = []
    let surahContent = data.data.ayahs.map(function (ayah, ayahIdx) {
        const arabicNumber = utils.convertToArabicNumber(ayahIdx + 1 )
        const processedAyah = ayah.text.replace("\n", "")  // remove this if want to log on new lines 
        noTashkeelAyahs.push(processedAyah)

        return `${processedAyah} ﴿${arabicNumber}﴾`;
          
    }).join(" ");


    surahName.textContent =  data.data.name

    // handle Basmallah in all surahs except 1:Al-Fatiha, and 9:Al-Tawba
    switch (data.data.number) {
      case 1:
          BasmallahContainer.textContent = "";
          break;
  
      case 9:
          BasmallahContainer.textContent = "";
          break;
  
      default:
          const Basmallah = surahContent.substring(0, 39);
          BasmallahContainer.textContent = Basmallah;
  
          surahContent = surahContent.slice(40);
          noTashkeelAyahs[0] = noTashkeelAyahs[0].slice(40);
  }

  // Wait for fonts to load then fill container. Fixes offsetTop issue
  document.fonts.ready.then(function () {
        // Your code using offsetTop here
        fillContainerWithRows(surahContent, quranContainer);
    });
    
    // create new hidden div with no tashkeel to match with the typing
    const noTashkeel = utils.createNoTashkeelString(noTashkeelAyahs)
    const hiddenDiv = document.getElementById('noTashkeelContainer');
    utils.fillContainer(noTashkeel, hiddenDiv)
}

function fillContainerWithRows(surahContent, container) {
    utils.clearContainer(container)
    let words = surahContent.split(" ")
    let currentTopOffset = utils.getOriginalTopOffset(container)


    let currentRow = document.createElement('div');
    currentRow.classList.add("row")
    rows.push(currentRow)
    container.appendChild(currentRow);

    words.forEach((word, wordIndex) => {
        const span = document.createElement('span');
        span.textContent = word + ' ';
        currentRow.appendChild(span);

        // Measure the offsetTop of the word span. If is greater than the current,
        // then span has been auto moved on to the next line. detect this and handle it.
        const offsetTop = span.offsetTop;
        if (offsetTop > currentTopOffset) {

            // add the previous word as the last word in that row. 
            // This can then be used to hide that row and 'scroll' to the next when that word is typed. 
            rowEndIndices.push(wordIndex - 1)

            currentRow.removeChild(span)

            currentRow = document.createElement('div');
            currentRow.classList.add("row")
            rows.push(currentRow)
            container.appendChild(currentRow);
            currentRow.appendChild(span); // Add the word to the new row
            
            currentTopOffset = span.offsetTop; // Reset the topOffset for the new row
            if (MAX_ROWS < rows.length) {
                // currentRow.classList.add("hidden")
            }
        }
    });
}

function handleInput(event) {
    const quranContainer = document.getElementById("Quran-container");
    const wordSpans = quranContainer.querySelectorAll('span');

    const noTashkeelContainer = document.getElementById("noTashkeelContainer");
    let quranText = noTashkeelContainer.childNodes[noTashkeelWordIndex].textContent 

    const inputText = event.data;
    const currentLetter = quranText[currentLetterIndex];

    if (inputText !== currentLetter) {
        const incorrectWord = wordSpans[mainQuranWordIndex]
        incorrectWord.style.color = "red"
    } else {
        console.log(inputText);
        currentLetterIndex++;

        // next word
        if (currentLetter === " ") {
            const correctWord = wordSpans[mainQuranWordIndex]
            correctWord.style.color = "green"
            
            // check if reached end of row
            if (mainQuranWordIndex === rowEndIndices[rowIndex]) {            
                let transitionDuration = utils.getTransitionDuration(rows[0]); // Fetch transition duration

                rows[rowIndex].classList.add("hidden")
                setTimeout(function() {
                    rows[rowIndex].classList.add("display-none")
                    rowIndex++
                  }, transitionDuration);
            }

            
            currentLetterIndex = 0
            mainQuranWordIndex++
            noTashkeelWordIndex++

            // check if next word is ayah number
            const endOfAyah = wordSpans[mainQuranWordIndex]
            if (QURAN_SYMBOLS.some(char => endOfAyah.textContent.includes(char)  )) {
                mainQuranWordIndex++
            }
        }
    }
}

// helper function for now. for testing
// todo refactor this and the other button to make them nicer
function handleInputButton(event) {
    rowIndex = 0
    mainQuranWordIndex = 0
    noTashkeelWordIndex = 0
    newCurrentLetterIndex = 0
    
    const quranContainer = document.getElementById("Quran-container");
    const wordSpans = quranContainer.querySelectorAll('span');


    const noTashkeelContainer = document.getElementById("noTashkeelContainer");
    let quranText = noTashkeelContainer.childNodes[noTashkeelWordIndex].textContent 
    
    quranContainer.childNodes.forEach(node => {
        node.style.color = document.body.style.color
    });

    let currentLetter = quranText[newCurrentLetterIndex];
    let toPrint = []
    for (let i = 0; i < event.length; i++) {
        currentLetter = quranText[newCurrentLetterIndex]
        if (event[i] === currentLetter) {
            toPrint.push(currentLetter);            
            newCurrentLetterIndex++
        } else {
            const incorrectWord = wordSpans[mainQuranWordIndex]
            incorrectWord.style.color = "red"            
        }
        // next word
        if (currentLetter === " ") {
            const correctWord = wordSpans[mainQuranWordIndex]
            correctWord.style.color = "green"
            
            newCurrentLetterIndex = 0
            mainQuranWordIndex++
            noTashkeelWordIndex++
            quranText = noTashkeelContainer.childNodes[noTashkeelWordIndex].textContent 


            // check if next word is ayah number
            const endOfAyah = wordSpans[mainQuranWordIndex]
            if (QURAN_SYMBOLS.some(char => endOfAyah.textContent.includes(char)  )) {
                mainQuranWordIndex++
            }
        }
    }
    console.log(toPrint.join(""));
}

function addListeners() {
    // Adding event listener for dark mode toggle
    const darkModeButton = document.getElementById('dark-mode-toggle');
    darkModeButton.addEventListener('click', function() {
        isDarkMode = utils.toggleDarkMode(isDarkMode)
    });


    var inputElement = document.getElementById("inputField");
    var processButton = document.getElementById("processButton");

    // Add event listeners for typing
    inputElement.addEventListener("input", handleInput);
    processButton.addEventListener("click", function() {
        var inputValue = inputElement.value;
        handleInputButton(inputValue);
    });

    var surahInputElement = document.getElementById("Surah-selection-input");
    var surahProcessButton = document.getElementById("Display-Surah-button");

    // Add event listeners for Surah selection
    surahProcessButton.addEventListener("click", function() {
        var inputValue = surahInputElement.value;
        getSurah(inputValue)
    });
}

// Init
function runApp(surahNumber = 1) {
utils.initDarkMode(isDarkMode)
addListeners()

// Call the function to get and populate the Surah when the page loads
getSurah(114);
}

runApp(114)