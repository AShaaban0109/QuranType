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
    // contentType: "application/json; charset=utf-8",
    success: function (data) {
      // Extract the Surah content from the API response
    //   const surahContent = data.data.ayahs.map((ayah, ayahNum) => `${ayahNum + 1} ${ayah.text}`).join('<br>');
    let noTashkeelAyahs = []
    const surahContent = data.data.ayahs.map(function (ayah, ayahIdx) {
        const ayahNum = ayahIdx + 1 
        const arabicNumber = convertToArabicNumber(ayahNum)

        const processedAyah = ayah.text.replace("\n", "")  // remove this if want to log on new lines 
        noTashkeelAyahs.push(processedAyah)  

        return `${processedAyah} ﴿${arabicNumber}﴾ `;
      }).join("");
      
        noTashkeelAyahs = noTashkeelAyahs.map((ayah) => removeTashkeel(ayah))
        const noTashkeel = noTashkeelAyahs.join(" ")
    // console.log(noTashkeel);
    //   const noTashkeel = removeTashkeel(surahContent)
    //   console.log(surahContent);
    //   console.log(noTashkeel);

    //   const words = surahContent.split(" ")
    //   console.log(words);


    

      // Populate the div with the Surah content
    //   $("#Quran-container").html(surahContent);
      $("#Quran-container").html(noTashkeel);



      // create new hidden div with no tashkeel to match with the typing
        // Create a hidden div element and set its content
        const hiddenDiv = document.createElement('div');
        hiddenDiv.style.display = 'none';
        // hiddenDiv.innerHTML = surahContentNoTashkeel;

        // Append the hidden div to the body or any other parent element you prefer
        document.body.appendChild(hiddenDiv);
        
    },
    error: function (error) {
      console.log("Error:", error);
    }
  });


}

currentLetterIndex = 0

function handleInput(event) {
    const quranContainer = document.getElementById("Quran-container");
    quranText = quranContainer.textContent 

    const inputElement = document.getElementById("Quran-input-container");

    const inputText = event.data;
    const currentLetter = quranText[currentLetterIndex];

    // some chars that we dont want to check for in the input, we can skip 
    if (currentLetter === "﴿") {
        
    }

    if (inputText === currentLetter) {
        console.log(inputText);
        currentLetterIndex++;
        // console.log(quranText[205]);
        // console.log(quranText[206]);
        // console.log(quranText[207]);
        // console.log(quranText[208]);
        // console.log(quranText[209]);
        // console.log(quranText[210]);
        // console.log(quranText[211]);
        // console.log(quranText[212]);
        // console.log(quranText[213]);
        inputElement.value = '';
        inputElement.blur(); // Remove focus after a correct input
        inputElement.focus(); // Set focus back to input
    }
}

function handleInputButton(event) {
    const quranContainer = document.getElementById("Quran-container");
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

// Define a function to remove diacritical marks (tashkeel) from Arabic text
function removeTashkeel(text) {
    let noTashkeel = text

    // noTashkeel = text.replace(/[\u0610-\u061A]/g, ''); 
    // noTashkeel = text.replace(/[\u064B-\u065F]/g, ''); 
    // noTashkeel = text.replace(/[\u06D6-\u06ED]/g, ''); 

    noTashkeel = noTashkeel.replace(/ٱ/g, 'ا');       // remove alef wasl
    // noTashkeel = noTashkeel.replace(/\u0670/g, 'ا');  // remove the small subscript alef
    // noTashkeel = noTashkeel.replace(/ /g, '');        // remove the space before subscript alef (hair space)
    // noTashkeel = noTashkeel.replace(/\u2060/g, '');   // remove the word joiner for subscript alef
    // // noTashkeel = noTashkeel.replace(/ /g, '');     // replace the small gaps that are found after alef subscipt if it is alone    
    // noTashkeel = noTashkeel.replace(/\u0640/g, '');   // remove the tatweel that comes with subscript alef
    // noTashkeel = noTashkeel.replace(/\u06CC/g,'\u064A');  // fix an issue with the ya encoding (persian for some reason)
    
    // // fathateen, damateen, kasrateen
    // noTashkeel = noTashkeel.replace(/\u08F0/g,''); 
    // noTashkeel = noTashkeel.replace(/\u08F1/g,''); 
    // noTashkeel = noTashkeel.replace(/\u08F2/g,'');

    // noTashkeel = text.replace(/[^\u0621-\u063A ^\u0641-\u064A ^\u0654-\u0655]/g, '');
    
    noTashkeel = noTashkeel.replace(/\u0670/g, '\u0627');  // replace the small subscript alef with aleg
    noTashkeel = noTashkeel.replace(/\u0671/g, '\u0627');  // replace the alef wasl with alef
    noTashkeel = noTashkeel.replace(/\u06CC/g,'\u064A');  // fix an issue with the ya encoding (persian for some reason)
    
    // this removes everything that isnt a main char, or a 
    noTashkeel = noTashkeel.replace(/[^\u0621-\u063A\u0641-\u064A\u0654-\u0655 ]/g, '');
    
    // change the ya with hamza underneath to ya with hamza above as this is available on keyboard
    noTashkeel = noTashkeel.replace(/\u0649\u0655/g,'\u0626');
    return noTashkeel
}

// Add event listeners
document.getElementById("Quran-input-container").addEventListener("input", handleInput);


var inputElement = document.getElementById("inputField");
var processButton = document.getElementById("processButton");

// Add a click event listener to the button
processButton.addEventListener("click", function() {
    // Get the value of the input element
    var inputValue = inputElement.value;

    // You can now handle the inputValue as needed, for example, by displaying it or processing it
    // console.log("Input Value: " + inputValue);

    // You can also call a function to handle the input
    handleInputButton(inputValue);
});

// Call the function to get and populate the Surah when the page loads
getSurah(114);

