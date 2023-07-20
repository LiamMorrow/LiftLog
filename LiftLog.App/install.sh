#! /bin/bash

dotnet build -c Debug -f net7.0-android && \
adb install -r  bin/Debug/net7.0-android/com.limajuice.liftlog-Signed.apk && \
adb shell monkey -p com.limajuice.liftlog -c android.intent.category.LAUNCHER 1
