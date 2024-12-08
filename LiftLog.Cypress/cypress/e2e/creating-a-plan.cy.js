/// <reference types="cypress" />

describe('Creating a plan', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('When a user edits their current plan', () => {
    beforeEach(() => {
      cy.navigate('Settings')
      // Disable tips
      cy.containsA('App configuration').click()
      cy.containsA('Show tips').click()
      cy.navigate('Settings')
      cy.containsA('Manage plans').click()
      cy.containsA('My Program').parent('md-list-item').click()
      populatePlanFromEditPage('benchFromCurrentPlan')
    })
    it('should have saved that plan', () => {
      assertPlanFromEditPage('benchFromCurrentPlan')
    })
  })
  describe('When a user create a new plan', () => {
    beforeEach(() => {
      cy.navigate('Settings')
      // Disable tips
      cy.containsA('App configuration').click()
      cy.containsA('Show tips').click()
      cy.navigate('Settings')
      cy.containsA('Manage plans').click()
      cy.getA('md-fab').click()
      cy.getA('md-filled-text-field').find('input', { includeShadowDom: true }).first().click().type('I am a new plan')

      populatePlanFromEditPage('benchFromNewPlan')
    })

    it('should have saved that plan', () => {
      assertPlanFromEditPage('benchFromNewPlan')
    })

    it('should be able to use the new plan', () => {
      cy.get('[data-cy=back-btn]', { includeShadowDom: true }).click()
      cy.containsA('I am a new plan').parent('md-list-item').contains('Use').click()

      cy.navigate('Workout')
      cy.containsA('benchFromNewPlan').click()
    })
  })
})

function populatePlanFromEditPage(exerciseName) {

  cy.containsA('Add workout', { includeShadowDom: true }).click()
  cy.containsA('Add Exercise', { includeShadowDom: true }).click()
  cy.dialog().find('[data-cy=exercise-name]').find('input', { includeShadowDom: true }).clear().type(exerciseName)
  cy.dialog().find('[data-cy=exercise-sets]').should('contain.text', '3').find('[data-cy=fixed-increment]').click()
  cy.dialog().find('[data-cy=exercise-reps]').should('contain.text', '10').find('[data-cy=fixed-decrement]').click()
  cy.dialog().find('[data-cy=exercise-auto-increase]').find('[data-cy=editable-field]').find('input', { includeShadowDom: true }).clear().type('4.5')
  cy.dialog().find('[data-cy=exercise-superset]').click()
  cy.dialog().contains('Long', { includeShadowDom: true }).click().parent('md-outlined-segmented-button').should('have.attr', 'selected')

  cy.dialog().contains("Save").click()

  cy.get('[data-cy=back-btn]', { includeShadowDom: true }).click()
}

function assertPlanFromEditPage(exerciseName) {

  cy.containsA('Workout 1').click()
  cy.getA('.itemlist').children().first().click()
  cy.dialog().find('[data-cy=exercise-name]').find('input', { includeShadowDom: true }).should('have.value', exerciseName)
  cy.dialog().find('[data-cy=exercise-sets]').should('contain.text', '4')
  cy.dialog().find('[data-cy=exercise-reps]').should('contain.text', '9')


  cy.dialog().find('[data-cy=exercise-auto-increase]').find('[data-cy=editable-field]').find('input', { includeShadowDom: true }).should('have.value', '4.5')
  cy.dialog().find('[data-cy=exercise-superset]').should('have.attr', 'selected')
  cy.dialog().contains('Long', { includeShadowDom: true }).parent('md-outlined-segmented-button').should('have.attr', 'selected')

}
