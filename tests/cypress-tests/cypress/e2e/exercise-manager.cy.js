/// <reference types="cypress" />
/// <reference types="../support/index.d.ts"/>

describe('Exercise Manager', () => {
    beforeEach(() => {
        cy.visit('/')
        cy.navigate("Settings")
        cy.contains("Manage exercises").click()
    });

    it('should add a new exercise', () => {
        cy.getByTestId('exercise-add-fab').click();
        cy.getByTestId('exercise-name-input').should('have.value', 'New exercise');
    });

    it('should edit exercise details', () => {
        cy.getByTestId('exercise-add-fab').click();
        cy.getByTestId('exercise-name-input').clear().type('Bench Press');
        cy.getByTestId('exercise-instructions-input').clear().type('Lie on bench and press bar.');
        cy.getByTestId('exercise-name-input').should('have.value', 'Bench Press');
        cy.getByTestId('exercise-instructions-input').should('have.value', 'Lie on bench and press bar.');
    });

    it('should filter exercises by name', () => {
        cy.getByTestId('exercise-add-fab').click();
        cy.getByTestId('exercise-name-input').clear().type('Squat');
        cy.getByTestId('expand-filters-btn').click();
        cy.getByTestId('exercise-search-input').clear().type('Squat');
        cy.getByTestId('exercise-name-input').should('have.value', 'Squat');
    });

    it('should delete an exercise and allow undo', () => {
        cy.getByTestId('exercise-add-fab').click();
        cy.getByTestId('exercise-name-input').clear().type('Deadlift');
        cy.getByTestId('exercise-delete-btn').click({ force: true });
        cy.contains('Deadlift deleted');
        cy.contains('Undo').click();
        cy.getByTestId('exercise-name-input').should('have.value', 'Deadlift');
    });
});
