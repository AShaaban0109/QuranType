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

    const surahContent = data.data.ayahs.map(function (ayah, ayahIdx) {
        const ayahNum = ayahIdx + 1
        const arabicNumber = convertToArabicNumber(ayahNum)
        

        return `${ayah.text} ${arabicNumber}`;
      }).join('<br>');

      // Populate the div with the Surah content
      $("#Quran-container").html(surahContent);

      // create new hidden div with no tashkeel to match with the typing
        // Create a hidden div element and set its content
        const hiddenDiv = document.createElement('div');
        hiddenDiv.style.display = 'none';
        hiddenDiv.innerHTML = surahContentNoTashkeel;

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

    if (inputText === currentLetter) {
        console.log(inputText);
        currentLetterIndex++;
        inputElement.value = '';
        inputElement.blur(); // Remove focus after a correct input
        inputElement.focus(); // Set focus back to input
    }
}

// Define a function to remove diacritical marks (tashkeel) from Arabic text
function removeTashkeel(text) {
    return text.replace(/[\u064B-\u0652]/g, ''); // This is a simple example, and you may need to refine it.
}

// Add event listeners
document.getElementById("Quran-input-container").addEventListener("input", handleInput);


// Call the function to get and populate the Surah when the page loads
getSurah();

