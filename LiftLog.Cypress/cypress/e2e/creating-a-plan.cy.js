/// <reference types="cypress" />

describe('Creating a plan', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('When a user edits their current plan', () => {
    beforeEach(() => {
      cy.navigate('Settings')
      // Disable tips
      cy.containsA('Show tips').click()
      cy.containsA('Manage workouts').click()
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
      cy.containsA('Show tips').click()
      cy.containsA('Manage plans').click()
      cy.getA('md-fab').click()
      cy.getA('md-filled-text-field').find('input', { includeShadowDom: true }).first().click().type('I am a new plan')

      populatePlanFromEditPage('benchFromNewPlan')
    })

    it('should have saved that plan', () => {
      assertPlanFromEditPage('benchFromNewPlan')
    })

    it.only('should be able to use the new plan', () => {
      cy.get('[data-cy=back-btn]', { includeShadowDom: true }).click()
      cy.getA('md-list-item').should('contain.text', 'I am a new plan').find('md-icon-button').click()
      cy.containsA('Use').click()
      cy.dialog().find('[slot=actions]').contains("Use").click()

      cy.containsA('benchFromNewPlan').click()
    })
  })
})

function populatePlanFromEditPage(exerciseName) {

  cy.containsA('Add Session', { includeShadowDom: true }).click()
  cy.containsA('Session 1').click()
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

  cy.containsA('Session 1').click()
  cy.getA('.itemlist').children().first().click()
  cy.dialog().find('[data-cy=exercise-name]').find('input', { includeShadowDom: true }).should('have.value', exerciseName)
  cy.dialog().find('[data-cy=exercise-sets]').should('contain.text', '4')
  cy.dialog().find('[data-cy=exercise-reps]').should('contain.text', '9')


  cy.dialog().find('[data-cy=exercise-auto-increase]').find('[data-cy=editable-field]').find('input', { includeShadowDom: true }).should('have.value', '4.5')
  cy.dialog().find('[data-cy=exercise-superset]').should('have.attr', 'selected')
  cy.dialog().contains('Long', { includeShadowDom: true }).parent('md-outlined-segmented-button').should('have.attr', 'selected')

}
