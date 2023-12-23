/// <reference types="cypress" />

describe('Completing a session', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('When a user adds a freeform session', () => {
    beforeEach(() => {
      cy.getA('md-fab').click()
    })

    it('can complete a freeform workout', () => {
      cy.containsA('Add Exercise', { includeShadowDom: true }).click()
      cy.getA('[data-cy="session-exercise-editor"] md-outlined-text-field').find('input', { includeShadowDom: true }).first().click().type('Squat')

      cy.getA('[data-cy="session-exercise-editor-actions"]').contains("Save").click()


      cy.getA('.repcount').first().click()
      cy.getA('.snackbar').contains('Rest between').should('be.visible')
      cy.getA('.repcount').first().click().should('contain.text', '9/10')

      cy.getA('[data-cy=weight-display]').first().click()

      cy.getA('[data-cy=increment-weight]').first().click().click().click()

      cy.getA('[slot="actions"]').contains("Save").click()

      cy.getA('md-fab').click()

      cy.navigate('History')

      cy.getA('.cardlist .card').first('.card').should('contain.text', 'Freeform Session').should('contain.text', '7.5kg')
    })
  })

  describe('When a user selects a pre-made program', () => {
    beforeEach(() => {
      cy.navigate('Settings')
      cy.containsA('Select a plan').click()
      cy.containsA("Starting Strength").click()
      cy.getA('[slot="actions"]').contains("Select").click()
    })


    describe('and selects a workout', () => {
      it('can complete a workout and update its date', () => {
        cy.containsA('Workout A').click()
        cy.containsA('Rest between').should('not.exist')
        cy.getA('.repcount').first().click()
        cy.getA('.snackbar').contains('Rest between').should('be.visible')
        cy.getA('.repcount').first().click().should('contain.text', '4/5')

        for (let i = 1; i <= 6; i++) {
          cy.getA('.repcount').eq(i).click()
        }

        cy.getA('.snackbar').should('be.visible').should('contain.text', 'This session you lifted').should('contain.text', '680')

        cy.getA('md-fab').click()

        cy.getA('.cardlist .card').first().should('contain.text', 'Workout B')

        cy.navigate('History')

        cy.getA('.cardlist .card').first('.card').should('contain.text', 'Workout A').click()

        cy.getA('md-filled-text-field[type=date]').get('input', { includeShadowDom: true }).first().click().type('2020-12-13')

        cy.getA('md-fab').click()

        cy.getA('.cardlist .card').first().should('contain.text', 'Workout A').should('contain.text', 'December 13 2020')
      })

      it('can complete a workout while switching to per set weights with it progressing properly', () => {
        cy.containsA('Workout A').click()
        cy.containsA('Rest between').should('not.exist')
        cy.getA('.repcount').first().click().should('contain.text', '5/5')
        cy.getA('.snackbar').contains('Rest between').should('be.visible')

        cy.getA('.cardlist .card').eq(0).should('contain.text', 'Squat')
        cy.getA('[data-cy=weight-display]').first().should('contain.text', '20kg')
        cy.getA('[data-cy=per-rep-weight-btn]').first().click()

        // Update the weight of the second set to be lower than the top level weight
        cy.getA('[data-cy=set-weight-button]').eq(1).click()
        cy.getA('[data-cy=decrement-weight]:visible').click()
        cy.getA('[slot="actions"]:visible').contains("Save").click()
        cy.getA('[data-cy=set-weight-button]').eq(1).should('contain.text', '17.5kg')
        cy.getA('[data-cy=set-weight-button]').eq(2).should('contain.text', '20kg')

        // Update top level weight - which should update all sets which aren't completed and have the same weight (i.e. the last set)
        cy.getA('[data-cy=weight-display]').first().click()
        cy.getA('[data-cy=decrement-weight]').first().click().click().click()
        cy.getA('[slot="actions"]:visible').contains("Save").click()
        cy.getA('[data-cy=set-weight-button]').eq(0).should('contain.text', '20kg')
        cy.getA('[data-cy=set-weight-button]').eq(1).should('contain.text', '17.5kg')
        cy.getA('[data-cy=set-weight-button]').eq(2).should('contain.text', '12.5kg')

        // We reduced top level weight to 12.5
        cy.getA('[data-cy=weight-display]').first().should('contain.text', '12.5kg')

        // Complete all sets
        for (let i = 1; i <= 6; i++) {
          cy.getA('.repcount').eq(i).click()
        }

        cy.getA('.snackbar').should('be.visible').should('contain.text', 'This session you lifted').should('contain.text', '650')
        cy.getA('md-fab').click()

        cy.getA('.cardlist .card').eq(0).should('contain.text', 'Workout B')
        cy.getA('.cardlist .card').eq(1).should('contain.text', 'Workout A').click()

        cy.getA('.cardlist .card').eq(0).should('contain.text', 'Squat')
        // Since all sets were completed - with at least one of the sets having equal or higher weight than the top level, the weight should have increased
        cy.getA('[data-cy=weight-display]').first().should('contain.text', '15kg')
      })

      it('can add notes to an exercise and see them the next time they do that exercise', () => {
        cy.containsA('Workout A').click()

        cy.getA('[data-cy=exercise-notes-btn]').first().click()
        cy.getA('md-outlined-text-field').find('textarea', { includeShadowDom: true }).first().click().type('I am NoteTaker, master of notes')
        cy.getA('[data-cy=notes-dialog-actions]').contains("Save").click()

        cy.getA('md-fab').click()

        cy.navigate('History')

        cy.getA('.cardlist .card').first('.card').should('contain.text', 'Workout A').click()

        cy.getA('[data-cy=exercise-notes-btn]').first().click()
        cy.getA('md-outlined-text-field').find('textarea', { includeShadowDom: true })
          .first()
          .should('have.value', 'I am NoteTaker, master of notes')
          .type('Replace notes but do not save')
        cy.getA('[data-cy=notes-dialog-actions]').contains("Cancel").click()

        cy.navigate('Workout')
        cy.containsA('Workout A').click()

        // TODO: this is failing because it does not actually trigger a pointerdown properly in blazor
        // cy.getA('[data-cy=prev-exercise-btn]').first().find('button', { includeShadowDom: true }).trigger('pointerdown')
        // cy.getA('[data-cy=exercise-notes]').should('contain.text', 'I am NoteTaker, master of notes')
      })
    })
  })
})
