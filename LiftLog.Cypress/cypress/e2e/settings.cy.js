/// <reference types="cypress" />

describe('Settings', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('When a user restores data', () => {
    beforeEach(() => {
      cy.navigate('Settings')
      // Disable tips
      cy.contains('App configuration').click()
      cy.contains('Show tips').click()

      cy.navigate('Settings')
      cy.contains('restore').click()
      cy.contains('Restore data').click()
      cy.get('input[type=file]').selectFile('export.liftlogbackup.gz', { force: true })
    })


    describe('and updates the imperial units setting', () => {
      it('should display weights in the correct units on all pages', () => {
        assertCorrectWeightUnitsOnAllPages('kg')
        cy.navigate('Settings')
        cy.contains('App configuration').click()
        cy.contains('Use imperial units').click()
        assertCorrectWeightUnitsOnAllPages('lbs')
      })
    })

    describe('and updates the bodyweight setting', () => {
      it('should hide and show it on all pages', () => {
        assertShowsBodyweightOnAllPages(true)
        cy.navigate('Settings')
        cy.contains('App configuration').click()
        cy.contains('Show bodyweight').click()
        assertShowsBodyweightOnAllPages(false)
      })
    })
  })

  describe('When a user selects a plan', () => {
    beforeEach(() => {
      cy.navigate('Settings')
      // Disable tips
      cy.contains('App configuration').click()
      cy.contains('Show tips').click()
      cy.navigate('Settings')
      cy.contains('Manage plans').click()
      cy.contains("Starting Strength").parent('md-list-item').find('[data-cy=use-plan-btn]').click()
      cy.navigate('Workout')
    })

    describe('and updates the individual weight setting', () => {
      it('should display the correct weight on the workout page', () => {
        cy.navigate('Settings')
        cy.contains('App configuration').click()
        cy.get('[data-cy=split-weight-toggle]').click()
        cy.navigate('Workout')
        cy.get('[data-cy=session-summary]').first().click()
        cy.get('[data-cy="set-weight-button"]').should('be.visible')

        cy.navigate('Settings')
        cy.contains('App configuration').click()
        cy.get('[data-cy=split-weight-toggle]').click()
        cy.navigate('Workout')
        cy.navigate('Workout')
        cy.get('[data-cy=session-summary]').first().click()
        cy.get('[data-cy="set-weight-button"]').should('not.be.visible')
      })
    })
  })
})

function assertShowsBodyweightOnAllPages(shouldShow) {
  const classify = shouldShow ? 'contain.text' : 'not.contain.text'
  cy.navigate('Stats')
  cy.get('[data-cy=stats-time-selector]').click()
  cy.contains('All time').click({ force: true })
  cy.get('.card').eq(4).should(classify, 'Bodyweight')
  cy.navigate('Workout')
  cy.navigate('Workout')
  cy.get('[data-cy=session-summary]').first().click()
  if (shouldShow) {
    cy.get('.card').last().should(classify, 'Bodyweight')
  } else {
    cy.get('.card').should('not.exist')
  }
}

function assertCorrectWeightUnitsOnAllPages(units) {
  cy.navigate('History')
  // We know there's a workout in September 2023
  cy.recursionLoop(() => {
    if (Cypress.$('[data-cy=calendar-month]').text().includes('September 2023')) {
      return false
    }
    cy.get('[data-cy=calendar-nav-previous-month]').first().click()
  }, 200)
  cy.get('[data-cy=session-summary]').first().should('contain.text', units)
  cy.navigate('Stats')
  cy.get('[data-cy=stats-time-selector]').click()
  cy.contains('All time').click({ force: true })
  cy.get('.cardlist .card').first().should('contain.text', units)
  cy.navigate('Workout')
  cy.navigate('Workout')
  cy.get('[data-cy=session-summary]').first().should('contain.text', units).click()
  cy.get('[data-cy=weight-display]').eq(1).should('contain.text', units).click()
  cy.dialog().find('md-outlined-text-field').get('.suffix',).should('contain.text', units)
  cy.dialog().find('[dialog-action=close]').click()
}
