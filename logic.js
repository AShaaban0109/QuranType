import utils from './utils.js';

const BASMALLA = "بِسۡمِ ٱللَّهِ ٱلرَّحۡمَـٰنِ ٱلرَّحِیمِ"
const QURAN_SYMBOLS = ["۞‎", "﴾","﴿", "۩‎"]

// Check for saved dark mode preference
const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
let isDarkMode = localStorage.getItem('darkMode') === 'enabled' || prefersDarkMode;

let MAX_ROWS = 6

let rows = []
let rowEndIndices = []
let rowIndex = 0
let currentLetterIndex = 0
let mainQuranWordIndex = 0 // this will be one ahead of notashkeet due to the ayah numbers
let noTashkeelWordIndex = 0

// Function to retrieve and populate a Surah into the div
function getSurah(surahNumber = 1, startAyah = 1, endAyah = 9999) {
    // clear everything
    rowIndex = 0
    rows = []
    rowEndIndices = []
    currentLetterIndex = 0
    mainQuranWordIndex = 0
    noTashkeelWordIndex = 0
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
    
    var startTime = performance.now();


    // create new hidden div with no tashkeel to match with the typing
    const noTashkeel = utils.createNoTashkeelString(noTashkeelAyahs)
    const hiddenDiv = document.getElementById('noTashkeelContainer');
    utils.fillContainer(noTashkeel, hiddenDiv)

    var endTime = performance.now();
    var duration = endTime - startTime;
    console.log("AJAX request duration: " + duration + " milliseconds");

}

// function fillContainerWithRows(surahContent, container) {
//     utils.clearContainer(container)
//     let words = surahContent.split(" ")
//     let currentTopOffset = utils.getOriginalTopOffset(container)


//     let currentRow = document.createElement('div');
//     currentRow.classList.add("row")
//     rows.push(currentRow)
//     container.appendChild(currentRow);

//     words.forEach((word, wordIndex) => {
//         const span = document.createElement('span');
//         span.textContent = word + ' ';
//         currentRow.appendChild(span);

//         // Measure the offsetTop of the word span. If is greater than the current,
//         // then span has been auto moved on to the next line. detect this and handle it.
//         const offsetTop = span.offsetTop;
//         if (offsetTop > currentTopOffset) {

//             // add the previous word as the last word in that row. 
//             // This can then be used to hide that row and 'scroll' to the next when that word is typed. 
//             rowEndIndices.push(wordIndex - 1)

//             currentRow.removeChild(span)

//             currentRow = document.createElement('div');
//             currentRow.classList.add("row")
//             rows.push(currentRow)
//             container.appendChild(currentRow);
//             currentRow.appendChild(span); // Add the word to the new row
            
//             currentTopOffset = span.offsetTop; // Reset the topOffset for the new row
            
//             // Optional
//             // if (MAX_ROWS < rows.length) {
//             //     currentRow.classList.add("hidden")
//             // }

//             if (MAX_ROWS < rows.length) {
//                 processRemainingRows(words, wordIndex, currentRow, currentTopOffset);
//                 return
//             }
//         }
//     });
// }

// function fillContainerWithRows(surahContent, container) {
//     utils.clearContainer(container)
//     let words = surahContent.split(" ")
//     let currentTopOffset = utils.getOriginalTopOffset(container)

//     let currentRow = document.createElement('div');
//     currentRow.classList.add("row")
//     rows.push(currentRow)
//     container.appendChild(currentRow);

//     let allWordSpans = []

//     const processWords = async (startIndex) => {
//         for (let wordIndex = startIndex; wordIndex < words.length; wordIndex++) {
//             const word = words[wordIndex];

//             await new Promise(resolve => setTimeout(resolve, 0)); // Introduce a small delay to yield to the event loop

//             if (wordIndex >= words.length) {
//                 // Check if the end of the word list has been reached
//                 break;
//             }

//             const span = document.createElement('span');
//             allWordSpans.push(span)
//             span.textContent = word + ' ';
//             span.classList.add("hidden")
//             currentRow.appendChild(span);

//             // Measure the offsetTop of the word span. If is greater than the current,
//             // then span has been auto moved on to the next line. detect this and handle it.
//             const offsetTop = span.offsetTop;
//             if (offsetTop > currentTopOffset) {

//                 // add the previous word as the last word in that row. 
//                 // This can then be used to hide that row and 'scroll' to the next when that word is typed. 
//                 rowEndIndices.push(wordIndex - 1)

//                 currentRow.removeChild(span)

//                 currentRow = document.createElement('div');
//                 currentRow.classList.add("row")
//                 rows.push(currentRow)
//                 container.appendChild(currentRow);
//                 currentRow.appendChild(span);

//                 currentTopOffset = span.offsetTop;

//                 // after 10 rows, unhide them at once, and let the rest be processed
//                 if (rows.length === 10) {
//                     allWordSpans.forEach(span => {
//                         span.classList.remove("hidden");
                
//                     });
//                     // Implement your logic here for handling the maximum number of rows
//                     // You might want to display the finished rows and continue processing in the background
//                     await new Promise(resolve => setTimeout(resolve, 0));
//                 }
//             }
//         }
//     };

//     const startProcessing = async () => {
//         await processWords(0); // Start processing from the beginning of the word list

//         // unhide all spans after the processing has finished
//         allWordSpans.forEach(span => {
//             span.classList.remove("hidden");
    
//         });
//         console.log("2");

//     };

//     startProcessing();
// }

function fillContainerWithRows(surahContent, container) {
    // Clear the container before populating with rows
    utils.clearContainer(container);

    // Split the surah content into individual words
    let words = surahContent.split(" ");

    // Get the initial top offset of the container
    let currentTopOffset = utils.getOriginalTopOffset(container);

    // Create the initial row and add it to the container
    let currentRow = document.createElement('div');
    currentRow.classList.add("row");
    container.appendChild(currentRow);

    // Arrays to store spans, row end indices, and row elements
    let allWordSpans = [];
    let rowEndIndices = [];
    let rows = [currentRow];

    // Function to create a span element for a given word
    const createSpan = (word) => {
        const span = document.createElement('span');
        allWordSpans.push(span);
        span.textContent = word + ' ';
        return span;
    };

    // Function to process a batch of words
    const processBatch = async (startIndex, batchSize) => {
        // Create a document fragment for efficient DOM manipulation
        const fragment = document.createDocumentFragment();

        // Iterate over the batch of words
        for (let i = 0; i < batchSize; i++) {
            const wordIndex = startIndex + i;

            // Check if the end of the word list has been reached
            if (wordIndex >= words.length) {
                break;
            }

            const word = words[wordIndex];
            const span = createSpan(word);
            
            // Append the span to the document fragment
            fragment.appendChild(span);

            // Measure the offsetTop of the word span
            const offsetTop = span.offsetTop;

            // Check if the word span has moved to the next line
            if (offsetTop > currentTopOffset) {
                // Store the index of the last word in the current row
                rowEndIndices.push(wordIndex - 1);

                // Create a new row and add it to the container
                currentRow = document.createElement('div');
                currentRow.classList.add("row");
                container.appendChild(currentRow);
                rows.push(currentRow);

                // Append the current word span to the new row
                currentRow.appendChild(createSpan(word));

                // Update the current top offset
                currentTopOffset = offsetTop;
            }
        }

        // Append the document fragment to the container
        container.appendChild(fragment);
    };

    // Function to start processing the words
    const startProcessing = async () => {
        const batchSize = 10; // Adjust the batch size as needed

        // Process words in batches
        for (let i = 0; i < words.length; i += batchSize) {
            await processBatch(i, batchSize);
        }
    };

    // Start the word processing
    startProcessing();
}


function processRemainingRows(words, startIndex, currentRow, currentTopOffset) {
    // Implement asynchronous processing of remaining rows
    // For example, you can use setTimeout to simulate asynchronous behavior
    setTimeout(() => {
        for (let i = startIndex; i < words.length; i++) {
            // Process each word or perform other background tasks
            const span = document.createElement('span');
            span.textContent = words[i] + ' ';
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
                
            }
        }
    }, 0);
}

function handleInput(event) {
    const quranContainer = document.getElementById("Quran-container");
    const wordSpans = quranContainer.querySelectorAll('span');

    // TODO at some point have some sort of way of identifying the current word being looked at. 
    // Eg. Have it a certain colour or smth.

    const noTashkeelContainer = document.getElementById("noTashkeelContainer");
    let quranText = noTashkeelContainer.childNodes[noTashkeelWordIndex].textContent 

    const inputElement = document.getElementById("inputField");
    const inputText = event.data;
    const currentLetter = quranText[currentLetterIndex];

    if (inputText !== currentLetter) {
        const incorrectWord = wordSpans[mainQuranWordIndex]
        incorrectWord.style.color = "red"
    } else {

        // TODO: This whole if else part needs a serious rearrangement

        // next word check
        if (currentLetter !== " ") {
            // console.log(inputElement.value);
            currentLetterIndex++;    
        } else {

            if (inputElement.value !== quranText) {
                return
            }

            const correctWord = wordSpans[mainQuranWordIndex]
            correctWord.style.color = "green"

            // clear the input box
            inputElement.value = "";

            
            
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
                // ugly fix. change later. dupicated code above
                // check if reached end of row
                if (mainQuranWordIndex === rowEndIndices[rowIndex]) {            
                    let transitionDuration = utils.getTransitionDuration(rows[0]); // Fetch transition duration

                    rows[rowIndex].classList.add("hidden")
                    setTimeout(function() {
                        rows[rowIndex].classList.add("display-none")
                        rowIndex++
                    }, transitionDuration);
                }

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

let currentQuery = "1"
function processSearch(query) {
    // to prevent constant clicking of search button, with the same query
    if (currentQuery === query) {
        return
    } else {
        currentQuery = query
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