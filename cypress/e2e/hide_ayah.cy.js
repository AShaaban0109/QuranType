describe('Input Field Test', () => {
    beforeEach(() => {
      cy.visit('/');
      cy.wait(1000); // Wait for the API call to be received and the container to be populated
    });
  
    it('should remove and un-remove all words when the Hide Ayahs button is clicked', () => {
      cy.get('#hideAyahsButton').click();
      cy.get("#Quran-container span").each(($span) => {
        // Get the computed style of the span
        cy.wrap($span).invoke('css', 'color').then((color) => {
            if (color === 'rgb(0, 128, 0)') {
                cy.wrap($span).should('have.css', 'visibility', 'visible');
            } else {
                cy.wrap($span).should('have.css', 'visibility', 'hidden');
            }
        });
      });
      
      cy.get('#hideAyahsButton').click();
      cy.get("#Quran-container span").each(($span) => {
        cy.wrap($span).should('have.css', 'display', 'inline');
      });
    });

    it('should still work when text has been entered and some words are green', () => {
        const expectedText = 'بسم الله الرحمان الرحيم الحمد لله رب العالمين الرحمان الرحيم مالك يوم الدين إياك نعبد وإياك نستعين اهدنا الصراط المستقيم صراط الذين أنعمت عليهم غير المغضوب عليهم ولا الضالين ';
        cy.get('#inputField').type(expectedText);
        cy.get('#hideAyahsButton').click();

        cy.get("#Quran-container span").each(($span) => {
            cy.wrap($span).invoke('css', 'display').then((display) => {
                // if display is none, the span is not on the screen and we don't need to check visibility
                if (display !== 'none') {
                    cy.wrap($span).invoke('css', 'color').then((color) => {
                        if (color === 'rgb(0, 128, 0)') {
                            cy.wrap($span).should('have.css', 'visibility', 'visible');
                        }
                    });
                    cy.wrap($span).should('have.css', 'visibility', 'visible');
                }
            });
          });
      });
  });
  