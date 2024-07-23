/// <reference types="cypress" />

describe('Settings', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('When a user restores data', () => {
    beforeEach(() => {
      cy.navigate('Settings')
      // Disable tips
      cy.containsA('App Configuration').click()
      cy.containsA('Show tips').click()

      cy.navigate('Settings')
      cy.containsA('Backup and restore').click()
      cy.containsA('Import data').click()
      cy.get('input[type=file]').selectFile('export.liftlogbackup.gz', { force: true })
    })


    describe('and updates the imperial units setting', () => {
      it('should display weights in the correct units on all pages', () => {
        assertCorrectWeightUnitsOnAllPages('kg')
        cy.navigate('Settings')
        // Navigate twice, because settings remembers its last page when you click it
        cy.navigate('Settings')
        cy.containsA('App Configuration').click()
        cy.containsA('Use imperial units').click()
        assertCorrectWeightUnitsOnAllPages('lbs')
      })
    })

    describe('and updates the bodyweight setting', () => {
      it('should hide and show it on all pages', () => {
        assertShowsBodyweightOnAllPages(true)
        cy.navigate('Settings')
        // Navigate twice, because settings remembers its last page when you click it
        cy.navigate('Settings')
        cy.containsA('App Configuration').click()
        cy.containsA('Show bodyweight').click()
        assertShowsBodyweightOnAllPages(false)
      })
    })
  })
})

function assertShowsBodyweightOnAllPages(shouldShow) {
  const classify = shouldShow ? 'contain.text' : 'not.contain.text'
  cy.navigate('Stats')
  cy.getA('[data-cy=stats-time-selector]').click()
  cy.containsA('All time').click()
  cy.getA('.card').eq(4).should(classify, 'Bodyweight')
  cy.navigate('Workout')
  cy.navigate('Workout')
  cy.getA('.itemlist .item').first().click()
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
  cy.getA('.itemlist .item').first().should('contain.text', units)
  cy.navigate('Stats')
  cy.getA('[data-cy=stats-time-selector]').click()
  cy.containsA('All time').click()
  cy.getA('.cardlist .card').first().should('contain.text', units)
  cy.navigate('Workout')
  cy.navigate('Workout')
  cy.getA('.itemlist .item').first().should('contain.text', units).click()
  cy.getA('[data-cy=weight-display]').first().should('contain.text', units).click()
  cy.dialog().find('md-outlined-text-field').get('.suffix', { includeShadowDom: true }).should('contain.text', units)
  cy.dialog().find('[slot=actions]').contains("Close").click()
}
