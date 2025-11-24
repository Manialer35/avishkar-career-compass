# Android Authentication Setup Checklist

## Issues Fixed:

### 1. ✅ Added Firebase Authentication Plugin Configuration
- Added `FirebaseAuthentication` plugin config to `capacitor.config.ts`
- Configured to use Google authentication provider
- Set `skipNativeAuth: false` to use native Android auth flow

### 2. ✅ Enhanced Google Sign-In Configuration
- Added proper scopes (`email`, `profile`) to the native sign-in call
- This ensures the Android OAuth flow requests the correct permissions

### 3. ✅ Verified Google Services Configuration
- `google-services.json` is properly placed in both locations:
  - `android/google-services.json`
  - `android/app/google-services.json`

### 4. ✅ Firebase Dependencies Configured
- Firebase BOM 33.4.0 for version management
- Firebase Auth KTX
- Google Play Services Auth 21.2.0
- All properly linked in both `app/build.gradle` and `capacitor.build.gradle`

### 5. ✅ Capacitor Plugin Registration
- `@capacitor-firebase/app` properly registered
- `@capacitor-firebase/authentication` properly registered
- Both plugins included in `capacitor.settings.gradle`

## Critical Verification Steps for Firebase Console:

### **IMPORTANT: You MUST verify these in Firebase Console**

1. **Go to Firebase Console** → Your Project → Authentication → Sign-in method → Google
   - Ensure Google sign-in is **ENABLED**
   
2. **Add SHA-1 Fingerprint** (CRITICAL for Android)
   - Go to Project Settings → Your Apps → Android app
   - Click "Add fingerprint"
   - Add your **Release SHA-1** certificate fingerprint
   
   **To get your SHA-1 fingerprint:**
   ```bash
   cd android
   keytool -list -v -keystore app/avishkar-release-key.keystore -alias avishkar -storepass MKhot@123 -keypass MKhot@123
   ```
   
   Copy the SHA-1 fingerprint and paste it into Firebase Console.

3. **Verify OAuth Client IDs**
   - In Firebase Console, ensure you have an OAuth 2.0 Client ID for Android
   - The package name should be: `app.lovable.edaf6c8a99f44154a62e5ea9345f08e9`
   - The SHA-1 fingerprint must match your release keystore

4. **Download Updated google-services.json**
   - After adding SHA-1, download the **NEW** `google-services.json`
   - Replace both files with the new version:
     - `android/google-services.json`
     - `android/app/google-services.json`

## Build Commands:

After making all the above changes, rebuild:

```bash
cd android
./gradlew clean
./gradlew bundleRelease
```

## Common Issues & Solutions:

### Issue: "UNIMPLEMENTED: 'FirebaseAuthentication' plugin is not implemented"
**Solution:** This is now fixed by:
- Adding plugin configuration to `capacitor.config.ts`
- Ensuring Firebase dependencies are in both build files
- Verifying SHA-1 fingerprint in Firebase Console

### Issue: Authentication works on web but not Android
**Solution:** 
- Verify SHA-1 certificate is added to Firebase Console
- Download and use the UPDATED `google-services.json` after adding SHA-1
- Ensure OAuth Client ID for Android exists in Firebase Console

### Issue: Sign-in popup doesn't appear on Android
**Solution:**
- Check that Google Play Services is installed on the device/emulator
- Verify the device has internet connection
- Check Firebase Console has the correct package name

## Testing Checklist:

- [ ] Clean build completed without errors
- [ ] App installs successfully
- [ ] Google Sign-In button appears
- [ ] Clicking button shows Google account picker
- [ ] Selecting account completes authentication
- [ ] User is redirected to home page
- [ ] User data is correctly stored in Supabase

## Next Steps:

1. **Get SHA-1 fingerprint from your release keystore** (command above)
2. **Add SHA-1 to Firebase Console**
3. **Download NEW google-services.json**
4. **Replace the two google-services.json files**
5. **Clean and rebuild**: `./gradlew clean bundleRelease`
6. **Test on a real device or emulator**

If authentication still fails after these steps, check the Android Logcat for detailed error messages:
```bash
adb logcat | grep -i firebase
```
