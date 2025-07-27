/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject> {
    getByTestId<E>(testId: string): Chainable<JQuery<E>>;
    findByTestId<E>(testId: string): Chainable<JQuery<E>>;

    /**
     * Navigate using the nav buttons
     */
    navigate<E>(navButtonText: string): Chainable<JQuery<E>>;

    dialog<E>(): Chainable<JQuery<E>>;

    recursionLoop<E>(
      fn: (times: number) => boolean,
      times?: number
    ): Chainable<JQuery<E>>;
  }
}
