npx @tailwindcss/cli --config tailwind.config.js -i ./Styles/app.css -o ./wwwroot/app.min.css
rollup -p @rollup/plugin-node-resolve index.js --format iife > ./wwwroot/bundle.js
