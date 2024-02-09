export function convertToArabicNumber(englishNumber) {
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

export function createNoTashkeelString(noTashkeelAyahs) {
    noTashkeelAyahs = noTashkeelAyahs.map((ayah) => removeTashkeel(ayah))
    return noTashkeelAyahs.join(" ")
}

export function removeTashkeel(text) {
    let noTashkeel = text

    noTashkeel = noTashkeel.replace(/\u0670/g, '\u0627');  // replace the small subscript alef with normal alef
    noTashkeel = noTashkeel.replace(/\u0671/g, '\u0627');  // replace the alef wasl with alef

    // fix an issue with the ya encoding
    // (persian for some reason). Note this replaces all normal ya, but also the ya for alef layena.
    //  so for something like فى it is written في. Not sure if this is fine, check with someone arabic literate
    noTashkeel = noTashkeel.replace(/\u06CC/g,'\u064A');  

    // this removes everything that isnt a main char, or a hamza above or below, or a spacebar
    noTashkeel = noTashkeel.replace(/[^\u0621-\u063A\u0641-\u064A\u0654-\u0655 ]/g, '');
    
    // // change the ya with hamza underneath and to ya with hamza above as this is available on keyboard
    noTashkeel = noTashkeel.replace(/\u0649\u0655/g,'\u0626');
    return noTashkeel
}

export function applyIncorrectWordStyle(incorrectWord) {
    incorrectWord.style.color = "red";
}

export function applyCorrectWordStyle(correctWord) {
    correctWord.style.color = "green";

    // Unhide word if hidden due to hideWords button. (The working is none, delete hidden later)
    if (correctWord.style.visibility === 'hidden') {
        correctWord.style.visibility = "visible";
    }
}

// quick insert and removal to get the true span offsetTop value
export function getOriginalTopOffset(container) {
    const testRow = document.createElement('div');
    const temp = document.createElement('span');
    container.appendChild(testRow);
    testRow.appendChild(temp)

    let currentTopOffset = temp.offsetTop
    testRow.removeChild(temp)
    container.removeChild(testRow)
    return currentTopOffset
}

export function handleHiddenWords(wordSpans, referenceSpan) {
    let foundReference = false;

    wordSpans.forEach(function (span) {
        if (!foundReference) {
            if (span === referenceSpan) {
                foundReference = true;
            } else {
                span.style.display = 'none';
                // span.remove()
            }
        }
    });
}

export function clearContainer(container) {
    while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
}

export function getTransitionDuration(element) {
    // Get the computed style of the element
    let style = window.getComputedStyle(element);
    
    // Extract the 'transition-duration' property value
    let transitionDuration = style.getPropertyValue('transition-duration');
  
    // Convert the string value to a number in milliseconds
   return parseFloat(transitionDuration) * 1000;  
}

// Using this now for the tashkeel container.
export function fillContainer(surahContent, container) {
    clearContainer(container)

    // turn each word into a span
    let words = surahContent.split(" ")
    // console.log(words.join(" "));
    

    words.forEach((word) => {
        let wordSpan = document.createElement("span");
        wordSpan.textContent = word + " "
        container.appendChild(wordSpan)

        //temp
        // console.log(word.split(""));
    });
}

export function initDarkMode(isDarkMode) {
    // Apply dark mode if enabled
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.getElementById('light-mode-icon').style.display = 'none';
        document.getElementById('dark-mode-icon').style.display = 'inline';
    }
}

// Function to toggle dark mode
export function toggleDarkMode(isDarkMode) {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode');

    // Update the icon display
    document.getElementById('light-mode-icon').style.display = isDarkMode ? 'none' : 'inline';
    document.getElementById('dark-mode-icon').style.display = isDarkMode ? 'inline' : 'none';

    // Save the dark mode preference
    localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
    return isDarkMode
}

// Exporting all functions under a single object
export default {
    convertToArabicNumber,
    createNoTashkeelString,
    removeTashkeel,
    applyIncorrectWordStyle,
    applyCorrectWordStyle,
    getOriginalTopOffset,
    handleHiddenWords,
    clearContainer,
    getTransitionDuration,
    fillContainer,
    toggleDarkMode,
    initDarkMode,
};