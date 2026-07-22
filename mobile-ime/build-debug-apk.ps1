Set-Location -Path $PSScriptRoot
Set-Location -Path './example'
flutter pub get
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
flutter build apk --debug
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Output 'Debug APK generated at example/build/app/outputs/flutter-apk/app-debug.apk'