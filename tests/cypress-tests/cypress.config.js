const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    viewportHeight: 800,
    viewportWidth: 400,
    defaultCommandTimeout: 30000,
    baseUrl: 'http://127.0.0.1:8081',
    video: true
  },
});
