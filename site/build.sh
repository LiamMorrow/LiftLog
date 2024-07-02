#! /bin/bash

# copy all files from site/src to site/build
rm -rf build
mkdir -p build
cp -r ./*.html build/
cp -r ./css build/
cp -r ./assets build/
cp -r ./js build/
