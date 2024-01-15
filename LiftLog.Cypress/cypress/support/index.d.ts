/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable<Subject> {
    /**
     * Identical to get, but looks in the currently transitioned to page.
     * Use this when looking for content which will be animated (i.e. within pages).
     *
     * Required because when we transition between pages, we keep the old page rendered in the dom
     */
    getA(selector: string, options: Partial<Loggable & Timeoutable & CaseMatchable & Shadow>): Chainable<JQuery<E>>;
    /**
     * Identical to contains, but looks in the currently transitioned to page.
     * Use this when looking for content which will be animated (i.e. within pages).
     *
     * Required because when we transition between pages, we keep the old page rendered in the dom
     */
    containsA(
      selector: string,
      options: Partial<Loggable & Timeoutable & CaseMatchable & Shadow>
    ): Chainable<JQuery<E>>;
    /**
     * Navigate using the nav buttons
     */
    navigate(navButtonText: string): Chainable<JQuery<E>>;

    dialog(): Chainable<JQuery<E>>;
  }
}
