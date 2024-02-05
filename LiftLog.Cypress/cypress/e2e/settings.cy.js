/// <reference types="cypress" />

describe('Settings', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('When a user restores data', () => {
    beforeEach(() => {
      cy.navigate('Settings')
      // Disable tips
      cy.containsA('Show tips').click()
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
  cy.getA('.card').eq(4).should(classify, 'Bodyweight')
  cy.navigate('Workout')
  cy.navigate('Workout')
  cy.getA('.cardlist .card').first().click()
  if(shouldShow) {
    cy.getA('.card').last().should(classify, 'Bodyweight')
  }else{
    cy.getA('.card').should('not.exist')
  }
}

function assertCorrectWeightUnitsOnAllPages(units) {
  cy.navigate('History')
  cy.getA('.cardlist .card').first().should('contain.text', units)
  cy.navigate('Stats')
  cy.getA('.cardlist .card').first().should('contain.text', units)
  cy.navigate('Workout')
  cy.navigate('Workout')
  cy.getA('.cardlist .card').first().should('contain.text', units).click()
  cy.getA('[data-cy=weight-display]').first().should('contain.text', units).click()
  cy.dialog().find('md-outlined-text-field').get('.suffix', { includeShadowDom: true }).should('contain.text', units)
  cy.dialog().find('[slot=actions]').contains("Close").click()
}
