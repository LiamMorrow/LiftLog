#! /bin/bash

dotnet build -t:Run -c Release #-p:AndroidEnableProfiler=true
