/// <reference types="cypress" />
/// <reference types="../support/index.d.ts" />

describe('Feed functionality', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should enable feed publishing, complete a freeform session, and attempt to share feed URL', () => {
    // Navigate to Feed
    cy.navigate('Feed')

    // Click the fix button to enable publishing
    cy.getByTestId('feed-fix-button').click()

    // Turn on feed publishing
    cy.getByTestId('feed-publish-workouts-switch').click()

    // Close the feed editor dialog
    cy.getByTestId('dialog-close').click()

    // Navigate back to Workout tab to complete a freeform session
    cy.navigate('Workout')

    // Start a freeform workout
    cy.contains('Freeform').click()

    // Complete the session (without adding exercises as requested)
    cy.getByTestId('save-session-button').click()

    // Go back to Feed
    cy.navigate('Feed')

    // Click the share button to get the share URL and visit it
    cy.getByTestId('share-url').then(e => {
      const shareUrl = e.data('share-url')
      cy.visit(shareUrl.replace('https://app.liftlog.online', ''))
    })

    // Accept the follow request on the share page
    cy.getByTestId('feed-share-accept-button').should('be.visible').click()

    // Go back to Feed
    cy.navigate('Feed')

    // Navigate to followers tab (index 2)
    cy.getByTestId('tab_2').should('be.visible').click()

    // Accept the follow request
    cy.getByTestId('feed-accept-follow-request').should('be.visible').click()

    // Navigate back to the main feed tab (index 0)
    cy.getByTestId('tab_0').should('be.visible').click()

    // Pull to refresh to see the workout in feed
    cy.get('[data-testid="feed-list"]').should('be.visible')
    // Simulate refresh by scrolling up and releasing
    cy.get('[data-testid="feed-list"]').scrollTo('top', { ensureScrollable: false })
    cy.wait(3000)
    cy.reload()

    // Verify the workout appears in the feed
    cy.contains('completed a workout').should('be.visible')
    cy.contains('Freeform Workout').should('be.visible')
  })
})
