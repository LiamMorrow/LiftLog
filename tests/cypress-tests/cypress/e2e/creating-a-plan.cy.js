/// <reference types="cypress" />

const benchFromCurrentPlan = 'bc'
const benchFromNewPlan = 'bn'

describe('Creating a plan', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('When a user edits their current plan', () => {
    beforeEach(() => {
      cy.navigate('Settings')
      // Disable tips
      cy.contains('App configuration').click()
      cy.contains('Show tips').click()
      cy.navigate('Settings')
      cy.contains('Manage plans').click()
      cy.contains('My Program').parent('md-list-item').click()
      populatePlanFromEditPage(benchFromCurrentPlan)
    })
    it('should have saved that plan', () => {
      assertPlanFromEditPage(benchFromCurrentPlan)
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
      cy.get('md-fab').click()
      cy.get('md-filled-text-field').find('input',).first().click().type('I am a new plan')

      populatePlanFromEditPage(benchFromNewPlan)
    })

    it('should have saved that plan', () => {
      assertPlanFromEditPage(benchFromNewPlan)
    })

    it('should be able to use the new plan', () => {
      cy.get('[data-cy=back-btn]',).click()
      cy.contains('I am a new plan').parent('md-list-item').find('[data-cy=use-plan-btn]').click()

      cy.navigate('Workout')
      cy.contains(benchFromNewPlan).click()
    })
  })
})

function populatePlanFromEditPage(exerciseName) {

  cy.contains('Add workout',).click()
  cy.contains('Add exercise',).click()
  cy.dialog().find('[data-cy=exercise-name]').find('input',).clear().type(exerciseName)
  cy.dialog().find('[data-cy=exercise-reps]').should('contain.text', '10').find('[data-cy=fixed-decrement]').click()
  cy.dialog().find('[data-cy=exercise-sets]').should('contain.text', '3').find('[data-cy=fixed-increment]').click()
  cy.dialog().find('[data-cy=exercise-auto-increase]').find('[data-cy=editable-field]').find('input',).clear().type('4.5')
  cy.dialog().find('[data-cy=exercise-superset]').click()
  cy.dialog().contains('Long',).click().parent('md-outlined-segmented-button').should('have.attr', 'selected')

  cy.dialog().find("[data-cy=dialog-action]").click()

  cy.get('[data-cy=back-btn]',).click()
}

function assertPlanFromEditPage(exerciseName) {

  cy.contains('Workout 1').click()
  cy.get('.itemlist').children().first().click()
  cy.dialog().find('[data-cy=exercise-name]').find('input',).should('have.value', exerciseName)
  cy.dialog().find('[data-cy=exercise-sets]').should('contain.text', '4')
  cy.dialog().find('[data-cy=exercise-reps]').should('contain.text', '9')


  cy.dialog().find('[data-cy=exercise-auto-increase]').find('[data-cy=editable-field]').find('input',).should('have.value', '4.5')
  cy.dialog().find('[data-cy=exercise-superset]').should('have.attr', 'selected')
  cy.dialog().contains('Long',).parent('md-outlined-segmented-button').should('have.attr', 'selected')

}
