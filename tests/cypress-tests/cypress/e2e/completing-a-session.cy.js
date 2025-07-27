/// <reference types="cypress" />

describe('Completing a session', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('When a user adds a freeform session', () => {
    beforeEach(() => {
      cy.contains('Freeform').click()
    })

    it('can complete a freeform workout', () => {
      cy.getByTestId('session-more').click()
      cy.getByTestId('session-add-exercise').click()
      cy.dialog().find('input').first().click().type('Squat')

      cy.dialog().find("[data-testid=dialog-action]").click()


      cy.getByTestId('repcount').first().click()
      cy.getByTestId('rest-timer').should('be.visible')
      cy.getByTestId('repcount').first().click().should('contain.text', '9/10')

      cy.getByTestId('repcount-weight').first().click()

      cy.dialog().find('[data-testid=increment-weight]').first().click().click().click()

      cy.dialog().find("[data-testid=save]").click()

      cy.getByTestId('save-session-button').click()
      cy.dialog().find('[data-testid=action-ok]').click()

      cy.navigate('History')

      cy.getByTestId('history-list').findByTestId('session-summary-title').should('be.visible').first().should('contain.text', 'Freeform Session');

      cy.getByTestId('session-summary').should('contain.text', '7.5kg')
    })
  })

  describe('When a user selects a pre-made program', () => {
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


    describe('and selects a workout', () => {
      it('can complete a workout and update its date', () => {
        cy.contains('Workout A').click()
        cy.contains('Rest between').should('not.exist')
        updateWeight(0, 20)
        updateWeight(1, 20)
        updateWeight(2, 20)
        cy.getByTestId('repcount').first().click()
        cy.get('.snackbar').contains('Rest between').should('be.visible')
        cy.getByTestId('repcount').first().click().should('contain.text', '4/5')

        for (let i = 1; i <= 6; i++) {
          cy.getByTestId('repcount').eq(i).click()
        }

        cy.get('.snackbar').should('be.visible').should('contain.text', 'This session').should('contain.text', '680')

        cy.getByTestId('save-session-button').click()

        cy.getByTestId('session-summary-title').should('contain.text', 'Workout B')

        cy.navigate('History')

        cy.getByTestId('session-summary-title').should('contain.text', 'Workout A').click()

        cy.get('md-filled-text-field[type=date]').get('input',).first().click().type('2023-05-22')

        cy.getByTestId('save-session-button').click()

        cy.recursionLoop(() => {
          if (Cypress.$('[data-cy=calendar-month]').text().includes('May 2023')) {
            return false
          }
          cy.get('[data-cy=calendar-nav-previous-month]').first().click()
        }, 200)

        cy.getByTestId('session-summary-title').should('contain.text', 'Workout A').should('contain.text', '22 May 2023')
      })

      it('can complete a workout while switching to per set weights with it progressing properly', () => {
        cy.contains('Workout A').click()
        cy.contains('Rest between').should('not.exist')
        updateWeight(0, 20)
        updateWeight(1, 20)
        updateWeight(2, 20)
        cy.getByTestId('repcount').first().click().should('contain.text', '5/5')
        cy.get('.snackbar').contains('Rest between').should('be.visible')

        cy.get('.itemlist div').eq(0).should('contain.text', 'Squat')
        cy.get('[data-cy=weight-display]').first().should('contain.text', '20kg')
        cy.get('[data-cy=per-rep-weight-btn]').first().click()

        // Update top level weight - which should update all sets which aren't completed and have the same weight (i.e. the last set)
        cy.get('[data-cy=weight-display]').first().should('not.be.visible')


        // Update the weight of the second set to be lower than the top level weight
        cy.get('[data-cy=set-weight-button]').eq(1).click()
        cy.dialog().find('[data-cy=decrement-weight]:visible').click()
        cy.dialog().find('[slot="actions"]:visible').find('[dialog-action=save]').click()
        cy.get('[data-cy=set-weight-button]').eq(1).should('contain.text', '17.5kg')
        cy.get('[data-cy=set-weight-button]').eq(2).should('contain.text', '20kg')


        cy.get('[data-cy=set-weight-button]').eq(0).should('contain.text', '20kg')
        cy.get('[data-cy=set-weight-button]').eq(1).should('contain.text', '17.5kg')
        cy.get('[data-cy=set-weight-button]').eq(2).should('contain.text', '20kg')

        // Complete all sets
        for (let i = 1; i <= 6; i++) {
          cy.getByTestId('repcount').eq(i).click()
        }

        cy.get('.snackbar').should('be.visible').should('contain.text', 'This session').should('contain.text', '687.5')
        cy.getByTestId('save-session-button').click()

        cy.getByTestId('session-summary-title').eq(0).should('contain.text', 'Workout B')
        cy.getByTestId('session-summary-title').eq(1).should('contain.text', 'Workout A').click()

        cy.get('[data-cy=weighted-exercise]').eq(0).should('contain.text', 'Squat')
        // Since all sets were completed - with at least one of the sets having equal or higher weight than the top level, the weight should have increased
        cy.get('[data-cy=set-weight-button]').eq(0).should('contain.text', '22.5kg')
        cy.get('[data-cy=set-weight-button]').eq(1).should('contain.text', '20kg')
        cy.get('[data-cy=set-weight-button]').eq(2).should('contain.text', '22.5kg')
      })

      it('can complete a workout and change the number of reps with it not adding progressive overload', () => {
        cy.contains('Workout A').click()
        cy.contains('Rest between').should('not.exist')
        updateWeight(0, 20)
        cy.getByTestId('repcount').first().click().should('contain.text', '5/5')
        cy.get('.snackbar').contains('Rest between').should('be.visible')

        cy.get('.itemlist div').eq(0).should('contain.text', 'Squat')
        cy.get('[data-cy=weight-display]').first().should('contain.text', '20kg')

        // Update number of reps on the exercise
        cy.get('[data-cy=more-exercise-btn]').first().click()
        cy.get('[data-cy=exercise-edit-menu-button]').first().click()

        // Update the number of reps to 6
        cy.dialog().find('[data-cy=exercise-reps]').should('contain.text', '5').find('[data-cy=fixed-increment]').click()
        cy.dialog().find('[data-cy=dialog-action]').click()

        // Complete all sets
        for (let i = 1; i <= 6; i++) {
          cy.getByTestId('repcount').eq(i).click()
        }

        cy.getByTestId('save-session-button').click()

        cy.getByTestId('session-summary-title').eq(0).should('contain.text', 'Workout B')
        cy.getByTestId('session-summary-title').eq(1).should('contain.text', 'Workout A').click()

        cy.get('[data-cy=weighted-exercise]').eq(0).should('contain.text', 'Squat')
        // Since the number of reps was increased, the weight should not have increased because it is a "different" exercise
        cy.get('[data-cy=weight-display]').first().should('contain.text', '0kg')
      })

      it('can add notes to an exercise and see them the next time they do that exercise', () => {
        cy.contains('Workout A').click()

        cy.get('[data-cy=more-exercise-btn]').first().click()
        cy.get('[data-cy=exercise-notes-btn]').first().click()
        cy.dialog().find('md-outlined-text-field').find('textarea',).first().click().type('I am NoteTaker, master of notes')
        cy.dialog().find('[data-cy=notes-dialog-actions]').find('[dialog-action=save]').click()
        cy.getByTestId('repcount').first().click().should('contain.text', '5/5')

        cy.getByTestId('save-session-button').click()
        cy.dialog().find('[data-testid=action-ok]').click()

        cy.navigate('History')

        cy.getByTestId('session-summary-title').first().should('contain.text', 'Workout A').click()

        cy.get('[data-cy=more-exercise-btn]').first().click()
        cy.get('[data-cy=exercise-notes-btn]').first().click()
        cy.dialog().find('md-outlined-text-field').find('textarea',)
          .first()
          .should('have.value', 'I am NoteTaker, master of notes')
          .type('Replace notes but do not save')
        cy.dialog().find('[data-cy=notes-dialog-actions]').find("[dialog-action=close]").click()

        cy.navigate('Workout')
        cy.contains('Workout A').click()

        cy.get('[data-cy=exercise-previous-notes]').should('contain.text', 'I am NoteTaker, master of notes')
      })
    })
  })
})


function updateWeight(index, amount) {
  cy.get('[data-cy=weight-display]').eq(index).click()
  cy.dialog().find('[data-cy=weight-input]:visible').find('input',).click().type(amount.toString())
  cy.dialog().find('[slot="actions"]:visible').find('[dialog-action=save]').click()
}
