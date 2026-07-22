@echo off
cd /d "%~dp0example"
flutter pub get
if errorlevel 1 exit /b %errorlevel%
flutter build apk --debug
if errorlevel 1 exit /b %errorlevel%
echo Debug APK generated at example\build\app\outputs\flutter-apk\app-debug.apk
