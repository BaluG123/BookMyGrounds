# Package Name Change Guide

## ✅ What I Changed

**Old Package:** `com.bookmygrounds`  
**New Package:** `in.bookmygrounds.app`

### Files Updated:
1. ✅ `android/app/build.gradle` - Updated namespace and applicationId
2. ✅ `android/app/src/main/java/in/bookmygrounds/app/MainActivity.kt` - Created with new package
3. ✅ `android/app/src/main/java/in/bookmygrounds/app/MainApplication.kt` - Created with new package
4. ✅ Deleted old `com/bookmygrounds` directory
5. ✅ Ran `./gradlew clean` successfully

---

## 🔥 Firebase Configuration Update (REQUIRED)

Since you changed the package name, you MUST update Firebase:

### Step 1: Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your **BookMyGrounds** project
3. Click the **Settings gear icon** → **Project settings**
4. Scroll down to **Your apps** section
5. Find your Android app (currently shows `com.bookmygrounds`)

### Step 2: Add New Android App
You have 2 options:

#### Option A: Add New App (Recommended)
1. Click **"Add app"** → Select **Android**
2. Enter package name: `in.bookmygrounds.app`
3. Enter app nickname: **BookMyGrounds**
4. Enter SHA-1 certificate (get it using command below)
5. Click **"Register app"**
6. Download the new `google-services.json`
7. Replace the old file at `android/app/google-services.json`

#### Option B: Delete Old & Create New
1. Delete the old `com.bookmygrounds` app from Firebase
2. Add new app with `in.bookmygrounds.app`
3. Download `google-services.json`
4. Replace at `android/app/google-services.json`

### Step 3: Get SHA-1 Certificate

**For Debug Build:**
```bash
cd android
./gradlew signingReport
```

Look for **SHA-1** under `Variant: debug` and copy it.

**For Release Build:**
```bash
keytool -list -v -keystore android/app/your-release-key.keystore -alias your-key-alias
```

### Step 4: Update google-services.json
After downloading the new `google-services.json` from Firebase:

```bash
# Replace the old file
cp ~/Downloads/google-services.json android/app/google-services.json
```

### Step 5: Verify the File
Open `android/app/google-services.json` and check:
```json
{
  "project_info": {
    "project_number": "...",
    "project_id": "bookmygrounds-..."
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "...",
        "android_client_info": {
          "package_name": "in.bookmygrounds.app"  // ← Should be new package
        }
      }
    }
  ]
}
```

---

## 🔐 Google Sign-In Update (REQUIRED)

Since you're using Google Sign-In, update it too:

### Step 1: Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your **BookMyGrounds** project
3. Go to **APIs & Services** → **Credentials**

### Step 2: Update OAuth 2.0 Client
1. Find your **Android OAuth 2.0 Client ID**
2. Click **Edit**
3. Update **Package name** to: `in.bookmygrounds.app`
4. Update **SHA-1 certificate fingerprint** (if needed)
5. Click **Save**

### Step 3: Get SHA-1 for Google Sign-In
```bash
cd android
./gradlew signingReport
```

Copy the SHA-1 and add it to Google Cloud Console.

---

## 📱 Razorpay Update (If Applicable)

If you're using Razorpay:

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Navigate to **Settings** → **API Keys**
3. Update your app's package name to `in.bookmygrounds.app`

---

## 🧪 Testing Steps

After updating everything:

### 1. Clean Build
```bash
cd android
./gradlew clean
cd ..
```

### 2. Rebuild App
```bash
npm run android
```

### 3. Test Features
- [ ] App launches successfully
- [ ] Google Sign-In works
- [ ] Firebase notifications work
- [ ] Razorpay payments work
- [ ] All features working normally

---

## 🚨 Common Issues & Fixes

### Issue 1: "google-services.json not found"
**Fix:** Make sure you downloaded and placed the new `google-services.json` in `android/app/`

### Issue 2: "Google Sign-In failed"
**Fix:** 
1. Check SHA-1 is correct in Google Cloud Console
2. Make sure package name matches in OAuth client
3. Re-download `google-services.json` from Firebase

### Issue 3: "App crashes on launch"
**Fix:**
1. Run `./gradlew clean` in android folder
2. Delete `android/app/build` folder
3. Rebuild: `npm run android`

### Issue 4: "Firebase not initialized"
**Fix:**
1. Verify `google-services.json` has correct package name
2. Check Firebase console shows the new app
3. Rebuild the app

---

## 📋 Checklist

Before submitting to Play Store:

- [ ] Package name changed to `in.bookmygrounds.app`
- [ ] Firebase updated with new package
- [ ] New `google-services.json` downloaded and placed
- [ ] Google Sign-In OAuth updated
- [ ] SHA-1 certificates added to Firebase & Google Cloud
- [ ] Razorpay updated (if applicable)
- [ ] App tested and all features working
- [ ] Clean build successful
- [ ] Release APK/AAB generated with new package

---

## 🎯 Quick Commands

```bash
# Clean build
cd android && ./gradlew clean && cd ..

# Get SHA-1 for debug
cd android && ./gradlew signingReport

# Build release APK
cd android && ./gradlew assembleRelease

# Build release AAB (for Play Store)
cd android && ./gradlew bundleRelease

# Run on device
npm run android
```

---

## ✅ Summary

**What Changed:**
- Package name: `com.bookmygrounds` → `in.bookmygrounds.app`
- Java package structure moved
- Build configuration updated

**What You Need to Do:**
1. Update Firebase (add new app or update existing)
2. Download new `google-services.json`
3. Update Google Sign-In OAuth client
4. Add SHA-1 certificates
5. Test the app thoroughly

**Why This Won't Break Things:**
- It's just a package rename
- Firebase will work once you update the config
- Google Sign-In will work once OAuth is updated
- All your backend APIs remain the same
- User data is not affected

---

## 🆘 Need Help?

If you face any issues:
1. Check the error logs: `npx react-native log-android`
2. Verify `google-services.json` package name
3. Ensure SHA-1 is correct
4. Try clean build: `./gradlew clean`

The package name change is complete! Just update Firebase and you're good to go! 🚀
