describe('Input Field Test', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.wait(1000); // Wait for the API call to be received and the container to be populated
    });
  
    it('should remove and un-remove all words when the Hide Ayahs button is clicked', () => {
      cy.get('#hideAyahsButton').click();
      cy.get("#Quran-container span").each(($span) => {
        cy.wrap($span).should('have.css', 'display', 'none');
      });

      cy.get('#hideAyahsButton').click();
      cy.get("#Quran-container span").each(($span) => {
        cy.wrap($span).should('not.have.css', 'display', 'none');
      });
    });

    // it("should work with a surah that doesn't fully fit in the container", () => {
    //     let chosenSurah = 96  // Al-Alaq
    //     cy.get('#Surah-selection-input').type(chosenSurah)
    //     cy.get('#Display-Surah-button').click()
    //     cy.wait(3000); 
    //     cy.get('#noTashkeelContainer').invoke('text').then(fullSurah => {
    //         cy.get('#inputField').type(fullSurah);
    //          // Select just the last span element for quicker computation
    //         cy.get("#Quran-container span").last().should('have.css', 'color', 'rgb(0, 128, 0)');
    //     });
    // });
  });
  