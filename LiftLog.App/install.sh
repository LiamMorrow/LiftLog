#! /bin/bash

dotnet build -t:Run -c Release -p:EnableLLVM=false -p:AndroidEnableProfiledAot=true  #-p:AndroidEnableProfiler=true
