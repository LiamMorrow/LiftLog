#! /bin/bash

cd ../LiftLog.Ui
yarn build
cd ../LiftLog.App

# If -r we want release build
if [ "$1" == "-r" ]; then
    echo "Release build"
dotnet build -t:Run -c Release -p:EnableLLVM=false -p:AndroidEnableProfiledAot=true -p:ExtraDefineConstants=TEST_MODE #-p:AndroidEnableProfiler=true
    exit 0
fi

dotnet build -t:Run -c Debug -p:ExtraDefineConstants=TEST_MODE #-p:AndroidEnableProfiler=true
