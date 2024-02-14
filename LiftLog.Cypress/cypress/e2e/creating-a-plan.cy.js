/// <reference types="cypress" />

describe('Creating a plan', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('When a user creates a plan', () => {
    beforeEach(() => {
      cy.navigate('Settings')
      // Disable tips
      cy.containsA('Show tips').click()
      cy.containsA('Manage workouts').click()
      cy.containsA('Add Session', { includeShadowDom: true }).click()
      cy.containsA('Session 1').click()
      cy.containsA('Add Exercise', { includeShadowDom: true }).click()
      cy.dialog().find('[data-cy=exercise-name]').find('input', { includeShadowDom: true }).clear().type('Bench Press')
      cy.dialog().find('[data-cy=exercise-sets]').should('contain.text', '3').find('[data-cy=fixed-increment]').click()
      cy.dialog().find('[data-cy=exercise-reps]').should('contain.text', '10').find('[data-cy=fixed-decrement]').click()
      cy.dialog().find('[data-cy=exercise-auto-increase]').find('[data-cy=editable-field]').find('input', { includeShadowDom: true }).clear().type('4.5')
      cy.dialog().find('[data-cy=exercise-superset]').click()
      cy.dialog().contains('Long', { includeShadowDom: true }).click().parent('md-filter-chip').should('have.class', 'selected')

      cy.dialog().contains("Save").click()

      cy.get('[data-cy=back-btn]', { includeShadowDom: true }).click()
    })
    it('should have saved that plan', () => {
      cy.containsA('Session 1').click()
      cy.getA('.itemlist').children().first().click()
      cy.dialog().find('[data-cy=exercise-name]').find('input', { includeShadowDom: true }).should('have.value', 'Bench Press')
      cy.dialog().find('[data-cy=exercise-sets]').should('contain.text', '4')
      cy.dialog().find('[data-cy=exercise-reps]').should('contain.text', '9')


      cy.dialog().find('[data-cy=exercise-auto-increase]').find('[data-cy=editable-field]').find('input', { includeShadowDom: true }).should('have.value', '4.5')
      cy.dialog().find('[data-cy=exercise-superset]').should('have.attr', 'selected')
      cy.dialog().contains('Long', { includeShadowDom: true }).parent('md-filter-chip').should('have.class', 'selected')
    })

  })
})
