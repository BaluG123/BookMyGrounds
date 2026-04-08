import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { theme } from '../../utils/theme';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { authAPI } from '../../api/auth';
import { logout } from '../../store/slices/authSlice';
import Icon from 'react-native-vector-icons/Ionicons';

export default function ProfileScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      dispatch(logout());
    } catch (e) {
      Alert.alert('Error', 'Failed to log out properly');
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder}>
          <Icon name="person" size={40} color={theme.colors.white} />
        </View>
        <Text style={styles.name}>{user?.full_name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.roleTag}>{user?.role.toUpperCase()}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Details</Text>
        <View style={styles.infoRow}>
          <Icon name="call-outline" size={20} color={theme.colors.textMuted} />
          <Text style={styles.infoText}>{user?.phone || 'Not provided'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="location-outline" size={20} color={theme.colors.textMuted} />
          <Text style={styles.infoText}>{user?.city || 'City'}, {user?.state || 'State'}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button title="Edit Profile" onPress={() => console.log('Edit profile')} variant="outline" style={styles.actionBtn} />
        <Button title="Change Password" onPress={() => console.log('Change pass')} variant="outline" style={styles.actionBtn} />
        <Button title="Logout" onPress={handleLogout} style={styles.logoutBtn} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.s,
  },
  name: {
    ...theme.typography.h2,
    color: theme.colors.textMain,
  },
  email: {
    ...theme.typography.bodyM,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.s,
  },
  roleTag: {
    ...theme.typography.caption,
    fontWeight: '700',
    color: theme.colors.primaryDark,
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.pill,
  },
  section: {
    padding: theme.spacing.m,
  },
  sectionTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.m,
    color: theme.colors.textMain,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  infoText: {
    ...theme.typography.bodyM,
    color: theme.colors.textMain,
    marginLeft: theme.spacing.s,
  },
  actions: {
    padding: theme.spacing.m,
    marginTop: 'auto',
  },
  actionBtn: {
    marginBottom: theme.spacing.m,
  },
  logoutBtn: {
    backgroundColor: theme.colors.error,
  },
});
