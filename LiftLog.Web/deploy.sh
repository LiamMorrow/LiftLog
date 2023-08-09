#! /bin/bash

npx tailwindcss --config ../LiftLog.Ui/tailwind.config.js -i ../LiftLog.Ui/Styles/app.css -o ../LiftLog.Ui/wwwroot/app.min.css --minify && \
dotnet publish -c Release && \
aws s3 sync ./bin/Release/net7.0/publish/wwwroot s3://limajuice.liftlog/ --cache-control max-age=2592000 && \
aws s3 cp s3://limajuice.liftlog/index.html s3://limajuice.liftlog/index.html --metadata-directive REPLACE --cache-control max-age=0 --content-type=text/html && \
aws cloudfront create-invalidation --distribution-id E2RTJJGPJ5XUFP  --paths /\*
