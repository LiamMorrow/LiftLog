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
      cy.get('[data-cy="session-exercise-editor"] md-outlined-text-field').find('input', { includeShadowDom: true }).first().click().type('Squat')

      cy.get('[data-cy="session-exercise-editor-actions"]').contains("Save").click()


      cy.get('.repcount').first().click()
      cy.get('.snackbar').contains('Rest between').should('be.visible')
      cy.get('.repcount').first().click().should('contain.text', '9/10')

      cy.get('[data-cy=weight-display]').first().click()

      cy.get('[data-cy=increment-weight]').first().click().click().click()

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

      it('can complete a workout while switching to per set weights with it progressing properly', () => {
        cy.contains('Workout A').click()
        cy.contains('Rest between').should('not.exist')
        cy.get('.repcount').first().click().should('contain.text', '5/5')
        cy.get('.snackbar').contains('Rest between').should('be.visible')

        cy.get('.cardlist .card').eq(0).should('contain.text', 'Squat')
        cy.get('[data-cy=weight-display]').first().should('contain.text', '20kg')
        cy.get('[data-cy=per-rep-weight-btn]').first().click()

        // Update the weight of the second set to be lower than the top level weight
        cy.get('[data-cy=set-weight-button]').eq(1).click()
        cy.get('[data-cy=decrement-weight]:visible').click()
        cy.get('[slot="actions"]:visible').contains("Save").click()
        cy.get('[data-cy=set-weight-button]').eq(1).should('contain.text', '17.5kg')
        cy.get('[data-cy=set-weight-button]').eq(2).should('contain.text', '20kg')

        // Update top level weight - which should update all sets which aren't completed and have the same weight (i.e. the last set)
        cy.get('[data-cy=weight-display]').first().click()
        cy.get('[data-cy=decrement-weight]').first().click().click().click()
        cy.get('[slot="actions"]:visible').contains("Save").click()
        cy.get('[data-cy=set-weight-button]').eq(0).should('contain.text', '20kg')
        cy.get('[data-cy=set-weight-button]').eq(1).should('contain.text', '17.5kg')
        cy.get('[data-cy=set-weight-button]').eq(2).should('contain.text', '12.5kg')

        // We reduced top level weight to 12.5
        cy.get('[data-cy=weight-display]').first().should('contain.text', '12.5kg')

        // Complete all sets
        for (let i = 1; i <= 6; i++) {
          cy.get('.repcount').eq(i).click()
        }

        cy.get('.snackbar').should('be.visible').should('contain.text', 'This session you lifted').should('contain.text', '650')
        cy.get('md-fab').click()

        cy.get('.cardlist .card').eq(0).should('contain.text', 'Workout B')
        cy.get('.cardlist .card').eq(1).should('contain.text', 'Workout A').click()

        cy.get('.cardlist .card').eq(0).should('contain.text', 'Squat')
        // Since all sets were completed - with at least one of the sets having equal or higher weight than the top level, the weight should have increased
        cy.get('[data-cy=weight-display]').first().should('contain.text', '15kg')
      })

      it('can add notes to an exercise and see them the next time they do that exercise', () => {
        cy.contains('Workout A').click()

        cy.get('[data-cy=exercise-notes-btn]').first().click()
        cy.get('md-outlined-text-field').find('textarea', { includeShadowDom: true }).first().click().type('I am NoteTaker, master of notes')
        cy.get('[data-cy=notes-dialog-actions]').contains("Save").click()

        cy.get('md-fab').click()

        cy.get('nav').contains('History').click()

        cy.get('.cardlist .card').first('.card').should('contain.text', 'Workout A').click()

        cy.get('[data-cy=exercise-notes-btn]').first().click()
        cy.get('md-outlined-text-field').find('textarea', { includeShadowDom: true })
          .first()
          .should('have.value', 'I am NoteTaker, master of notes')
          .type('Replace notes but do not save')
        cy.get('[data-cy=notes-dialog-actions]').contains("Cancel").click()

        cy.get('nav').contains('Workout').click()
        cy.contains('Workout A').click()

        // TODO: this is failing because it does not actually trigger a pointerdown properly in blazor
        // cy.get('[data-cy=prev-exercise-btn]').first().find('button', { includeShadowDom: true }).trigger('pointerdown')
        // cy.get('[data-cy=exercise-notes]').should('contain.text', 'I am NoteTaker, master of notes')
      })
    })
  })
})
