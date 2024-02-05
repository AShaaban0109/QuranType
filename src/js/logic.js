import utils from './utils.js';

const BASMALLA = "بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ"
const QURAN_SYMBOLS = ["۞‎", "﴾","﴿", "۩‎"]

// Check for saved dark mode preference
const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
let isDarkMode = localStorage.getItem('darkMode') === 'enabled' || prefersDarkMode;


let currentLetterIndex = 0
let mainQuranWordIndex = 0 // this will be one ahead of notashkeet due to the ayah numbers
let noTashkeelWordIndex = 0
let ayahNumberIndices = [-1]


let originalTopOffset = 0  // for detecting autoscroll to next line
let currentSearchQuery = "1"


// Function to retrieve and populate a Surah into the div
function getSurah(surahNumber = 1, startAyah = 1, endAyah = 9999) {
    // clear everything
    currentLetterIndex = 0
    mainQuranWordIndex = 0
    noTashkeelWordIndex = 0
    ayahNumberIndices = [-1]
    // Make an API request to fetch the Surah data
    $.ajax({
        // url: `http://api.alquran.cloud/v1/surah/${surahNumber}`,
        url: `https://api.alquran.cloud/v1/surah/${surahNumber}?offset=${startAyah -1}&limit=${endAyah - 1}`,

        type: "GET",
        dataType: "json",

        success: function (data) {
            if (endAyah > data.data.numberOfAyahs) {
                endAyah = data.data.numberOfAyahs
            }
            // console.log(data.data);
            displaySurahFromJson(data, startAyah, endAyah)
        },
        error: function (error) {
            console.log("Error:", error);
        }
    });
}

// Extract and display the Surah content from the API response
function displaySurahFromJson(data, startAyah, endAyah) {
    const quranContainer = document.getElementById("Quran-container");
    const surahName = document.getElementById("Surah-name");
    const BasmallahContainer = document.getElementById("Basmallah");
    
    let noTashkeelAyahs = []
    let surahContent = data.data.ayahs.map(function (ayah) {
        const arabicNumber = utils.convertToArabicNumber(ayah.numberInSurah )
        const processedAyah = ayah.text.replace("\n", "")  // remove this if want to log on new lines 
        noTashkeelAyahs.push(processedAyah)

        return `${processedAyah} ﴿${arabicNumber}﴾`;
          
    }).join(" ");


    surahName.textContent =  data.data.name

    // // handle Basmallah in all surahs except 1:Al-Fatiha, and 9:Al-Tawba
    switch (data.data.number) {
      case 1:
          BasmallahContainer.textContent = "";
          break;
  
      case 9:
          BasmallahContainer.textContent = "";
          break;
  
      default:
          BasmallahContainer.textContent = BASMALLA;

          if (startAyah==1) {
              surahContent = surahContent.slice(40);
              noTashkeelAyahs[0] = noTashkeelAyahs[0].slice(40);
          }
  }

  // Wait for fonts to load then fill container. Fixes offsetTop issue
  document.fonts.ready.then(function () {
        // The code using offsetTop here
        fillContainerWithRows(surahContent, quranContainer);
    });

    // create new hidden div with no tashkeel to match with the typing
    const noTashkeel = utils.createNoTashkeelString(noTashkeelAyahs)
    const hiddenDiv = document.getElementById('noTashkeelContainer');
    utils.fillContainer(noTashkeel, hiddenDiv)
}

function fillContainerWithRows(surahContent, container) {
    utils.clearContainer(container);
    originalTopOffset = utils.getOriginalTopOffset(container)

    let words = surahContent.split(" ");
    words.forEach((word) => {
        const span = document.createElement('span');
        span.textContent = word + ' ';
        container.appendChild(span);
    });
}

function handleInput(event) {
    const quranContainer = document.getElementById("Quran-container");
    const wordSpans = quranContainer.querySelectorAll('span');

    const noTashkeelContainer = document.getElementById("noTashkeelContainer");
    const quranText = noTashkeelContainer.childNodes[noTashkeelWordIndex].textContent;

    const inputText = event.data;
    const currentLetter = quranText[currentLetterIndex];

    if (inputText !== currentLetter) {
        utils.applyIncorrectWordStyle(wordSpans[mainQuranWordIndex])
    } else {
        handleCorrectInput(wordSpans, quranText);
    }
}

function handleCorrectInput(wordSpans, quranText) {
    const currentLetter = quranText[currentLetterIndex];
    const correctWord = wordSpans[mainQuranWordIndex];

    // Check if current letter is not a space (Next word check)
    if (currentLetter !== " ") {
        currentLetterIndex++;
    } else {
        // otherwise we handle the correct word
        const inputElement = document.getElementById("inputField");
        if (inputElement.value !== quranText) {
            return;
        }
    
        utils.applyCorrectWordStyle(correctWord)
        inputElement.value = "";
        handleNextWord(wordSpans);
    }
}

function handleNextWord(wordSpans) {
    currentLetterIndex = 0;
    mainQuranWordIndex++;
    noTashkeelWordIndex++;

    utils.handleOffsetTop(wordSpans, wordSpans[mainQuranWordIndex], originalTopOffset);
    handleEndOfAyahCheck(wordSpans);
}


// Check if the next word is an ayah number. Handle if so.
function handleEndOfAyahCheck(wordSpans) {
    const endOfAyah = wordSpans[mainQuranWordIndex];
    if (QURAN_SYMBOLS.some(char => endOfAyah.textContent.includes(char))) {
        ayahNumberIndices.push(mainQuranWordIndex)
        utils.applyCorrectWordStyle(endOfAyah)
        mainQuranWordIndex++
    }
}

let isHideAyahsButtonActive = false

function handleHideAyahsButton(event) {
    // Toggle the visibility state
    isHideAyahsButtonActive = !isHideAyahsButtonActive;
    
    const quranContainer = document.getElementById("Quran-container");
    const wordSpans = quranContainer.querySelectorAll('span');
    
    // clear
    wordSpans.forEach(span => {
        span.style.display = 'hidden';
      });
      

    let mostRecentAyahNumIndex = ayahNumberIndices[ayahNumberIndices.length - 1]
    let beforeMostRecentAyahNumIndex = ayahNumberIndices[ayahNumberIndices.length - 1]
    if (ayahNumberIndices.length !==1) {
         beforeMostRecentAyahNumIndex = ayahNumberIndices[ayahNumberIndices.length - 2]
    }

    for (let i = beforeMostRecentAyahNumIndex + 1; i < wordSpans.length; i++) {
        const word = wordSpans[i];
        if (isHideAyahsButtonActive) {
            // If non-green text is currently visible, hide it
            if (word.style.color !== "green") {
                word.style.display = "none"; // or any other way to hide the element
            }
        } else {
            // If non-green text is currently hidden, show it
            word.style.display = "inline"; // or any other way to show the element

        }
    }
}

// helper function for now. for testing
// todo refactor this and the other button to make them nicer
function handleInputButton(event) {
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
    // console.log(toPrint.join(""));
}

function processSearch(query) {
    // to prevent constant clicking of search button, with the same query
    if (currentSearchQuery === query) {
        return
    } else {
        currentSearchQuery = query
    }
    // TODO allow name search
    // current functionality splits at ' ', ':', ',', and '-'
    const numbers = query.trim().split(/[\s,:-]+/).map(Number);

    switch (numbers.length) {
      case 1:
        getSurah(numbers[0])
        break;
      case 2:
        getSurah(numbers[0], numbers[1])
        break;
      case 3:
        getSurah(numbers[0], numbers[1], numbers[2])
        break;
      default:
        alert("Please enter query in the format of a maximum of 3 numbers, seperated by spaces, commas, colons, or hyphens. ");
    }
}

function addListeners() {
    // Adding event listener for dark mode toggle
    const darkModeButton = document.getElementById('dark-mode-toggle');
    darkModeButton.addEventListener('click', function() {
        isDarkMode = utils.toggleDarkMode(isDarkMode)
    });

    // Adding event listener for hide ayahs toggle
    const hideAyahsButton = document.getElementById('hideAyahsButton');
    hideAyahsButton.addEventListener('click', handleHideAyahsButton);

    // isDarkMode = utils.toggleDarkMode(isDarkMode)


    var inputElement = document.getElementById("inputField");
    var processButton = document.getElementById("processButton");

    // Add event listeners for typing
    inputElement.addEventListener("input", handleInput);

    // FOR DEBUGGING: Uncomment this and the button in the HTML
    // processButton.addEventListener("click", function() {
    //    var inputValue = inputElement.value;
    //    handleInputButton(inputValue);
    // });

    var surahInputElement = document.getElementById("Surah-selection-input");
    var surahProcessButton = document.getElementById("Display-Surah-button");

    // Add event listeners for Surah selection
    surahProcessButton.addEventListener("click", function() {
        var inputValue = surahInputElement.value;
        processSearch(inputValue)
    });

    document.addEventListener("DOMContentLoaded", function() {
        // Focus on the input box when the page is loaded
        document.getElementById("inputField").focus();
    });
}

// Init
function runApp(surahNumber = 1, startAyah = 1, endAyah = 999) {
    utils.initDarkMode(isDarkMode)
    addListeners()

    // Call the function to get and populate the Surah when the page loads
    getSurah(surahNumber, startAyah, endAyah);
}

runApp(1)