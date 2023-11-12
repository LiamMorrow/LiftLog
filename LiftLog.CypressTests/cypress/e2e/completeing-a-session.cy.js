/// <reference types="cypress" />

describe('Completing a session', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:5000')
  })

  describe('When a user selects a pre-made program', () => {
    beforeEach(() => {
      cy.get('nav').contains('Settings').click()
      cy.contains('Select a plan').click()
      cy.contains("Starting Strength").click()
      cy.get('[slot="actions"]').contains("Select").click()
    })


    describe('and selects a workout', () => {
      it('can complete a workout and update its date', () => {
        cy.contains('Workout A').click()
        cy.contains('Rest between').should('not.exist')
        cy.get('.repcount').first().click()
        cy.get('.snackbar').contains('Rest between').should('be.visible')
        cy.get('.repcount').first().click().should('contain.text', '4/5')

        for (let i = 1; i <= 6; i++) {
          cy.get('.repcount').eq(i).click()
        }

        cy.get('.snackbar').should('be.visible').should('contain.text', 'This session you lifted').should('contain.text', '680')

        cy.get('md-fab').click()

        cy.get('.cardlist .card').first().should('contain.text', 'Workout B')

        // Ensure persisted
        // cy.reload()

        cy.get('nav').contains('History').click()

        cy.get('.cardlist .card').first('.card').should('contain.text', 'Workout A').click()

        cy.get('md-filled-text-field[type=date]').get('input', { includeShadowDom: true }).first().click().type('2020-12-13')

        cy.get('md-fab').click()

        cy.get('.cardlist .card').first().should('contain.text', 'Workout A').should('contain.text', '13 December 2020')
      })
    })
  })
})
