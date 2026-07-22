# MayekEngine Mobile IME

This directory contains a lightweight mobile keyboard IME service module for the MayekEngine project.

## Structure

- `pubspec.yaml` - Flutter plugin package configuration.
- `lib/main.dart` - Flutter entrypoint for local UI preview and testing.
- `lib/keyboard_ime.dart` - Custom QWERTY soft keyboard UI with a top suggestion bar and text insertion handlers.
- `android/src/main/kotlin/com/mayekengine/ime/MayekEngineImePlugin.kt` - Flutter plugin bridge for native method channel communication.
- `android/src/main/kotlin/com/mayekengine/ime/MayekEngineImeService.kt` - Android `InputMethodService` implementation with a custom soft keyboard and commit text handling.
- `android/src/main/AndroidManifest.xml` - Service registration for the IME.
- `android/src/main/res/xml/method.xml` - IME metadata for Android input method registration.
- `android/src/main/res/values/strings.xml` - Module string resources.

## Goals

- Provide a custom QWERTY soft keyboard.
- Show prediction suggestions in a top bar.
- Handle text insertion and deletion from the keyboard service.
- Bridge Flutter UI and Android IME service through a method channel.

## Notes

This module is a starting point for Stage 3 and is intended to be expanded into a full Flutter keyboard plugin or Android IME implementation.

## Debug APK build

A working preview app is available in `example/` to build and test the custom keyboard service on Android.

1. Open a terminal in `mobile-ime/example`.
2. Run `flutter pub get`.
3. Run `flutter build apk --debug`.
4. The generated APK is located at `mobile-ime/example/build/app/outputs/flutter-apk/app-debug.apk`.

Alternatively, on Windows you can run the helper script from `mobile-ime`:

- `build-debug-apk.bat`
- `build-debug-apk.ps1`

Once the APK is built, install it on a device or emulator using `adb install -r example/build/app/outputs/flutter-apk/app-debug.apk`.
