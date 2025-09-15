/// <reference types="cypress" />
/// <reference types="../support/index.d.ts" />

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
      cy.contains('Restore complete!').should('be.visible')
    })


    describe('and updates the imperial units setting', () => {
      it('should display weights in the correct units on all pages', () => {
        assertCorrectWeightUnitsOnAllPages('kg')
        cy.navigate('Settings')
        cy.getByTestId('localization').click()
        cy.getByTestId('setUseImperialUnits').click()
        cy.navigate('Workout')
        cy.getByTestId('clear-current-workout').click()
        cy.dialog().findByTestId('action-ok').click()
        assertCorrectWeightUnitsOnAllPages('lbs')
      })
    })

    describe('and updates the app language', () => {
      it('should change the language of the UI', () => {
        cy.navigate('Settings')
        cy.getByTestId('localization').click()
        cy.getByTestId('setPreferredLanguage').click()
        // Select a language, e.g., German
        cy.contains('Deutsch').click({ force: true })
        // Verify a UI element is now in German
        cy.navigate('Settings')
        cy.contains('Einstellungen') // 'Settings' in German
      })
    })

    describe('and updates the bodyweight setting', () => {
      it('should hide and show it on all pages', () => {
        assertShowsBodyweightOnAllPages(true)
        cy.navigate('Settings')
        cy.contains('App configuration').click()
        cy.contains('Show bodyweight').click()
        cy.navigate('Workout')
        cy.getByTestId('clear-current-workout').click()
        cy.dialog().findByTestId('action-ok').click()
        assertShowsBodyweightOnAllPages(false)
      })
    })
  })

})

function assertShowsBodyweightOnAllPages(shouldShow) {
  const classify = shouldShow ? 'exist' : 'not.exist'
  cy.navigate('Stats')
  cy.getByTestId('stats-time-selector').click()
  cy.contains('All time').click({ force: true })


  cy.getByTestId('bodyweight-stat-card').should(classify)

  cy.navigate('Workout')
  cy.navigate('Workout')
  cy.contains('Start workout').first().click()

  cy.getByTestId('bodyweight-card').should(classify)

}

function assertCorrectWeightUnitsOnAllPages(units) {
  cy.navigate('History')
  // We know there's a workout in September 2023
  cy.recursionLoop(() => {
    if (Cypress.$('[data-testid=calendar-month]').text().includes('September 2023')) {
      return false
    }
    cy.getByTestId('calendar-nav-previous-month').first().click()
  }, 200)
  cy.getByTestId('history-list').findByTestId('session-summary').first().should('contain.text', units)
  cy.navigate('Stats')
  cy.getByTestId('stats-time-selector').click()
  cy.contains('All time').click({ force: true })
  cy.get('text').first().should('contain.text', units)
  cy.navigate('Workout')
  cy.navigate('Workout')
  cy.getByTestId('session-summary').first().should('contain.text', units).click()
  cy.contains('Start workout').click()
  cy.getByTestId('repcount-weight').eq(1).should('contain.text', units).click()
  cy.dialog().findByTestId('right-affix-adornment-text',).should('contain.text', units)
  cy.dialog().findByTestId('close').click()
}
