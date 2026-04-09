import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { authAPI } from '../../api/auth';
import { setCredentials } from '../../store/slices/authSlice';
import { theme } from '../../utils/theme';

GoogleSignin.configure({
  webClientId: '614899789202-l1ujssb8k8odq4tge5273v6k45j8usfj.apps.googleusercontent.com',
});

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert('Error', 'Please fill all fields');
    }

    try {
      setLoading(true);
      const res = await authAPI.login(email, password);
      dispatch(setCredentials({ token: res.token, user: res.user }));
    } catch (error: any) {
      Alert.alert('Login Failed', error.response?.data?.detail || 'Something went wrong');
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
      Alert.alert('Google Sign-In Failed', error.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>BOOK SMARTER</Text>
          <Text style={styles.title}>Your next game night starts here.</Text>
          <Text style={styles.subtitle}>
            Discover premium turfs, manage bookings, and keep every session feeling effortless.
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
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            leftIcon={<Icon name="lock-closed-outline" size={20} color={theme.colors.textSoft} />}
          />

          <Button title="Login" onPress={handleLogin} isLoading={loading} style={styles.primaryButton} />

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          <Button
            title="Continue with Google"
            variant="outline"
            onPress={handleGoogleSignIn}
            isLoading={googleLoading}
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
  primaryButton: {
    marginTop: theme.spacing.s,
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
