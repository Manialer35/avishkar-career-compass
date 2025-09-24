# Production Deployment Steps for Android App

## Fixed Issues Summary

### 1. Firebase Phone Authentication (OTP) ✅
- **Fixed**: Updated Firebase storage bucket URL in `src/firebase.ts`
- **Fixed**: Enabled proper app verification for production builds
- **Fixed**: Updated `google-services.json` with OAuth client configurations

### 2. Razorpay Payments ✅
- **Fixed**: Using live Razorpay key `rzp_live_R8LCnQPRlQpF0s`
- **Fixed**: Production-ready callback URLs (no localhost references)
- **Fixed**: Updated Capacitor config with correct keystore credentials

## Required Actions for Production Build

### Step 1: Generate SHA Fingerprints from Your Release Keystore

Run these commands to get the fingerprints from your signing key:

```bash
# For SHA-1 fingerprint
keytool -list -v -keystore android/app/avishkar-release-key.keystore -alias avishkar -storepass MKhot@123 -keypass MKhot@123

# For SHA-256 fingerprint  
keytool -list -v -keystore android/app/avishkar-release-key.keystore -alias avishkar -storepass MKhot@123 -keypass MKhot@123 | grep SHA256
```

### Step 2: Add SHA Fingerprints to Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/project/avishkarca-86013)
2. Click **Project Settings** → **Your apps** → **Android app**
3. Click **Add fingerprint** and add both SHA-1 and SHA-256 from Step 1
4. **Download the updated `google-services.json`** (already updated in project)

### Step 3: Configure Razorpay Dashboard

Add these authorized domains in your [Razorpay Dashboard](https://dashboard.razorpay.com/):

**Production Domains:**
- `avishkar-career-compass.lovable.app`
- `edaf6c8a-99f4-4154-a62e-5ea9345f08e9.lovableproject.com`
- `id-preview--edaf6c8a-99f4-4154-a62e-5ea9345f08e9.lovable.app`

**Webhook URLs (if using):**
- `https://iflffrqsbsklyhfuskxt.supabase.co/functions/v1/razorpay-webhook`

### Step 4: Firebase Phone Auth Configuration

1. Go to **Firebase Console** → **Authentication** → **Sign-in method**
2. Enable **Phone** authentication
3. Add test phone numbers for QA (optional):
   - Go to **Phone numbers for testing**
   - Add: `+919960085140` → Code: `123456`
   - Add: `+918888769281` → Code: `123456`

### Step 5: Build Production AAB

```bash
# Clean and build release AAB
cd android
./gradlew clean
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### Step 6: Testing Checklist

**OTP Testing:**
- [ ] OTP SMS arrives on real device
- [ ] OTP verification works in production
- [ ] No "INVALID_APP_CREDENTIAL" errors

**Payment Testing:**
- [ ] Razorpay payment gateway opens correctly
- [ ] Payment completion redirects properly
- [ ] No localhost/callback errors
- [ ] Purchase is recorded in database

## Files Modified for Production

1. `src/firebase.ts` - Fixed storage bucket URL and app verification
2. `src/components/GooglePayButton.tsx` - Production Razorpay key and URLs
3. `src/services/PaymentService.ts` - Production Razorpay configuration
4. `android/app/google-services.json` - Updated with OAuth clients
5. `capacitor.config.ts` - Correct keystore credentials

## Important Notes

- **Keystore Security**: The keystore file `avishkar-release-key.keystore` contains your app's signing key
- **API Keys**: Live Razorpay key is now in use: `rzp_live_R8LCnQPRlQpF0s`
- **Domains**: Ensure all production domains are whitelisted in Firebase and Razorpay
- **Testing**: Always test on physical devices before Play Store submission

## Troubleshooting

If OTP still fails:
1. Verify SHA fingerprints match exactly in Firebase
2. Check Firebase phone auth is enabled
3. Ensure no adblocking/firewall issues

If payments fail:
1. Check Razorpay dashboard for unauthorized domain errors
2. Verify webhook URL is accessible
3. Check Supabase edge function logs