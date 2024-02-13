describe('Input Field Test', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.get('#inputField').should('exist');
      cy.wait(2000); // Wait for the API call to be received and the container to be populated
    });
  
    it('should wipe the input field after a correct word has been written and the spacebar pressed', () => {
      const expectedText = 'بسم ';
      cy.get('#inputField').type(expectedText);
      cy.get('#inputField').should('have.value', '');
      cy.get("span").eq(0).should('have.css', 'color', 'rgb(0, 128, 0)');
    });
  
    it('should have full green spans after completing the first surah', () => {
      const expectedText = 'بسم الله الرحمان الرحيم الحمد لله رب العالمين الرحمان الرحيم مالك يوم الدين إياك نعبد وإياك نستعين اهدنا الصراط المستقيم صراط الذين أنعمت عليهم غير المغضوب عليهم ولا الضالين ';
      cy.get('#inputField').type(expectedText);
      cy.get("#Quran-container span").each(($span) => {
        cy.wrap($span).should('have.css', 'color', 'rgb(0, 128, 0)');
      });
    });

    it("should work with a surah that doesn't fully fit in the container", () => {
        let chosenSurah = 96  // Al-Alaqremove and un-remove all words when the Hide Ayahs button is clicked
        cy.get('#Surah-selection-input').type(chosenSurah)
        cy.get('#Display-Surah-button').click()
        cy.wait(2000); 
        cy.get('#noTashkeelContainer').invoke('text').then(fullSurah => {
            cy.get('#inputField').type(fullSurah);
             // Select just the last span element for quicker computation
            cy.get("#Quran-container span").last().should('have.css', 'color', 'rgb(0, 128, 0)');
        });
    });
  });
  