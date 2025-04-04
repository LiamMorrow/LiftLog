// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('getA', (selector, opts) => {
    return cy.get('.transitioned ' + selector, opts)
})

Cypress.Commands.add('containsA', (selector, opts) => {
    return cy.get('.transitioned').contains(selector, opts)
})


Cypress.Commands.add('navigate', (navButtonText) => {
    return cy.get('nav').contains(navButtonText).click().click()
})

Cypress.Commands.add('dialog', () => {
    return cy.get('md-dialog,.fullscreen-dialog')
});

Cypress.Commands.add('recursionLoop', { times: 'optional' }, function (fn, times) {
    if (typeof times === 'undefined') {
        times = 0;
    }

    cy.then(() => {
        const result = fn(++times);
        if (result !== false) {
            cy.recursionLoop(fn, times);
        }
    });
});
