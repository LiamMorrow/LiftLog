#! /bin/bash
trap 'kill $(jobs -pr)' SIGINT SIGTERM EXIT
dotnet build -p:TailwindBuild=false

dotnet watch &
npm run watch
