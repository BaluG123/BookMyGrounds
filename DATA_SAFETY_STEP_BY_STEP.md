# 📱 Data Safety Section - Step-by-Step Walkthrough
## BookMyGrounds App - Play Console Guide

---

## 🎯 HOW TO USE THIS GUIDE

1. Open Google Play Console
2. Go to your app → **Policy** → **App content** → **Data safety**
3. Follow each step below **EXACTLY**
4. Copy-paste the explanations provided

---

## STEP 1: Initial Questions

### ❓ Does your app collect or share any of the required user data types?

**Select:** ✅ **YES**

Click **Next**

---

### ❓ Is all of the user data collected by your app encrypted in transit?

**Select:** ✅ **YES**

**Explanation to add:**
```
All data transmitted between the app and our servers is encrypted using HTTPS/SSL. We use Firebase (Google), Razorpay payment gateway, and secure API connections.
```

Click **Next**

---

### ❓ Do you provide a way for users to request that their data is deleted?

**Select:** ✅ **YES**

**Explanation to add:**
```
Users can request account and data deletion by emailing support@bookmygrounds.in. We will delete all personal data within 30 days of the request, except data required for legal compliance.
```

Click **Next**

---

## STEP 2: Data Types Collection

You'll now see a list of data categories. Here's what to select:

---

### 📂 LOCATION

Click **Location** → Select the following:

#### ✅ Approximate location
- **Collected:** YES
- **Shared with third parties:** NO
- **Ephemeral:** NO
- **Required or Optional:** **OPTIONAL**
- **Purpose:** Select:
  - ✅ App functionality
  - ✅ Personalization

**User-facing explanation:**
```
Used to show nearby sports grounds based on your location. You can deny location permission, but you'll need to search manually.
```

#### ✅ Precise location
- **Collected:** YES
- **Shared with third parties:** NO
- **Ephemeral:** NO
- **Required or Optional:** **OPTIONAL**
- **Purpose:** Select:
  - ✅ App functionality
  - ✅ Personalization

**User-facing explanation:**
```
Used to show your exact location on the map and provide navigation to sports grounds. Location permission is optional.
```

Click **Next**

---

### 📂 PERSONAL INFO

Click **Personal info** → Select the following:

#### ✅ Name
- **Collected:** YES
- **Shared with third parties:** YES
- **Ephemeral:** NO
- **Required or Optional:** **REQUIRED**
- **Purpose:** Select:
  - ✅ App functionality
  - ✅ Account management
  - ✅ Personalization

**User-facing explanation:**
```
Your name is required for account creation and is shared with ground owners when you make a booking so they can identify you.
```

#### ✅ Email address
- **Collected:** YES
- **Shared with third parties:** NO
- **Ephemeral:** NO
- **Required or Optional:** **REQUIRED**
- **Purpose:** Select:
  - ✅ App functionality
  - ✅ Account management
  - ✅ Fraud prevention, security, and compliance

**User-facing explanation:**
```
Email is required for account login, booking confirmations, and password recovery. We do not share your email with third parties.
```

#### ✅ Phone number
- **Collected:** YES
- **Shared with third parties:** YES
- **Ephemeral:** NO
- **Required or Optional:** **REQUIRED**
- **Purpose:** Select:
  - ✅ App functionality
  - ✅ Account management
  - ✅ Fraud prevention, security, and compliance

**User-facing explanation:**
```
Phone number is required for account verification and is shared with ground owners when you make a booking for communication purposes.
```

#### ✅ User IDs
- **Collected:** YES
- **Shared with third parties:** NO
- **Ephemeral:** NO
- **Required or Optional:** **REQUIRED**
- **Purpose:** Select:
  - ✅ App functionality
  - ✅ Account management
  - ✅ Analytics

**User-facing explanation:**
```
User IDs are used internally to manage your account, bookings, and app analytics. They are not shared with third parties.
```

Click **Next**

---

### 📂 FINANCIAL INFO

Click **Financial info** → Select the following:

#### ✅ Payment info
- **Collected:** YES
- **Shared with third parties:** YES
- **Ephemeral:** NO
- **Required or Optional:** **REQUIRED**
- **Purpose:** Select:
  - ✅ App functionality
  - ✅ Fraud prevention, security, and compliance

**User-facing explanation:**
```
Payment information is collected and securely processed by our payment partner Razorpay. We do not store credit card details on our servers. Payment info is required to complete bookings.
```

Click **Next**

---

### 📂 PHOTOS AND VIDEOS

Click **Photos and videos** → Select the following:

#### ✅ Photos
- **Collected:** YES
- **Shared with third parties:** YES
- **Ephemeral:** NO
- **Required or Optional:** **OPTIONAL**
- **Purpose:** Select:
  - ✅ App functionality

**User-facing explanation:**
```
Only ground owners can upload photos of their sports grounds. These photos are displayed publicly in the app to help users choose grounds. Regular users do not need to provide photos.
```

Click **Next**

---

### 📂 APP ACTIVITY

Click **App activity** → Select the following:

#### ✅ App interactions
- **Collected:** YES
- **Shared with third parties:** NO
- **Ephemeral:** NO
- **Required or Optional:** **REQUIRED**
- **Purpose:** Select:
  - ✅ Analytics
  - ✅ App functionality

**User-facing explanation:**
```
We collect data about how you use the app (screens visited, features used) to improve the app experience and fix issues.
```

Click **Next**

---

### 📂 APP INFO AND PERFORMANCE

Click **App info and performance** → Select the following:

#### ✅ Crash logs
- **Collected:** YES
- **Shared with third parties:** NO
- **Ephemeral:** NO
- **Required or Optional:** **REQUIRED**
- **Purpose:** Select:
  - ✅ Analytics
  - ✅ App functionality

**User-facing explanation:**
```
We collect crash reports automatically to identify and fix bugs, ensuring a stable app experience.
```

#### ✅ Diagnostics
- **Collected:** YES
- **Shared with third parties:** NO
- **Ephemeral:** NO
- **Required or Optional:** **REQUIRED**
- **Purpose:** Select:
  - ✅ Analytics
  - ✅ App functionality

**User-facing explanation:**
```
We collect diagnostic data to monitor app performance, identify issues, and improve stability.
```

Click **Next**

---

### 📂 DEVICE OR OTHER IDs

Click **Device or other IDs** → Select the following:

#### ✅ Device or other IDs
- **Collected:** YES
- **Shared with third parties:** NO
- **Ephemeral:** NO
- **Required or Optional:** **REQUIRED**
- **Purpose:** Select:
  - ✅ App functionality
  - ✅ Analytics
  - ✅ Fraud prevention, security, and compliance

**User-facing explanation:**
```
We collect device identifiers for user authentication, push notifications about bookings, fraud prevention, and analytics.
```

Click **Next**

---

## STEP 3: Data Sharing with Third Parties

### ❓ Do you share data with third parties?

**Select:** ✅ **YES**

Now you need to declare each third party:

---

### 🏢 THIRD PARTY 1: Ground Owners

**Third party name:** Ground Owners (Sports Ground Operators)

**Data types shared:**
- ✅ Name
- ✅ Phone number

**Purpose:**
```
When users book a sports ground, we share their name and phone number with the ground owner to facilitate the booking and enable communication.
```

**Is this third party's handling of data covered by your app's privacy policy?**
- ✅ YES

---

### 🏢 THIRD PARTY 2: Razorpay

**Third party name:** Razorpay (Payment Processor)

**Data types shared:**
- ✅ Name
- ✅ Email address
- ✅ Phone number
- ✅ Payment info

**Purpose:**
```
Razorpay is our payment processing partner. They securely handle payment transactions for ground bookings. All payment data is encrypted and processed according to PCI DSS standards.
```

**Is this third party's handling of data covered by your app's privacy policy?**
- ✅ YES

---

### 🏢 THIRD PARTY 3: Firebase (Google)

**Third party name:** Firebase by Google

**Data types shared:**
- ✅ User IDs
- ✅ Device or other IDs
- ✅ App interactions
- ✅ Crash logs
- ✅ Diagnostics

**Purpose:**
```
Firebase provides authentication, analytics, crash reporting, and push notifications. Data is used to improve app performance and user experience.
```

**Is this third party's handling of data covered by your app's privacy policy?**
- ✅ YES

---

### 🏢 THIRD PARTY 4: Google Sign-In

**Third party name:** Google Sign-In

**Data types shared:**
- ✅ Name
- ✅ Email address

**Purpose:**
```
Google Sign-In allows users to authenticate using their Google account. We receive basic profile information (name, email) from Google when users choose this login method.
```

**Is this third party's handling of data covered by your app's privacy policy?**
- ✅ YES

---

### 🏢 THIRD PARTY 5: Google Maps

**Third party name:** Google Maps Platform

**Data types shared:**
- ✅ Approximate location
- ✅ Precise location

**Purpose:**
```
Google Maps is used to display ground locations, show nearby grounds, and provide navigation. Location data is processed by Google Maps according to their privacy policy.
```

**Is this third party's handling of data covered by your app's privacy policy?**
- ✅ YES

---

## STEP 4: Privacy Policy

### ❓ Privacy policy URL

**Enter:**
```
https://sites.google.com/view/bookmygrounds-privacy
```

(Or wherever you upload your privacy-policy.html)

**IMPORTANT:** Make sure this URL is:
- ✅ Live and accessible
- ✅ Uses HTTPS
- ✅ Loads correctly on mobile
- ✅ Matches your Data Safety declarations

---

## STEP 5: Review and Submit

### Final Review Checklist

Before clicking **Save** and **Submit for review**:

- [ ] All data types accurately declared
- [ ] All third parties listed (5 total)
- [ ] Privacy policy URL is working
- [ ] All explanations are clear and honest
- [ ] Optional vs Required correctly marked
- [ ] Data encryption confirmed
- [ ] Data deletion process explained
- [ ] Support email (support@bookmygrounds.in) is active

---

## 🎯 QUICK SUMMARY

### Data You Collect:
1. ✅ Name (Required)
2. ✅ Email (Required)
3. ✅ Phone (Required)
4. ✅ User IDs (Required)
5. ✅ Payment Info (Required)
6. ✅ Approximate Location (Optional)
7. ✅ Precise Location (Optional)
8. ✅ Photos (Optional - owners only)
9. ✅ App Interactions (Required)
10. ✅ Crash Logs (Required)
11. ✅ Diagnostics (Required)
12. ✅ Device IDs (Required)

### Third Parties You Share With:
1. Ground Owners (Name, Phone)
2. Razorpay (Name, Email, Phone, Payment)
3. Firebase (User IDs, Device IDs, Analytics)
4. Google Sign-In (Name, Email)
5. Google Maps (Location)

### Security Practices:
- ✅ Data encrypted in transit (HTTPS/SSL)
- ✅ Users can request data deletion (support@bookmygrounds.in)

---

## 🚨 COMMON ERRORS TO AVOID

1. **❌ Forgetting to mark Location as OPTIONAL**
   - Location should be optional, not required

2. **❌ Not declaring Razorpay as third party**
   - You MUST declare payment processor

3. **❌ Saying "No data shared" when you share with ground owners**
   - Be honest about data sharing

4. **❌ Privacy policy URL not working**
   - Test it before submitting!

5. **❌ Marking everything as "Required"**
   - Only mark truly required data

6. **❌ Not mentioning data deletion**
   - Users have the right to delete their data

---

## 📧 AFTER SUBMISSION

### If Google Asks for Clarification:

1. **Read their message carefully** - They'll tell you exactly what's wrong
2. **Don't panic** - It's normal to get questions
3. **Be honest** - Provide accurate information
4. **Respond quickly** - Within 7 days
5. **Update if needed** - Fix any inconsistencies

### Common Questions from Google:

**Q: "How do you use location data?"**
**A:** "We use location to show nearby sports grounds and provide navigation. Users can deny location permission and search manually instead."

**Q: "Who do you share payment data with?"**
**A:** "Payment data is shared only with Razorpay, our PCI DSS compliant payment processor. We do not store credit card details."

**Q: "How can users delete their data?"**
**A:** "Users can email support@bookmygrounds.in to request account deletion. We delete all personal data within 30 days."

---

## ✅ YOU'RE DONE!

Once you complete all steps:
1. Click **Save**
2. Review everything one more time
3. Click **Submit for review**
4. Wait 3-7 days for Google's review

**Your Data Safety section is now complete! 🎉**

---

## 📞 NEED HELP?

If you get stuck:
1. Re-read the section you're stuck on
2. Check the PLAY_STORE_DATA_SAFETY_GUIDE.md for detailed explanations
3. Make sure privacy policy URL is working
4. Ensure support@bookmygrounds.in is active

**Remember:** Honesty is key. It's better to declare data collection than to hide it and risk app removal.

---

## 🔄 UPDATING LATER

If you add new features that collect data:
1. Update your privacy policy first
2. Update Data Safety section in Play Console
3. Submit update for review
4. Wait for approval before releasing new version

**Good luck with your app launch! 🚀**
