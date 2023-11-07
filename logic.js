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

  // Make an API request to fetch the Surah data
  $.ajax({
    url: `http://api.alquran.cloud/v1/surah/${surahNumber}`,
    type: "GET",
    dataType: "json",

    success: function (data) {
      // Extract the Surah content from the API response
      let noTashkeelAyahs = []
      const surahContent = data.data.ayahs.map(function (ayah, ayahIdx) {
          const ayahNum = ayahIdx + 1 
          const arabicNumber = convertToArabicNumber(ayahNum)

          const processedAyah = ayah.text.replace("\n", "")  // remove this if want to log on new lines 
          noTashkeelAyahs.push(processedAyah)  

          return `${processedAyah} ﴿${arabicNumber}﴾ `;
      }).join("");
      
      const noTashkeel = createNoTashkeelString(noTashkeelAyahs)
      addToHiddenElement(noTashkeel)

      $("#Quran-container").html(surahContent);        
    },

    error: function (error) {
      console.log("Error:", error);
    }
  });


}

function createNoTashkeelString(noTashkeelAyahs) {
    noTashkeelAyahs = noTashkeelAyahs.map((ayah) => removeTashkeel(ayah))
    return noTashkeelAyahs.join(" ")
}

// create new hidden div with no tashkeel to match with the typing
function addToHiddenElement(content) {
    const hiddenDiv = document.createElement('div');
    hiddenDiv.style.display = 'none';
    hiddenDiv.innerHTML = content;
    hiddenDiv.id = 'noTashkeelContainer'; // Replace 'your-id-here' with your desired ID
    document.body.appendChild(hiddenDiv);
}


function handleInput(event) {
    const quranContainer = document.getElementById("noTashkeelContainer");
    quranText = quranContainer.textContent 

    const inputText = event.data;
    const currentLetter = quranText[currentLetterIndex];

    if (inputText === currentLetter) {
        console.log(inputText);
        currentLetterIndex++;
    }
}

// helper function for now. for testing
function handleInputButton(event) {
    const quranContainer = document.getElementById("noTashkeelContainer");
    quranText = quranContainer.textContent 

    let newCurrentLetterIndex = 0
    let currentLetter = quranText[newCurrentLetterIndex];
    let toPrint = []
    for (let i = 0; i < event.length; i++) {
        if (event[i] === currentLetter) {
            toPrint.push(currentLetter);            
            newCurrentLetterIndex++
            currentLetter = quranText[newCurrentLetterIndex]
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

let currentLetterIndex = 0
var inputElement = document.getElementById("inputField");
var processButton = document.getElementById("processButton");

// Add event listeners
inputElement.addEventListener("input", handleInput);
processButton.addEventListener("click", function() {
    var inputValue = inputElement.value;
    handleInputButton(inputValue);
});

// Call the function to get and populate the Surah when the page loads
getSurah(114);