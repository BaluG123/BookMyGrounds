# Play Store Release Checklist

## Build and config

- Confirm `android/app/build.gradle` version code and version name are bumped for the release.
- Build a signed Android App Bundle with the release keystore and verify install on a physical Android device.
- Confirm `google-services.json`, Razorpay keys, API base URL, and Firebase auth config point to production services.
- Verify crash reporting, push notifications, Google Sign-In, Razorpay checkout, and deep links on the release build.
- Recheck runtime permissions, privacy policy URL, support email, and account deletion/support flows.

## Product QA

- Customer flow: register, login, discover grounds, reserve slot, apply promo/referral code, complete payment, cancel booking, submit review.
- Owner flow: login, view dashboard revenue/conversion panel, confirm booking, mark completed, manage slots, update payout profile.
- Verify empty states, loading states, offline errors, and payment failure recovery on onboarding, home, slot selection, and booking detail screens.
- Validate promo code rejection, referral self-use rejection, minimum booking amount enforcement, and discounted payment totals.

## Store listing

- Finalize app name, short description, full description, release notes, category, contact details, and privacy policy URL.
- Upload icon, feature graphic, phone screenshots, and optional 7-inch/10-inch tablet screenshots if available.
- Confirm Data safety, App access, Ads, Content rating, target audience, and Financial features declarations are accurate.

## Release gating

- Run final smoke test on the exact signed AAB.
- Tag the release commit and archive the exact metadata, screenshots, and generated AAB used for submission.
- Stage rollout first, monitor crashes/payments/auth for 24 hours, then expand rollout.
