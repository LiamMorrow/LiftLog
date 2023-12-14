cp ./node_modules/@melloware/coloris/dist/coloris.min.css ./wwwroot/coloris.min.css
tailwindcss --config tailwind.config.js -i ./Styles/app.css -o ./wwwroot/app.min.css
rollup -p @rollup/plugin-node-resolve index.js > ./wwwroot/bundle.js
