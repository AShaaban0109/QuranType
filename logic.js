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



function convertToArabicNumber(englishNumber) {
    englishNumber = englishNumber.toString()

    const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    const englishDigits = "0123456789";
    const englishToArabicMap = {};
  
    for (let i = 0; i < englishDigits.length; i++) {
      englishToArabicMap[englishDigits[i]] = arabicNumbers[i];
    }
  
    const arabicNumber = englishNumber.replace(/\d/g, function (match) {
      return englishToArabicMap[match];
    });
  
    return arabicNumber;
  }

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
        const arabicNumber = convertToArabicNumber(ayahIdx + 1 )
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
  // bug fix. Wait for fonts to load then fill container. Fixes offsetTop issue
  document.fonts.ready.then(function () {
        // Your code using offsetTop here
        fillContainerWithRows(surahContent, quranContainer);
    });

    

    const noTashkeel = createNoTashkeelString(noTashkeelAyahs)

    // create new hidden div with no tashkeel to match with the typing
    const hiddenDiv = document.getElementById('noTashkeelContainer');
    // hiddenDiv.textContent = noTashkeel;
    fillContainer(noTashkeel, hiddenDiv)
}

// quick insert and removal to get the true span offsetTop value
function getOriginalTopOffset(container) {
    const testRow = document.createElement('div');
    const temp = document.createElement('span');
    container.appendChild(testRow);
    testRow.appendChild(temp)

    let currentTopOffset = temp.offsetTop
    testRow.removeChild(temp)
    container.removeChild(testRow)
    return currentTopOffset
}

function clearContainer(container) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
}



function fillContainerWithRows(surahContent, container) {
    clearContainer(container)
    let words = surahContent.split(" ")
    let currentTopOffset = getOriginalTopOffset(container)


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

// for an old usecase
function fillContainer(surahContent, container) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
      }

    // turn each word into a span
    let words = surahContent.split(" ")
    console.log(words.join(" "));

    words.forEach((word) => {
        let wordSpan = document.createElement("span");
        wordSpan.textContent = word + " "
        container.appendChild(wordSpan)
    });
}

function createNoTashkeelString(noTashkeelAyahs) {
    noTashkeelAyahs = noTashkeelAyahs.map((ayah) => removeTashkeel(ayah))
    return noTashkeelAyahs.join(" ")
}

function getTransitionDuration(element) {
    // Get the computed style of the element
    let style = window.getComputedStyle(element);
    
    // Extract the 'transition-duration' property value
    let transitionDuration = style.getPropertyValue('transition-duration');
  
    // Convert the string value to a number in milliseconds
    let durationInMs = parseFloat(transitionDuration) * 1000;
  
    // Return the duration in milliseconds
    return durationInMs;
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
                let transitionDuration = getTransitionDuration(rows[0]); // Fetch transition duration

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

function removeTashkeel(text) {
    let noTashkeel = text

    noTashkeel = noTashkeel.replace(/\u0670/g, '\u0627');  // replace the small subscript alef with aleg
    noTashkeel = noTashkeel.replace(/\u0671/g, '\u0627');  // replace the alef wasl with alef
    noTashkeel = noTashkeel.replace(/\u06CC/g,'\u064A');  // fix an issue with the ya encoding (persian for some reason)
    
    // this removes everything that isnt a main char, or a 
    noTashkeel = noTashkeel.replace(/[^\u0621-\u063A\u0641-\u064A\u0654-\u0655 ]/g, '');
    
    // change the ya with hamza underneath to ya with hamza above as this is available on keyboard
    noTashkeel = noTashkeel.replace(/\u0649\u0655/g,'\u0626');
    return noTashkeel
}

function initDarkMode() {
    // Apply dark mode if enabled
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.getElementById('light-mode-icon').style.display = 'none';
        document.getElementById('dark-mode-icon').style.display = 'inline';
    }
}

// Function to toggle dark mode
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode');

    // Update the icon display
    document.getElementById('light-mode-icon').style.display = isDarkMode ? 'none' : 'inline';
    document.getElementById('dark-mode-icon').style.display = isDarkMode ? 'inline' : 'none';

    // Save the dark mode preference
    localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
}

function addListeners() {
    // Adding event listener for dark mode toggle
    const darkModeButton = document.getElementById('dark-mode-toggle');
    darkModeButton.addEventListener('click', toggleDarkMode);


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

function runApp(surahNumber = 1) {
// Init
initDarkMode()
addListeners()

// Call the function to get and populate the Surah when the page loads
getSurah(114);
}

runApp(114)