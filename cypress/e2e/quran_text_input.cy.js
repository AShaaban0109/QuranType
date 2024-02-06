describe('Input Field Test', () => {
    it('should wipe the input field after a correct word has been written and the spacebar pressed', () => {
      cy.visit('http://localhost:5501');
  
      cy.get('#inputField')
        .should('exist')

      // Wait for the API call to be received and the container to be populated
      cy.wait(3000);

      // Type some text into the input field
      const expectedText = 'بسم ';
      cy.get('#inputField').type(expectedText);
  
      // Get the text from the input field and assert it
      cy.get('#inputField')
        .should('have.value', '');

      cy.get("span").eq(0)
        .should('have.css', 'color', 'rgb(0, 128, 0)')
    });
  });