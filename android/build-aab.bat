
@echo off
echo Building Android App Bundle...

echo Cleaning previous builds...
call gradlew.bat clean

echo Building release AAB...
call gradlew.bat bundleRelease

echo Build complete! AAB file location:
echo android\app\build\outputs\bundle\release\app-release.aab

echo Building universal APK for testing...
call gradlew.bat assembleRelease

echo APK file location:
echo android\app\build\outputs\apk\release\app-release.apk

pause
