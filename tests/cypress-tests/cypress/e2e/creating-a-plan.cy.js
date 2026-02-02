/// <reference types="cypress" />
/// <reference types="../support/index.d.ts" />

const benchFromCurrentPlan = 'bc'
const benchFromNewPlan = 'bn'

describe('Creating a plan', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.completeWelcomeWizard()
  })

  describe('When a user edits their current plan', () => {
    beforeEach(() => {
      cy.navigate('Settings')
      // Disable tips
      cy.contains('App configuration').click()
      cy.contains('Show tips').click()
      cy.navigate('Settings')
      cy.contains('Manage plans').click()
      cy.contains('Starting Strength').click()
      populatePlanFromEditPage(benchFromCurrentPlan)
    })
    it('should have saved that plan', () => {
      assertPlanFromEditPage(benchFromCurrentPlan, 'Workout 3')
    })
  })
  describe('When a user create a new plan', () => {
    beforeEach(() => {
      cy.navigate('Settings')
      // Disable tips
      cy.contains('App configuration').click()
      cy.contains('Show tips').click()
      cy.navigate('Settings')
      cy.contains('Manage plans').click()
      cy.contains('Add plan').click()
      cy.get('input',).first().click().clear().type('I am a new plab{backspace}n')

      populatePlanFromEditPage(benchFromNewPlan)
    })

    it('should have saved that plan', () => {
      assertPlanFromEditPage(benchFromNewPlan, 'Workout 1')
    })

    it('should be able to use the new plan', () => {
      // Back button
      cy.get('[data-testid=appbar-header]:visible').findByTestId('icon-button').click()
      cy.contains('I am a new plan').click()

      cy.navigate('Workout')
      cy.contains(benchFromNewPlan)
    })
  })
})

function populatePlanFromEditPage(exerciseName) {

  cy.contains('Add workout',).click()
  cy.contains('Add exercise',).click()
  cy.dialog().findByTestId('exercise-name').clear().type(exerciseName)
  cy.dialog().findByTestId('exercise-reps').should('contain.text', '10').findByTestId('fixed-decrement').click()
  cy.dialog().findByTestId('exercise-sets').should('contain.text', '3').findByTestId('fixed-increment').click()
  cy.dialog().findByTestId('exercise-auto-increase').clear().type('4.5')
  cy.dialog().findByTestId('exercise-superset').click()
  cy.dialog().contains('Long').click()

  cy.dialog().findByTestId('dialog-action').click()

  // Back button
  cy.get('[data-testid=appbar-header]:visible').findByTestId('icon-button').click()
}

function assertPlanFromEditPage(exerciseName, workoutName) {

  cy.contains(workoutName).click()
  cy.getByTestId('exercise-blueprint-summary').first().click()
  cy.dialog().findByTestId('exercise-name').should('have.value', exerciseName)
  cy.dialog().findByTestId('exercise-sets').should('contain.text', '4')
  cy.dialog().findByTestId('exercise-reps').should('contain.text', '9')

  cy.dialog().findByTestId('exercise-auto-increase').should('have.value', '4.5')
  cy.dialog().findByTestId('exercise-superset').children().find('[checked]')
  cy.dialog().contains('Long')

}
