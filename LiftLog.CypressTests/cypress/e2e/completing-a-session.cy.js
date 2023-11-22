/// <reference types="cypress" />

describe('Completing a session', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('When a user adds a freeform session', () => {
    beforeEach(() => {
      cy.get('md-fab').click()
    })

    it('can complete a freeform workout', () => {
      cy.contains('Add Exercise', { includeShadowDom: true }).click()
      cy.get('md-outlined-text-field').get('input', { includeShadowDom: true }).first().click().type('Squat')

      cy.get('[slot="actions"]').contains("Save").click()


      cy.get('.repcount').first().click()
      cy.get('.snackbar').contains('Rest between').should('be.visible')
      cy.get('.repcount').first().click().should('contain.text', '9/10')

      cy.get('[data-cy=weight-display]').click()

      cy.get('[data-cy=increment-weight]').click().click().click()

      cy.get('[slot="actions"]').contains("Save").click()

      cy.get('md-fab').click()

      cy.get('nav').contains('History').click()

      cy.get('.cardlist .card').first('.card').should('contain.text', 'Freeform Session').should('contain.text', '7.5kg')
    })
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

        cy.get('nav').contains('History').click()

        cy.get('.cardlist .card').first('.card').should('contain.text', 'Workout A').click()

        cy.get('md-filled-text-field[type=date]').get('input', { includeShadowDom: true }).first().click().type('2020-12-13')

        cy.get('md-fab').click()

        cy.get('.cardlist .card').first().should('contain.text', 'Workout A').should('contain.text', 'December 13 2020')
      })

      it.only('can add notes to an exercise and see them the next time they do that exercise', () => {
        cy.contains('Workout A').click()

        cy.get('[data-cy=exercise-notes-btn]').first().click()
        cy.get('md-outlined-text-field').get('textarea', { includeShadowDom: true }).first().click().type('I am NoteTaker, master of notes')
        cy.get('[data-cy=notes-dialog-actions]').contains("Save").click()

        cy.get('md-fab').click()

        cy.get('nav').contains('History').click()

        cy.get('.cardlist .card').first('.card').should('contain.text', 'Workout A').click()

        cy.get('[data-cy=exercise-notes-btn]').first().click()
        cy.get('md-outlined-text-field').get('textarea', { includeShadowDom: true })
          .first()
          .should('have.value', 'I am NoteTaker, master of notes')
          .type('Replace notes but do not save')
        cy.get('[data-cy=notes-dialog-actions]').contains("Cancel").click()

        cy.get('nav').contains('Workout').click()
        cy.contains('Workout A').click()

        cy.get('[data-cy=prev-exercise-btn]').first().then(btn => btn.trigger('pointerdown', {}))
        cy.get('[data-cy=exercise-notes]').should('contain.text', 'I am NoteTaker, master of notes')
      })
    })
  })
})
