#! /bin/bash

dotnet build -t:Run -c Release -p:EnableLLVM=false -p:AndroidEnableProfiledAot=true -p:ExtraDefineConstants=TEST_MODE #-p:AndroidEnableProfiler=true
