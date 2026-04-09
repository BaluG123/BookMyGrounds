import React from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { theme } from '../../utils/theme';
import { RootState, AppDispatch } from '../../store';
import { authAPI } from '../../api/auth';
import { logout } from '../../store/slices/authSlice';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      dispatch(logout());
    } catch {
      Alert.alert('Error', 'Failed to log out properly');
    }
  };

  const initials = user?.full_name
    ?.split(' ')
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials || 'BG'}</Text>
          </View>
          <Text style={styles.name}>{user?.full_name || 'BookMyGrounds User'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.rolePill}>
            <Text style={styles.roleText}>{user?.role?.toUpperCase() || 'MEMBER'}</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Profile details</Text>
          <View style={styles.infoRow}>
            <Icon name="call-outline" size={18} color={theme.colors.primary} />
            <View style={styles.infoBody}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{user?.phone || 'Not provided'}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Icon name="location-outline" size={18} color={theme.colors.primary} />
            <View style={styles.infoBody}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>
                {[user?.city, user?.state].filter(Boolean).join(', ') || 'Not provided'}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Icon name="shield-checkmark-outline" size={18} color={theme.colors.primary} />
            <View style={styles.infoBody}>
              <Text style={styles.infoLabel}>Account type</Text>
              <Text style={styles.infoValue}>
                {user?.role === 'admin' ? 'Venue host dashboard access' : 'Player booking access'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
          <Button title="Notifications" onPress={() => navigation.navigate('Notifications')} variant="outline" style={styles.actionButton} />
          {user?.role === 'admin' ? (
            <Button title="Payout Profile" onPress={() => navigation.navigate('PayoutProfile')} variant="outline" style={styles.actionButton} />
          ) : null}
          <Button title="Edit Profile" onPress={() => Alert.alert('Coming Soon', 'Profile editing will be added next.')} variant="outline" style={styles.actionButton} />
          <Button title="Change Password" onPress={() => Alert.alert('Coming Soon', 'Password management will be added next.')} variant="outline" style={styles.actionButton} />
          <Button title="Logout" onPress={handleLogout} variant="secondary" />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.m,
    paddingBottom: 120,
  },
  heroCard: {
    backgroundColor: theme.colors.surfaceDark,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginTop: theme.spacing.s,
    marginBottom: theme.spacing.l,
    ...theme.shadows.strong,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.m,
  },
  avatarText: {
    ...theme.typography.h1,
    color: theme.colors.white,
  },
  name: {
    ...theme.typography.h2,
    color: theme.colors.white,
    textAlign: 'center',
  },
  email: {
    ...theme.typography.bodyM,
    color: '#B3C7DC',
    marginTop: theme.spacing.s,
  },
  rolePill: {
    marginTop: theme.spacing.m,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.pill,
  },
  roleText: {
    ...theme.typography.caption,
    color: theme.colors.white,
  },
  sectionCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.l,
    ...theme.shadows.soft,
  },
  actionsCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.l,
    ...theme.shadows.soft,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.textMain,
    marginBottom: theme.spacing.m,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.l,
  },
  infoBody: {
    marginLeft: theme.spacing.m,
    flex: 1,
  },
  infoLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSoft,
    marginBottom: 2,
  },
  infoValue: {
    ...theme.typography.bodyM,
    color: theme.colors.textMain,
  },
  actionButton: {
    marginBottom: theme.spacing.m,
  },
});
