# Firebase SHA Certificate Setup for in.bookmygrounds.app

## 🔑 Your SHA Certificates (Same as Before)

These SHA fingerprints are from your keystore and **DO NOT CHANGE** when you change package name.

### SHA-1 Certificates to Add:

1. **Debug SHA-1:**
   ```
   5e:8f:16:06:2e:a3:cd:2c:4a:0d:54:78:76:ba:a6:f3:8c:ab:f6:25
   ```

2. **Release SHA-1 (Primary):**
   ```
   fc:a9:f9:2d:8b:20:c4:10:60:10:68:c1:f4:d3:70:38:62:bb:ba:aa
   ```

3. **Release SHA-1 (Secondary):**
   ```
   a3:c2:ff:95:82:4c:2b:43:73:84:e5:a7:cf:6d:45:33:2c:98:93:03
   ```

### SHA-256 Certificate to Add:

```
43:5b:c9:cf:9d:3f:9b:a9:7e:3c:43:75:4a:b0:d0:42:b4:97:47:67:c5:48:5e:cd:57:db:ee:e4:c5:fa:42:0f
```

---

## 📱 Step-by-Step: Add to Firebase

### Step 1: Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your **BookMyGrounds** project
3. Click **Settings (gear icon)** → **Project settings**

### Step 2: Add New Android App
1. Scroll to **Your apps** section
2. Click **"Add app"** button
3. Select **Android** icon
4. Enter details:
   - **Android package name:** `in.bookmygrounds.app`
   - **App nickname:** BookMyGrounds (or leave blank)
   - **Debug signing certificate SHA-1:** `5e:8f:16:06:2e:a3:cd:2c:4a:0d:54:78:76:ba:a6:f3:8c:ab:f6:25`
5. Click **"Register app"**

### Step 3: Add All SHA Certificates
After registering the app:

1. In Firebase Console, find your new app `in.bookmygrounds.app`
2. Click on it to expand
3. Scroll down to **SHA certificate fingerprints**
4. Click **"Add fingerprint"**
5. Add each SHA one by one:

   **Add SHA-1 #1 (Debug):**
   ```
   5e:8f:16:06:2e:a3:cd:2c:4a:0d:54:78:76:ba:a6:f3:8c:ab:f6:25
   ```

   **Add SHA-1 #2 (Release Primary):**
   ```
   fc:a9:f9:2d:8b:20:c4:10:60:10:68:c1:f4:d3:70:38:62:bb:ba:aa
   ```

   **Add SHA-1 #3 (Release Secondary):**
   ```
   a3:c2:ff:95:82:4c:2b:43:73:84:e5:a7:cf:6d:45:33:2c:98:93:03
   ```

   **Add SHA-256 (Release):**
   ```
   43:5b:c9:cf:9d:3f:9b:a9:7e:3c:43:75:4a:b0:d0:42:b4:97:47:67:c5:48:5e:cd:57:db:ee:e4:c5:fa:42:0f
   ```

### Step 4: Download google-services.json
1. After adding all SHA certificates
2. Click **"Download google-services.json"**
3. Replace the file at: `android/app/google-services.json`

---

## 🔐 Google Cloud Console (For Google Sign-In)

### Step 1: Go to Google Cloud Console
1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Select your **BookMyGrounds** project
3. Go to **APIs & Services** → **Credentials**

### Step 2: Create New OAuth 2.0 Client ID
1. Click **"+ CREATE CREDENTIALS"**
2. Select **"OAuth 2.0 Client ID"**
3. Choose **Application type:** Android
4. Enter details:
   - **Name:** BookMyGrounds Android (New Package)
   - **Package name:** `in.bookmygrounds.app`
   - **SHA-1 certificate fingerprint:** `fc:a9:f9:2d:8b:20:c4:10:60:10:68:c1:f4:d3:70:38:62:bb:ba:aa`
5. Click **"CREATE"**

### Step 3: Add Additional SHA-1 (Optional but Recommended)
1. Click on the newly created OAuth client
2. Click **"Add fingerprint"**
3. Add the debug SHA-1: `5e:8f:16:06:2e:a3:cd:2c:4a:0d:54:78:76:ba:a6:f3:8c:ab:f6:25`
4. Add the secondary release SHA-1: `a3:c2:ff:95:82:4c:2b:43:73:84:e5:a7:cf:6d:45:33:2c:98:93:03`

---

## 📋 Quick Copy-Paste List

For easy copying when adding to Firebase/Google:

```
Package Name:
in.bookmygrounds.app

SHA-1 Debug:
5e:8f:16:06:2e:a3:cd:2c:4a:0d:54:78:76:ba:a6:f3:8c:ab:f6:25

SHA-1 Release (Primary):
fc:a9:f9:2d:8b:20:c4:10:60:10:68:c1:f4:d3:70:38:62:bb:ba:aa

SHA-1 Release (Secondary):
a3:c2:ff:95:82:4c:2b:43:73:84:e5:a7:cf:6d:45:33:2c:98:93:03

SHA-256 Release:
43:5b:c9:cf:9d:3f:9b:a9:7e:3c:43:75:4a:b0:d0:42:b4:97:47:67:c5:48:5e:cd:57:db:ee:e4:c5:fa:42:0f
```

---

## ✅ Verification Checklist

After adding everything:

### Firebase Console:
- [ ] New app `in.bookmygrounds.app` created
- [ ] 3 SHA-1 certificates added
- [ ] 1 SHA-256 certificate added
- [ ] `google-services.json` downloaded
- [ ] File placed at `android/app/google-services.json`

### Google Cloud Console:
- [ ] New OAuth 2.0 Client ID created
- [ ] Package name: `in.bookmygrounds.app`
- [ ] Primary SHA-1 added
- [ ] Debug SHA-1 added (optional)
- [ ] Secondary SHA-1 added (optional)

### Verify google-services.json:
Open `android/app/google-services.json` and check:
```json
{
  "client": [
    {
      "client_info": {
        "android_client_info": {
          "package_name": "in.bookmygrounds.app"  // ← Must match
        }
      }
    }
  ]
}
```

---

## 🧪 Test After Setup

### 1. Clean Build
```bash
cd android
./gradlew clean
cd ..
```

### 2. Run Debug Build
```bash
npm run android
```

### 3. Test Features
- [ ] App launches
- [ ] Google Sign-In works
- [ ] Firebase notifications work
- [ ] No crashes

### 4. Build Release APK
```bash
cd android
./gradlew assembleRelease
```

### 5. Test Release Build
Install the release APK and test:
- [ ] Google Sign-In works in release
- [ ] Firebase works in release
- [ ] All features working

---

## 🚨 Common Issues

### Issue: "Google Sign-In failed (error 10)"
**Cause:** SHA-1 not added or incorrect package name

**Fix:**
1. Double-check SHA-1 in Google Cloud Console
2. Verify package name is exactly: `in.bookmygrounds.app`
3. Wait 5-10 minutes for changes to propagate
4. Clear app data and try again

### Issue: "Firebase not initialized"
**Cause:** Wrong `google-services.json` or package mismatch

**Fix:**
1. Open `google-services.json`
2. Verify `package_name` is `in.bookmygrounds.app`
3. Re-download from Firebase if needed
4. Clean build and reinstall

### Issue: "SHA-1 mismatch"
**Cause:** Using different keystore or wrong SHA

**Fix:**
1. Get SHA-1 from your actual keystore:
   ```bash
   keytool -list -v -keystore android/app/bookmygrounds-upload-key.keystore -alias bookmygroundsupload
   ```
2. Compare with what you added to Firebase/Google
3. Update if different

---

## 💡 Pro Tips

1. **Add all SHA certificates** - Don't skip any, add all 4
2. **Wait 5-10 minutes** after adding SHA certificates for changes to take effect
3. **Test debug build first** before release
4. **Keep old app** (`com.bookmygrounds`) in Firebase for reference
5. **Don't delete old OAuth client** in Google Cloud Console yet

---

## 📞 Support

If you face issues:
1. Check Firebase Console shows all 4 SHA certificates
2. Verify `google-services.json` has correct package name
3. Check Google Cloud OAuth client has correct SHA-1
4. Try clean build: `cd android && ./gradlew clean`
5. Clear app data and reinstall

---

## ✅ Summary

**What to Add:**
- Same 4 SHA certificates (3 SHA-1 + 1 SHA-256)
- New package name: `in.bookmygrounds.app`
- New OAuth client in Google Cloud

**Why Same SHA?**
- SHA comes from your keystore
- Keystore didn't change
- Only package name changed

**Result:**
- Firebase will work with new package
- Google Sign-In will work
- All features will work as before

You're all set! Just add these SHA certificates to Firebase and Google Cloud Console! 🚀
