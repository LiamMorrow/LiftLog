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
        cy.contains('Use imperial units').click()
        assertCorrectWeightUnitsOnAllPages('lbs')
      })
    })

    describe('and updates the bodyweight setting', () => {
      it('should hide and show it on all pages', () => {
        assertShowsBodyweightOnAllPages(true)
        cy.get('nav').contains('Settings').click()
        cy.contains('Show bodyweight').click()
        assertShowsBodyweightOnAllPages(false)
      })
    })
  })
})

function assertShowsBodyweightOnAllPages(shouldShow) {
  const classify = shouldShow ? 'contain.text' : 'not.contain.text'
  cy.get('nav').contains('Stats').click()
  cy.get('.cardlist .card').first().should(classify, 'Bodyweight')
  cy.get('nav').contains('Workout').click()
  cy.get('.cardlist .card').first().click()
  cy.get('.card').last().should(classify, 'Bodyweight')
}

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
