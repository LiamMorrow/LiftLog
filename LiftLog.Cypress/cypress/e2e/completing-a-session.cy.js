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
      cy.dialog().find('md-filled-text-field').find('input', { includeShadowDom: true }).first().click().type('Squat')

      cy.dialog().find("[data-cy=dialog-action]").click()


      cy.getA('.repcount').first().click()
      cy.getA('.snackbar').contains('Rest between').should('be.visible')
      cy.getA('.repcount').first().click().should('contain.text', '9/10')

      cy.getA('[data-cy=weight-display]').first().click()

      cy.dialog().find('[data-cy=increment-weight]').first().click().click().click()

      cy.dialog().find("[dialog-action=save]").click()

      cy.get('[data-cy=save-session-button]').click()

      cy.navigate('History')

      cy.getA('[data-cy=session-summary-title]').first().should('contain.text', 'Freeform Session');

      cy.getA('[data-cy=session-summary]').should('contain.text', '7.5kg')
    })
  })

  describe('When a user selects a pre-made program', () => {
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


    describe('and selects a workout', () => {
      it('can complete a workout and update its date', () => {
        cy.containsA('Workout A').click()
        cy.containsA('Rest between').should('not.exist')
        updateWeight(0, 20)
        updateWeight(1, 20)
        updateWeight(2, 20)
        cy.getA('.repcount').first().click()
        cy.getA('.snackbar').contains('Rest between').should('be.visible')
        cy.getA('.repcount').first().click().should('contain.text', '4/5')

        for (let i = 1; i <= 6; i++) {
          cy.getA('.repcount').eq(i).click()
        }

        cy.getA('.snackbar').should('be.visible').should('contain.text', 'This session').should('contain.text', '680')

        cy.get('[data-cy=save-session-button]').click()

        cy.getA('[data-cy=session-summary-title]').should('contain.text', 'Workout B')

        cy.navigate('History')

        cy.getA('[data-cy=session-summary-title]').should('contain.text', 'Workout A').click()

        cy.getA('md-filled-text-field[type=date]').get('input', { includeShadowDom: true }).first().click().type('2023-05-22')

        cy.get('[data-cy=save-session-button]').click()

        cy.recursionLoop(() => {
          if (Cypress.$('[data-cy=calendar-month]').text().includes('May 2023')) {
            return false
          }
          cy.getA('[data-cy=calendar-nav-previous-month]').first().click()
        }, 200)

        cy.getA('[data-cy=session-summary-title]').should('contain.text', 'Workout A').should('contain.text', '22 May 2023')
      })

      it('can complete a workout while switching to per set weights with it progressing properly', () => {
        cy.containsA('Workout A').click()
        cy.containsA('Rest between').should('not.exist')
        updateWeight(0, 20)
        updateWeight(1, 20)
        updateWeight(2, 20)
        cy.getA('.repcount').first().click().should('contain.text', '5/5')
        cy.getA('.snackbar').contains('Rest between').should('be.visible')

        cy.getA('.itemlist div').eq(0).should('contain.text', 'Squat')
        cy.getA('[data-cy=weight-display]').first().should('contain.text', '20kg')
        cy.getA('[data-cy=per-rep-weight-btn]').first().click()

        // Update the weight of the second set to be lower than the top level weight
        cy.getA('[data-cy=set-weight-button]').eq(1).click()
        cy.dialog().find('[data-cy=decrement-weight]:visible').click()
        cy.dialog().find('[slot="actions"]:visible').find('[dialog-action=save]').click()
        cy.getA('[data-cy=set-weight-button]').eq(1).should('contain.text', '17.5kg')
        cy.getA('[data-cy=set-weight-button]').eq(2).should('contain.text', '20kg')

        // Update top level weight - which should update all sets which aren't completed and have the same weight (i.e. the last set)
        cy.getA('[data-cy=weight-display]').first().click()
        cy.dialog().find('[data-cy=decrement-weight]').first().click().click().click()
        cy.dialog().find('[slot="actions"]:visible').find('[dialog-action=save]').click()
        cy.getA('[data-cy=set-weight-button]').eq(0).should('contain.text', '20kg')
        cy.getA('[data-cy=set-weight-button]').eq(1).should('contain.text', '17.5kg')
        cy.getA('[data-cy=set-weight-button]').eq(2).should('contain.text', '12.5kg')

        // We reduced top level weight to 12.5
        cy.getA('[data-cy=weight-display]').first().should('contain.text', '12.5kg')

        // Complete all sets
        for (let i = 1; i <= 6; i++) {
          cy.getA('.repcount').eq(i).click()
        }

        cy.getA('.snackbar').should('be.visible').should('contain.text', 'This session').should('contain.text', '650')
        cy.get('[data-cy=save-session-button]').click()

        cy.getA('[data-cy=session-summary-title]').eq(0).should('contain.text', 'Workout B')
        cy.getA('[data-cy=session-summary-title]').eq(1).should('contain.text', 'Workout A').click()

        cy.getA('[data-cy=weighted-exercise]').eq(0).should('contain.text', 'Squat')
        // Since all sets were completed - with at least one of the sets having equal or higher weight than the top level, the weight should have increased
        cy.getA('[data-cy=weight-display]').first().should('contain.text', '15kg')
      })

      it('can complete a workout and change the number of reps with it not adding progressive overload', () => {
        cy.containsA('Workout A').click()
        cy.containsA('Rest between').should('not.exist')
        updateWeight(0, 20)
        cy.getA('.repcount').first().click().should('contain.text', '5/5')
        cy.getA('.snackbar').contains('Rest between').should('be.visible')

        cy.getA('.itemlist div').eq(0).should('contain.text', 'Squat')
        cy.getA('[data-cy=weight-display]').first().should('contain.text', '20kg')

        // Update number of reps on the exercise
        cy.getA('[data-cy=more-exercise-btn]').first().click()
        cy.getA('[data-cy=exercise-edit-menu-button]').first().click()

        // Update the number of reps to 6
        cy.dialog().find('[data-cy=exercise-reps]').should('contain.text', '5').find('[data-cy=fixed-increment]').click()
        cy.dialog().find('[data-cy=dialog-action]').click()

        // Complete all sets
        for (let i = 1; i <= 6; i++) {
          cy.getA('.repcount').eq(i).click()
        }

        cy.get('[data-cy=save-session-button]').click()

        cy.getA('[data-cy=session-summary-title]').eq(0).should('contain.text', 'Workout B')
        cy.getA('[data-cy=session-summary-title]').eq(1).should('contain.text', 'Workout A').click()

        cy.getA('[data-cy=weighted-exercise]').eq(0).should('contain.text', 'Squat')
        // Since the number of reps was increased, the weight should not have increased because it is a "different" exercise
        cy.getA('[data-cy=weight-display]').first().should('contain.text', '0kg')
      })

      it('can add notes to an exercise and see them the next time they do that exercise', () => {
        cy.containsA('Workout A').click()

        cy.getA('[data-cy=more-exercise-btn]').first().click()
        cy.getA('[data-cy=exercise-notes-btn]').first().click()
        cy.dialog().find('md-outlined-text-field').find('textarea', { includeShadowDom: true }).first().click().type('I am NoteTaker, master of notes')
        cy.dialog().find('[data-cy=notes-dialog-actions]').find('[dialog-action=save]').click()
        cy.getA('.repcount').first().click().should('contain.text', '5/5')

        cy.get('[data-cy=save-session-button]').click()

        cy.navigate('History')

        cy.getA('[data-cy=session-summary-title]').first().should('contain.text', 'Workout A').click()

        cy.getA('[data-cy=more-exercise-btn]').first().click()
        cy.getA('[data-cy=exercise-notes-btn]').first().click()
        cy.dialog().find('md-outlined-text-field').find('textarea', { includeShadowDom: true })
          .first()
          .should('have.value', 'I am NoteTaker, master of notes')
          .type('Replace notes but do not save')
        cy.dialog().find('[data-cy=notes-dialog-actions]').find("[dialog-action=close]").click()

        cy.navigate('Workout')
        cy.containsA('Workout A').click()

        cy.getA('[data-cy=exercise-previous-notes]').should('contain.text', 'I am NoteTaker, master of notes')
      })
    })
  })
})


function updateWeight(index, amount) {
  cy.getA('[data-cy=weight-display]').eq(index).click()
  cy.dialog().find('[data-cy=weight-input]:visible').find('input', { includeShadowDom: true }).click().type(amount.toString())
  cy.dialog().find('[slot="actions"]:visible').find('[dialog-action=save]').click()
}
