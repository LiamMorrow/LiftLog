// const configJSON = require('./wwwroot/twconf.json')

// We put the config in the wwwroot file so we can load it during development when using the play cdn
/** @type {import('tailwindcss').Config} */
module.exports =  {
    "content": [
        "./**/*.{razor,html}"
    ],
    "plugins": []
}