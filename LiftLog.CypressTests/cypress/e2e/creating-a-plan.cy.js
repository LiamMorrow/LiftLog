/// <reference types="cypress" />

describe('Creating a plan', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('When a user creates a plan', () => {
    beforeEach(() => {
      cy.get('nav').contains('Settings').click()
      cy.contains('Manage workouts').click()
      cy.contains('Add Session').click()
      cy.contains('Session 1').click()
      cy.contains('Add Exercise').click()
      cy.get('[data-cy=exercise-name]').find('input', { includeShadowDom: true }).clear().type('Bench Press')
      cy.get('[data-cy=exercise-sets]').should('contain.text', '3').find('[data-cy=fixed-increment]').click()
      cy.get('[data-cy=exercise-reps]').should('contain.text', '10').find('[data-cy=fixed-decrement]').click()
      cy.get('[data-cy=exercise-initial-weight]').find('[data-cy=editable-field]').find('input', { includeShadowDom: true }).clear().type('55')
      cy.get('[data-cy=exercise-auto-increase]').find('[data-cy=editable-field]').find('input', { includeShadowDom: true }).clear().type('4.5')
      cy.get('[data-cy=exercise-superset]').click()
      cy.contains('Long', { includeShadowDom: true }).click().parent('md-filter-chip').should('have.class', 'selected')

      cy.contains('Save', { includeShadowDom: true }).click()
    })
    it('should have saved that plan', () => {
      cy.contains('Session 1').click()
      cy.get('[data-cy=exercise-name]').find('input', { includeShadowDom: true }).should('have.value', 'Bench Press')
      cy.get('[data-cy=exercise-sets]').should('contain.text', '4')
      cy.get('[data-cy=exercise-reps]').should('contain.text', '9')


      cy.get('[data-cy=exercise-initial-weight]').find('[data-cy=editable-field]').find('input', { includeShadowDom: true }).should('have.value', '55')
      cy.get('[data-cy=exercise-auto-increase]').find('[data-cy=editable-field]').find('input', { includeShadowDom: true }).should('have.value', '4.5')
      cy.get('[data-cy=exercise-superset]').should('have.attr', 'selected')
      cy.contains('Long', { includeShadowDom: true }).parent('md-filter-chip').should('have.class', 'selected')
    })

  })
})
