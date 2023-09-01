#! /bin/bash

cd ../LiftLog.Ui
yarn build
cd ../LiftLog.App

dotnet build -t:Run -c Release -p:EnableLLVM=false -p:AndroidEnableProfiledAot=true -p:ExtraDefineConstants=TEST_MODE #-p:AndroidEnableProfiler=true
