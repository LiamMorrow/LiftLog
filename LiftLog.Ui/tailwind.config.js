
const fs = require('fs')
const configJSON = JSON.parse(fs.readFileSync('../LiftLog.Ui/wwwroot/twconf.json').toString("utf-8"))
// We put the config in the wwwroot file so we can load it during development when using the play cdn
/** @type {import('tailwindcss').Config} */
module.exports =  {...configJSON}