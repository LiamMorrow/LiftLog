/// <reference types="cypress" />

describe('Creating a plan', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('When a user creates a plan', () => {
    beforeEach(() => {
      cy.navigate('Settings')
      cy.containsA('Manage workouts').click()
      cy.containsA('Add Session').click()
      cy.containsA('Session 1').click()
      cy.containsA('Add Exercise').click()
      cy.getA('[data-cy=exercise-name]').find('input', { includeShadowDom: true }).clear().type('Bench Press')
      cy.getA('[data-cy=exercise-sets]').should('contain.text', '3').find('[data-cy=fixed-increment]').click()
      cy.getA('[data-cy=exercise-reps]').should('contain.text', '10').find('[data-cy=fixed-decrement]').click()
      cy.getA('[data-cy=exercise-initial-weight]').find('[data-cy=editable-field]').find('input', { includeShadowDom: true }).clear().type('55')
      cy.getA('[data-cy=exercise-auto-increase]').find('[data-cy=editable-field]').find('input', { includeShadowDom: true }).clear().type('4.5')
      cy.getA('[data-cy=exercise-superset]').click()
      cy.containsA('Long', { includeShadowDom: true }).click().parent('md-filter-chip').should('have.class', 'selected')

      cy.containsA('Save', { includeShadowDom: true }).click()
    })
    it('should have saved that plan', () => {
      cy.containsA('Session 1').click()
      cy.getA('[data-cy=exercise-name]').find('input', { includeShadowDom: true }).should('have.value', 'Bench Press')
      cy.getA('[data-cy=exercise-sets]').should('contain.text', '4')
      cy.getA('[data-cy=exercise-reps]').should('contain.text', '9')


      cy.getA('[data-cy=exercise-initial-weight]').find('[data-cy=editable-field]').find('input', { includeShadowDom: true }).should('have.value', '55')
      cy.getA('[data-cy=exercise-auto-increase]').find('[data-cy=editable-field]').find('input', { includeShadowDom: true }).should('have.value', '4.5')
      cy.getA('[data-cy=exercise-superset]').should('have.attr', 'selected')
      cy.containsA('Long', { includeShadowDom: true }).parent('md-filter-chip').should('have.class', 'selected')
    })

  })
})
