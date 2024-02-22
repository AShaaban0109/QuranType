describe('Input Field Test', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.wait(2000); // Wait for the API call to be received and the container to be populated
    });

    it('should work with longer surahs', () => {
        let chosenSurah = 12  // Yusuf
        cy.get('#Surah-selection-input').type(chosenSurah)
        cy.get('#Display-Surah-button').click()
        cy.wait(3000); 
        cy.get('#noTashkeelContainer').invoke('text').then(fullSurah => {
            cy.get('#inputField').type(fullSurah);
             // Select just the last span element for quicker computation
            cy.get("#Quran-container span").last().should('have.class', 'correctWord');
        });
    });
  });
  