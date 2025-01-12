/// <reference types="cypress" />

describe('Settings', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('When a user restores data', () => {
    beforeEach(() => {
      cy.navigate('Settings')
      // Disable tips
      cy.containsA('App configuration').click()
      cy.containsA('Show tips').click()

      cy.navigate('Settings')
      cy.containsA('restore').click()
      cy.containsA('Restore data').click()
      cy.get('input[type=file]').selectFile('export.liftlogbackup.gz', { force: true })
    })


    describe('and updates the imperial units setting', () => {
      it('should display weights in the correct units on all pages', () => {
        assertCorrectWeightUnitsOnAllPages('kg')
        cy.navigate('Settings')
        cy.containsA('App configuration').click()
        cy.containsA('Use imperial units').click()
        assertCorrectWeightUnitsOnAllPages('lbs')
      })
    })

    describe('and updates the bodyweight setting', () => {
      it('should hide and show it on all pages', () => {
        assertShowsBodyweightOnAllPages(true)
        cy.navigate('Settings')
        cy.containsA('App configuration').click()
        cy.containsA('Show bodyweight').click()
        assertShowsBodyweightOnAllPages(false)
      })
    })
  })

  describe('When a user selects a plan', () => {
    beforeEach(() => {
      cy.navigate('Settings')
      // Disable tips
      cy.containsA('App configuration').click()
      cy.containsA('Show tips').click()
      cy.navigate('Settings')
      cy.containsA('Manage plans').click()
      cy.containsA("Starting Strength").parent('md-list-item').find('[data-cy=use-plan-btn]').click()
      cy.navigate('Workout')
    })

    describe('and updates the individual weight setting', () => {
      it('should display the correct weight on the workout page', () => {
        cy.navigate('Settings')
        cy.containsA('App configuration').click()
        cy.getA('[data-cy=split-weight-toggle]').click()
        cy.navigate('Workout')
        cy.getA('[data-cy=session-summary]').first().click()
        cy.getA('[data-cy="set-weight-button"]').should('be.visible')

        cy.navigate('Settings')
        cy.containsA('App configuration').click()
        cy.getA('[data-cy=split-weight-toggle]').click()
        cy.navigate('Workout')
        cy.navigate('Workout')
        cy.getA('[data-cy=session-summary]').first().click()
        cy.getA('[data-cy="set-weight-button"]').should('not.be.visible')
      })
    })
  })
})

function assertShowsBodyweightOnAllPages(shouldShow) {
  const classify = shouldShow ? 'contain.text' : 'not.contain.text'
  cy.navigate('Stats')
  cy.getA('[data-cy=stats-time-selector]').click()
  cy.containsA('All time').click({ force: true })
  cy.getA('.card').eq(4).should(classify, 'Bodyweight')
  cy.navigate('Workout')
  cy.navigate('Workout')
  cy.getA('[data-cy=session-summary]').first().click()
  if (shouldShow) {
    cy.getA('.card').last().should(classify, 'Bodyweight')
  } else {
    cy.getA('.card').should('not.exist')
  }
}

function assertCorrectWeightUnitsOnAllPages(units) {
  cy.navigate('History')
  // We know there's a workout in September 2023
  cy.recursionLoop(() => {
    if (Cypress.$('[data-cy=calendar-month]').text().includes('September 2023')) {
      return false
    }
    cy.getA('[data-cy=calendar-nav-previous-month]').first().click()
  }, 200)
  cy.getA('[data-cy=session-summary]').first().should('contain.text', units)
  cy.navigate('Stats')
  cy.getA('[data-cy=stats-time-selector]').click()
  cy.containsA('All time').click({ force: true })
  cy.getA('.cardlist .card').first().should('contain.text', units)
  cy.navigate('Workout')
  cy.navigate('Workout')
  cy.getA('[data-cy=session-summary]').first().should('contain.text', units).click()
  cy.getA('[data-cy=weight-display]').eq(1).should('contain.text', units).click()
  cy.dialog().find('md-outlined-text-field').get('.suffix', { includeShadowDom: true }).should('contain.text', units)
  cy.dialog().find('[dialog-action=close]').click()
}
