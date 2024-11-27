#! /bin/bash

cd ../LiftLog.Ui
npm run build
cd ../LiftLog.Maui

# If -r we want release build
if [ "$1" == "-r" ]; then
    echo "Release build"
dotnet build -t:Run -c Release -f net9.0-android -p:TargetFramework=net9.0-android -p:EnableLLVM=false -p:AndroidEnableProfiledAot=true -p:ExtraDefineConstants=TEST_MODE #-p:AndroidEnableProfiler=true
    exit 0
fi

if [ "$1" == "-c" ]; then
    dotnet clean
    dotnet clean -f net9.0-android
fi

dotnet build -t:Run -c Debug -f net9.0-android -p:TargetFramework=net9.0-android -p:BuildFor=android -p:ExtraDefineConstants=TEST_MODE #-p:AndroidEnableProfiler=true
