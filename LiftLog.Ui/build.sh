tailwindcss --config tailwind.config.js -i ./Styles/app.css -o ./wwwroot/app.min.css
rollup -c rollup.config.js --bundleConfigAsCjs --format iife --generatedCode es5 > ./wwwroot/bundle.js
