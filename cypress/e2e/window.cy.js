describe("home page", () => {
    it("the h1 contains the correct text", () => {
      cy.visit("http://localhost:5501")
      cy.get("h1").contains("Quran Type")
    })
  })