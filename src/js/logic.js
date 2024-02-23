import utils from './utils.js';

const BASMALLA = "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ"
const QURAN_SYMBOLS = ["۞‎", "﴾","﴿", "۩‎", 'ۖ', 'ۗ', 'ۘ', 'ۙ', 'ۚ', ' ۛ' , 'ۜ', 'ۛ ']
let PROPERTIES_OF_SURAHS = null

// Check for saved dark mode preference
const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
let isDarkMode = localStorage.getItem('darkMode') === 'enabled' || prefersDarkMode;

let isHideAyahsButtonActive = false
let currentSearchQuery = "1"

let currentLetterIndex = 0
let mainQuranWordIndex = 0 // this will be one ahead of notashkeet due to the ayah numbers
let noTashkeelWordIndex = 0

// for detecting autoscroll to next line
let originalTopOffset = 0 
let secondRowTopOffset = 0
let refWord = ""


async function setupSurahData() {
    const baseApiUrl = 'https://api.quran.com/api/v4';
    const url = `${baseApiUrl}/chapters`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch surah data');
        }
        PROPERTIES_OF_SURAHS = await response.json();
    } catch (error) {
        console.error('Error fetching surah data:', error);
    }
}

// TODO: Update params for other functions
// Function to fetch Quran verses in imlaei script
async function getSurah(surahNumber, startAyah, script) {
    // clear everything
    currentLetterIndex = 0
    mainQuranWordIndex = 0
    noTashkeelWordIndex = 0

    // Constructing the URL with query parameters
    const baseApiUrl = 'https://api.quran.com/api/v4';
    const url = `${baseApiUrl}/quran/verses/${script}?chapter_number=${surahNumber}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch verses');
        }
        const data = await response.json();
        if (startAyah > data.verses.length) {
            const surahName= PROPERTIES_OF_SURAHS.chapters[surahNumber -1].name_simple
            showToast(`${surahName} only contains ${data.verses.length} ayahs. `)
            displaySurahFromJson(data, 1, script)
        } else {
            displaySurahFromJson(data, startAyah, script)
        }
    } catch (error) {
        console.error('Error fetching verses:', error);
    }
}

function showToast(message) {
    Toastify({
        text: message,
        duration: 5000, // Duration in milliseconds
        gravity: "bottom", // toast position
        position: 'center', // toast position
        close: true,
      }).showToast();
}


function processAyah(text) {
    let ayah = text

    // handle iqlab. 
    ayah = ayah.replace(/\u064B\u06E2/g, '\u064E\u06E2'); // fathateen then meen, to fatha then meen.
    ayah = ayah.replace(/\u064C\u06E2/g, '\u064F\u06E2'); // dammateen then meen, to damma then meen.
    ayah = ayah.replace(/\u064D\u06ED/g, '\u0650\u06ED'); // kasrateen then meen, to kasra then meen.

    return ayah
}

function processData(data, startAyah, script) {
    const textProp = "text_" + script
    // fixes issue of all surahs except the first starting with a space, which messes up the indexing
    if (data.verses[0][textProp].startsWith(' ')) {
        data.verses[0][textProp] = data.verses[0][textProp].trim();
    }

    // only return verses the user requested
    data.verses = data.verses.slice(startAyah -1)
    return data
}

// Extract and display the Surah content from the API response
function displaySurahFromJson(data, startAyah, script) {
    const quranContainer = document.getElementById("Quran-container");
    const surahName = document.getElementById("Surah-name");
    const BasmallahContainer = document.getElementById("Basmallah");
    
    data = processData(data, startAyah, script)
    let noTashkeelAyahs = []

    let surahContent = data.verses.map(function (ayah, i) {
        const arabicNumber = utils.convertToArabicNumber(startAyah + i)
        const processedAyah = processAyah(ayah["text_" + script])
        noTashkeelAyahs.push(processedAyah)
        
        return `${processedAyah} ﴿${arabicNumber}﴾`;
    }).join(" ");

    const chapterNumber = data.meta.filters.chapter_number -1 
    surahName.textContent = "سورة " + PROPERTIES_OF_SURAHS.chapters[chapterNumber].name_arabic

    const isThereABasmalah = PROPERTIES_OF_SURAHS.chapters[chapterNumber].bismillah_pre
    if (isThereABasmalah) {
        BasmallahContainer.textContent = BASMALLA;
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
    // console.log(noTashkeel);
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

    handleOffsetTop(wordSpans, wordSpans[mainQuranWordIndex]);
    handleEndOfAyahCheck(wordSpans);    
}

// Measure the offsetTop of the word span. If is greater than the current,
// then span has been auto moved on to the next line. detect this and handle it.
// Autoscrolls when the second row has been filled.
function handleOffsetTop(wordSpans, wordToCheck) {
    const offsetTop = wordToCheck.offsetTop;

    if (offsetTop > originalTopOffset) {
        // one time operation to set the secondRowTopOffset for use in later detections.
        if (secondRowTopOffset === 0) {
            secondRowTopOffset = offsetTop
            refWord = wordToCheck
        }

        if (offsetTop > secondRowTopOffset) {
            utils.handleHiddenWords(wordSpans, refWord);
            refWord=wordToCheck
        }
    }
}

// Check if the next word is an ayah number. Handle if so.
// This also handles presencs of special chars like the stop marks.
// This is because in this implementation they are rendered as seperate spans.
function handleEndOfAyahCheck(wordSpans) {
    let endOfAyah = wordSpans[mainQuranWordIndex];
    while (QURAN_SYMBOLS.some(char => endOfAyah.textContent.includes(char))) {
        utils.applyCorrectWordStyle(endOfAyah)
        mainQuranWordIndex++

        endOfAyah = wordSpans[mainQuranWordIndex];
        // if there is a next word
        if (endOfAyah !== undefined) {
            handleOffsetTop(wordSpans, wordSpans[mainQuranWordIndex]);
        } else {
            break
        }
    }
}

function handleHideAyahsButton(event) {
    // Toggle the visibility state
    isHideAyahsButtonActive = !isHideAyahsButtonActive;
    
    const quranContainer = document.getElementById("Quran-container");
    const wordSpans = quranContainer.querySelectorAll('span');

    if (isHideAyahsButtonActive) {
        wordSpans.forEach(span => {
            if (span.style.display !== 'none' && !span.classList.contains('correctWord')) {
                span.style.visibility = 'hidden';
            }
          });
    } else {
        wordSpans.forEach(span => {
            if (span.style.display !== 'none' ) {
                span.style.visibility = 'visible';
            }
          });
    }
}

function processSearch(query) {
    // to prevent constant clicking of search button, with the same query
    if (currentSearchQuery === query) {
        return
    } else {
        currentSearchQuery = query
    }

    // current functionality splits at ' ', ':', ',', and '-'
    const processedQuery = query.trim().split(/[\s,:-]+/);


    // Reject if the query is more than 2 elements
    if (processedQuery.length > 2) {
        showToast(`Please enter query in the format of a maximum of 2 numbers (surah number and ayah number), seperated by spaces, commas, colons, or hyphens.  `)
        return
    } 
    // Reject if the query is empty
    else if (processedQuery.some((element, index) => index === 0 && element === '')) {
        showToast(`Please enter query in the format of a maximum of 2 numbers (surah number and ayah number), seperated by spaces, commas, colons, or hyphens.  `)
        return
    }
    // TODO Allow name search
    // Reject if the query has text
    else if (processedQuery.some(element => isNaN(element))) {
        showToast(`Please enter query in the format of a maximum of 2 numbers (surah number and ayah number), seperated by spaces, commas, colons, or hyphens.  `)
        return
    } 
    // Reject if the first number is over 114
    else if (parseInt(processedQuery[0]) > 114) {
        showToast(`Surah number must be between 1-114. `)
        return
    } 
    else {
        if (processedQuery.length === 1) {
            getSurah(parseInt(processedQuery[0]), 1, 'uthmani')
        } else if (processedQuery.length === 2) {
            getSurah(parseInt(processedQuery[0]), parseInt(processedQuery[1]), 'uthmani')
        }
        return
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
function runApp(surahNumber = 1, startAyah = 1, script='uthmani') {
    utils.initDarkMode(isDarkMode)
    addListeners()

    setupSurahData()
    .then(() => {
        // Call the function to get and populate the Surah when the page loads
        getSurah(surahNumber, startAyah, script);
    })
    .catch(error => {
        console.error('Error displaying verses:', error);
    });
}

runApp(1)