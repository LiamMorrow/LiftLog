/// <reference types="cypress" />

describe('Settings', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('When a user restores data', () => {
    beforeEach(() => {
      cy.get('nav').contains('Settings').click()
      cy.get('[data-cy=restore-button]').click()
    })


    describe('and updates the imperial units setting', () => {
      it('should display weights in the correct units on all pages', () => {
        assertCorrectWeightUnitsOnAllPages('kg')
        cy.get('nav').contains('Settings').click()
        cy.contains('Use Imperial Units').click()
        assertCorrectWeightUnitsOnAllPages('lbs')
      })
    })
  })
})


function assertCorrectWeightUnitsOnAllPages(units) {
  cy.get('nav').contains('History').click()
  cy.get('.cardlist .card').first().should('contain.text', units)
  cy.get('nav').contains('Stats').click()
  cy.get('.cardlist .card').first().should('contain.text', units)
  cy.get('nav').contains('Workout').click()
  cy.get('.cardlist .card').first().should('contain.text', units).click()
  cy.get('[data-cy=weight-display]').first().should('contain.text', units).click()
  cy.get('md-outlined-text-field').get('.suffix', { includeShadowDom: true }).should('contain.text', units)
  cy.get('[slot=actions]').contains("Close").click()
  cy.get('nav').contains('Settings').click()
  cy.contains('Manage workouts').click()
  cy.get('.cardlist .card').first().should('contain.text', units)
}
