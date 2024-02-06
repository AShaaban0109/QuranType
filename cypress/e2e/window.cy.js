describe("home page", () => {
    it("the h1 contains the correct text", () => {
      cy.visit("/")
      cy.get("h1").contains("Quran Type")
    })
  })