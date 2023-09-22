#! /bin/bash

cd ../LiftLog.Ui
yarn build
cd ../LiftLog.App

# If -r we want release build
if [ "$1" == "-r" ]; then
    echo "Release build"
dotnet build -t:Run -f net7.0-ios -c Release -p:EnableLLVM=false -p:AndroidEnableProfiledAot=true -p:ExtraDefineConstants=TEST_MODE #-p:AndroidEnableProfiler=true
    exit 0
fi

dotnet build -t:Run -f net7.0-ios -c Debug -p:ExtraDefineConstants=TEST_MODE  -p:_DeviceName=:v2:udid=F44DCFB6-9D5B-442A-8474-700574270FF7 #-p:AndroidEnableProfiler=true
