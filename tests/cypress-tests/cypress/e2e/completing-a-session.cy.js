/// <reference types="cypress" />
/// <reference types="../support/index.d.ts" />

describe('Completing a session', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('When a user adds a freeform workout', () => {
    beforeEach(() => {
      cy.contains('Freeform').click()
    })

    it('can complete it', () => {
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

      cy.getByTestId('history-list').findByTestId('session-summary-title').should('be.visible').first().should('contain.text', 'Freeform Workout');

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
      cy.contains("Starting Strength").click()
      cy.navigate('Workout')
    })


    describe('and selects a workout', () => {
      it('can complete a workout and update its date', () => {
        cy.contains('Start workout').click()
        updateWeight(0, 20)
        cy.getByTestId('repcount').first().click()
        cy.getByTestId('rest-timer').should('be.visible')
        cy.getByTestId('repcount').first().click().should('contain.text', '4/5')

        for (let i = 1; i <= 6; i++) {
          cy.getByTestId('repcount').eq(i).click()
        }

        // TODO session summaries
        // cy.get('.snackbar').should('be.visible').should('contain.text', 'This session').should('contain.text', '680')

        cy.getByTestId('save-session-button').click()

        cy.getByTestId('session-summary-title').should('contain.text', 'Workout B')

        cy.navigate('History')

        cy.getByTestId('history-list').findByTestId('session-summary-title').should('contain.text', 'Workout A')
        cy.getByTestId('history-edit-workout').first().click()


        cy.getByTestId('session-date-input-icon-button').first().click()
        cy.recursionLoop(() => {
          if (Cypress.$('[aria-label="May 2023"]').text().includes('May 2023')) {
            return false
          }
          cy.get('[aria-label="Previous"]').first().click()
        }, 200)
        // seems like months are zero based - so 22nd May 2023
        cy.getByTestId('react-native-paper-dates-day-2023-4-22').click()
        cy.getByTestId('react-native-paper-dates-save-text').click()

        cy.getByTestId('save-session-button').click()

        cy.recursionLoop(() => {
          if (Cypress.$('[data-testid=calendar-month]').text().includes('May 2023')) {
            return false
          }
          cy.getByTestId('calendar-nav-previous-month').first().click()
        }, 200)

        cy.getByTestId('history-list').findByTestId('session-summary-title').should('contain.text', 'Workout A').should('contain.text', '22').should('contain.text', 'May').should('contain.text', '2023')
      })

      it('can complete a workout while switching to per set weights with it progressing properly', () => {
        cy.contains('Start workout').click()

        updateWeight(0, 20)
        cy.getByTestId('repcount').first().click().should('contain.text', '5/5')
        cy.getByTestId('rest-timer').should('be.visible')

        cy.getByTestId('weighted-exercise-title').eq(0).should('contain.text', 'Squat')
        cy.getByTestId('repcount-weight').first().should('contain.text', '20kg')

        // Update the weight of the second set to be lower than the top level weight
        // Applying to uncompleted sets
        cy.getByTestId('repcount-weight').eq(1).click()
        cy.dialog().findByTestId('repcount-apply-weight-to-uncompleted-sets').click()
        cy.dialog().findByTestId('decrement-weight').click()
        cy.dialog().findByTestId('save').click()
        cy.getByTestId('modal').should('not.exist')

        cy.getByTestId('repcount-weight').eq(0).should('contain.text', '20kg')
        cy.getByTestId('repcount-weight').eq(1).should('contain.text', '17.5kg')
        cy.getByTestId('repcount-weight').eq(2).should('contain.text', '17.5kg')

        // Apply to this set
        cy.getByTestId('repcount-weight').eq(2).click()
        cy.dialog().findByTestId('decrement-weight').click()
        cy.dialog().findByTestId('repcount-apply-weight-to-this-set').click()
        cy.dialog().findByTestId('save').click()
        cy.getByTestId('modal').should('not.exist')

        cy.getByTestId('repcount-weight').eq(0).should('contain.text', '20kg')
        cy.getByTestId('repcount-weight').eq(1).should('contain.text', '17.5kg')
        cy.getByTestId('repcount-weight').eq(2).should('contain.text', '15kg')


        // Apply to all sets
        cy.getByTestId('repcount-weight').eq(2).click()
        cy.dialog().findByTestId('decrement-weight').click()
        cy.dialog().findByTestId('repcount-apply-weight-to-all-sets').click()
        cy.dialog().findByTestId('save').click()
        cy.getByTestId('modal').should('not.exist')

        cy.getByTestId('repcount-weight').eq(0).should('contain.text', '12.5kg')
        cy.getByTestId('repcount-weight').eq(1).should('contain.text', '12.5kg')
        cy.getByTestId('repcount-weight').eq(2).should('contain.text', '12.5kg')

        // Complete all sets
        for (let i = 1; i <= 6; i++) {
          cy.getByTestId('repcount').eq(i).click()
        }

        // TODO session summary
        // cy.get('.snackbar').should('be.visible').should('contain.text', 'This session').should('contain.text', '687.5')
        cy.getByTestId('save-session-button').click()

        cy.getByTestId('session-summary-title').eq(0).should('contain.text', 'Workout B')
        cy.contains('Start workout').click()

        cy.getByTestId('weighted-exercise-title').eq(0).should('contain.text', 'Squat')
        // Since all sets were completed - with at least one of the sets having equal or higher weight than the top level, the weight should have increased
        cy.getByTestId('repcount-weight').eq(0).should('contain.text', '15kg')
        cy.getByTestId('repcount-weight').eq(1).should('contain.text', '15kg')
        cy.getByTestId('repcount-weight').eq(2).should('contain.text', '15kg')
      })

      it('can complete a workout and change the number of reps with it not adding progressive overload', () => {
        cy.contains('Start workout').click()
        updateWeight(0, 20)
        cy.getByTestId('repcount').first().click().should('contain.text', '5/5')
        cy.getByTestId('rest-timer').should('be.visible')

        cy.getByTestId('weighted-exercise-title').eq(0).should('contain.text', 'Squat')
        cy.getByTestId('repcount-weight').first().should('contain.text', '20kg')

        // Update number of reps on the exercise
        cy.getByTestId('more-exercise-btn').first().click()
        cy.getByTestId('exercise-edit-menu-button').first().click()

        // Update the number of reps to 6
        cy.dialog().findByTestId('exercise-reps').should('contain.text', '5').findByTestId('fixed-increment').click()
        cy.dialog().findByTestId('dialog-action').click()

        // Complete all sets
        for (let i = 1; i <= 6; i++) {
          cy.getByTestId('repcount').eq(i).click()
        }

        cy.getByTestId('save-session-button').click()

        cy.getByTestId('session-summary-title').eq(0).should('contain.text', 'Workout B')
        cy.contains('Start workout').click()

        cy.getByTestId('weighted-exercise').eq(0).should('contain.text', 'Squat')
        // Since the number of reps was increased, the weight should not have increased because it is a "different" exercise
        cy.getByTestId('repcount-weight').first().should('contain.text', '0kg')
      })

      it('can add notes to an exercise and see them the next time they do that exercise', () => {
        cy.contains('Start workout').click()

        cy.getByTestId('exercise-notes-btn').first().click()
        cy.dialog().find('textarea').first().click().type('I am NoteTaker, master of notes')
        cy.dialog().findByTestId('save-notes').click()
        cy.getByTestId('repcount').first().click().should('contain.text', '5/5')

        cy.getByTestId('save-session-button').click()
        cy.dialog().find('[data-testid=action-ok]').click()

        cy.navigate('History')

        cy.getByTestId('history-list').findByTestId('session-summary-title').first().should('contain.text', 'Workout A')
        cy.getByTestId('history-edit-workout').click()


        cy.getByTestId('exercise-notes-btn').first().click()
        cy.dialog().find('textarea')
          .first()
          .should('have.value', 'I am NoteTaker, master of notes')
          .type('Replace notes but do not save')
        cy.dialog().findByTestId('cancel-notes').click()

        cy.navigate('Workout')
        cy.contains('Start workout').click()

        cy.getByTestId('exercise-previous-notes').should('contain.text', 'I am NoteTaker, master of notes')
      })
    })
  })
})


function updateWeight(index, amount) {

  cy.getByTestId('repcount-weight').eq(index).click()

  cy.dialog().find('[data-testid=weight-input]:visible').click().type(amount.toString())
  cy.dialog().findByTestId('repcount-apply-weight-to-uncompleted-sets').click()
  cy.dialog().findByTestId("save").click()
}
