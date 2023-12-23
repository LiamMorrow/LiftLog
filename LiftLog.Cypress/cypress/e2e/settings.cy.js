/// <reference types="cypress" />

describe('Settings', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('When a user restores data', () => {
    beforeEach(() => {
      cy.navigate('Settings')
      cy.getA('[data-cy=restore-button]').click()
    })


    describe('and updates the imperial units setting', () => {
      it('should display weights in the correct units on all pages', () => {
        assertCorrectWeightUnitsOnAllPages('kg')
        cy.navigate('Settings')
        cy.containsA('Use imperial units').click()
        assertCorrectWeightUnitsOnAllPages('lbs')
      })
    })

    describe('and updates the bodyweight setting', () => {
      it('should hide and show it on all pages', () => {
        assertShowsBodyweightOnAllPages(true)
        cy.navigate('Settings')
        cy.containsA('Show bodyweight').click()
        assertShowsBodyweightOnAllPages(false)
      })
    })
  })
})

function assertShowsBodyweightOnAllPages(shouldShow) {
  const classify = shouldShow ? 'contain.text' : 'not.contain.text'
  cy.navigate('Stats')
  cy.getA('.cardlist .card').first().should(classify, 'Bodyweight')
  cy.navigate('Workout')
  cy.getA('.cardlist .card').first().click()
  cy.getA('.card').last().should(classify, 'Bodyweight')
}

function assertCorrectWeightUnitsOnAllPages(units) {
  cy.navigate('History')
  cy.getA('.cardlist .card').first().should('contain.text', units)
  cy.navigate('Stats')
  cy.getA('.cardlist .card').first().should('contain.text', units)
  cy.navigate('Workout')
  cy.getA('.cardlist .card').first().should('contain.text', units).click()
  cy.getA('[data-cy=weight-display]').first().should('contain.text', units).click()
  cy.getA('md-outlined-text-field').get('.suffix', { includeShadowDom: true }).should('contain.text', units)
  cy.getA('[slot=actions]').contains("Close").click()
  cy.navigate('Settings')
  cy.containsA('Manage workouts').click()
  cy.getA('.cardlist .card').first().should('contain.text', units)
}
