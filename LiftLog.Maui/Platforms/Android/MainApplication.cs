﻿using Android;
using Android.App;
using Android.Runtime;

[assembly: UsesPermission(Manifest.Permission.WakeLock)]
[assembly: UsesPermission(Manifest.Permission.ReceiveBootCompleted)]
[assembly: UsesPermission(Manifest.Permission.Vibrate)]

[assembly: UsesPermission(Manifest.Permission.ScheduleExactAlarm)]
[assembly: UsesPermission(Manifest.Permission.PostNotifications)]

namespace LiftLog.Maui;

[Application]
public class MainApplication(IntPtr handle, JniHandleOwnership ownership)
    : MauiApplication(handle, ownership)
{
    protected override MauiApp CreateMauiApp() => MauiProgram.CreateMauiApp();
}
