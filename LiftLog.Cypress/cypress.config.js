const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    viewportHeight: 800,
    viewportWidth: 400,
    defaultCommandTimeout: 10000,
    baseUrl: 'http://127.0.0.1:5000',
    video: true
  },
});
