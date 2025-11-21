
#!/bin/bash

# Build script for Android App Bundle
echo "Building Android App Bundle..."

# Clean previous builds
echo "Cleaning previous builds..."
./gradlew clean

# Build release AAB
echo "Building release AAB..."
./gradlew bundleRelease

echo "Build complete! AAB file location:"
echo "android/app/build/outputs/bundle/release/app-release.aab"

# Optional: Build universal APK for testing
echo "Building universal APK for testing..."
./gradlew assembleRelease

echo "APK file location:"
echo "android/app/build/outputs/apk/release/app-release.apk"
