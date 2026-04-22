import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Image, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { authAPI } from '../../api/auth';
import { setCredentials } from '../../store/slices/authSlice';
import { theme } from '../../utils/theme';
import { getErrorMessage } from '../../utils/error';

GoogleSignin.configure({
  webClientId: '614899789202-l1ujssb8k8odq4tge5273v6k45j8usfj.apps.googleusercontent.com',
});

const APP_LOGO = require('../../assets/branding/bookmygrounds-logo-1024.png');

function getGoogleSignInErrorMessage(error: any) {
  const code = error?.code;
  const message = typeof error?.message === 'string' ? error.message : '';

  if (code === statusCodes.SIGN_IN_CANCELLED) {
    return 'Google sign-in was cancelled.';
  }

  if (code === statusCodes.IN_PROGRESS) {
    return 'Google sign-in is already in progress.';
  }

  if (code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
    return 'Google Play Services is unavailable or out of date on this device.';
  }

  if (code === 10 || code === '10' || /DEVELOPER_ERROR/i.test(message)) {
    if (Platform.OS === 'android') {
      return 'Google Sign-In is misconfigured for this Android build. Verify the Firebase Android OAuth client for package com.bookmygrounds includes the SHA-1 and SHA-256 of the keystore used to build this app, then download the updated google-services.json and rebuild.';
    }

    return 'Google Sign-In is misconfigured for iOS. Add the correct GoogleService-Info.plist and URL scheme for this app target, then rebuild.';
  }

  if (
    Platform.OS === 'ios' &&
    /url scheme|reversed client id|client id|google service-info/i.test(message)
  ) {
    return 'Google Sign-In is not wired for iOS yet. Add GoogleService-Info.plist and the reversed client ID URL scheme in Info.plist, then rebuild.';
  }

  return getErrorMessage(error, 'Unable to complete Google sign-in right now.');
}

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const showPassword = false;

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert('Missing details', 'Enter both email and password to continue.');
    }

    try {
      setLoading(true);
      const res = await authAPI.login(email, password);
      dispatch(setCredentials({ token: res.token, user: res.user }));
    } catch (error: any) {
      Alert.alert('Login failed', getErrorMessage(error, 'Please check your credentials and try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      try {
        await GoogleSignin.signOut();
      } catch {}

      const signInResult = (await GoogleSignin.signIn()) as any;
      const idToken = signInResult.data?.idToken || signInResult.idToken;
      if (!idToken) {
        throw new Error('No Google idToken found');
      }

      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(googleCredential);
      const firebaseToken = await userCredential.user.getIdToken();
      const res = await authAPI.firebaseLogin(firebaseToken, 'customer');
      dispatch(setCredentials({ token: res.token, user: res.user }));
    } catch (error: any) {
      Alert.alert('Google sign-in failed', getGoogleSignInErrorMessage(error));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Brand Badge */}
        <View style={styles.brandRow}>
          <View style={styles.brandBadge}>
            <Image source={APP_LOGO} style={styles.brandLogo} resizeMode="contain" />
          </View>
          <Text style={styles.brandName}>BookMyGrounds</Text>
          <Text style={styles.brandTagline}>Built for fast booking and repeat play.</Text>
        </View>

        {/* Hero Card */}
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>BOOK SMARTER</Text>
          <Text style={styles.title}>Turn nearby grounds into daily revenue.</Text>
          <Text style={styles.subtitle}>
            Discover premium turfs, convert drop-ins into confirmed bookings, and keep every session moving.
          </Text>
          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>24/7</Text>
              <Text style={styles.heroStatLabel}>Instant access</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>Top</Text>
              <Text style={styles.heroStatLabel}>Rated venues</Text>
            </View>
          </View>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Welcome back</Text>
          <Text style={styles.formSubtitle}>Sign in and continue where you left off.</Text>

          <Input
            label="Email"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            leftIcon={<Icon name="mail-outline" size={20} color={theme.colors.textSoft} />}
          />
          <Input
            label="Password"
            placeholder="Enter password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            leftIcon={<Icon name="lock-closed-outline" size={20} color={theme.colors.textSoft} />}
          />

          {/* Forgot Password */}
          <TouchableOpacity
            style={styles.forgotRow}
            onPress={() => Alert.alert(
              'Reset Password',
              'To reset your password, please contact support at help@bookmygrounds.in or use the "Change Password" option after logging in.',
            )}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <Button title="Sign In" onPress={handleLogin} isLoading={loading} style={styles.primaryButton} />

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          {/* Google Sign-In with proper icon */}
          <Button
            title="Continue with Google"
            variant="outline"
            onPress={handleGoogleSignIn}
            isLoading={googleLoading}
            icon={<Icon name="logo-google" size={20} color={theme.colors.primaryDark} />}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Need an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>Create one</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.l,
    justifyContent: 'center',
  },
  brandRow: {
    alignItems: 'center',
    marginBottom: theme.spacing.l,
  },
  brandBadge: {
    width: 96,
    height: 96,
    borderRadius: 30,
    backgroundColor: theme.colors.surfaceDark,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.strong,
  },
  brandLogo: {
    width: 72,
    height: 72,
  },
  brandName: {
    ...theme.typography.h2,
    color: theme.colors.textMain,
    marginTop: theme.spacing.m,
  },
  brandTagline: {
    ...theme.typography.bodyS,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  heroCard: {
    backgroundColor: theme.colors.surfaceDark,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.l,
    ...theme.shadows.strong,
  },
  eyebrow: {
    ...theme.typography.caption,
    color: theme.colors.cyan,
    marginBottom: theme.spacing.s,
  },
  title: {
    ...theme.typography.hero,
    color: theme.colors.white,
    marginBottom: theme.spacing.s,
  },
  subtitle: {
    ...theme.typography.bodyM,
    color: '#B3C7DC',
  },
  heroStats: {
    flexDirection: 'row',
    marginTop: theme.spacing.xl,
  },
  heroStat: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: theme.borderRadius.l,
    padding: theme.spacing.m,
    marginRight: theme.spacing.m,
    flex: 1,
  },
  heroStatValue: {
    ...theme.typography.h3,
    color: theme.colors.white,
  },
  heroStatLabel: {
    ...theme.typography.caption,
    color: '#B3C7DC',
    marginTop: 2,
  },
  formCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    ...theme.shadows.soft,
  },
  formTitle: {
    ...theme.typography.h2,
    color: theme.colors.textMain,
  },
  formSubtitle: {
    ...theme.typography.bodyM,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.l,
  },
  forgotRow: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.m,
    marginTop: -theme.spacing.s,
  },
  forgotText: {
    ...theme.typography.bodyS,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  primaryButton: {
    marginTop: theme.spacing.xs,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.l,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    ...theme.typography.caption,
    color: theme.colors.textSoft,
    marginHorizontal: theme.spacing.m,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: theme.spacing.l,
  },
  footerText: {
    ...theme.typography.bodyM,
    color: theme.colors.textMuted,
    marginRight: 6,
  },
  footerLink: {
    ...theme.typography.bodyM,
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
