import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { theme } from '../../utils/theme';
import { RootState, AppDispatch } from '../../store';
import { authAPI } from '../../api/auth';
import { logout, updateUser } from '../../store/slices/authSlice';

const DEVELOPER_CONTACT_NUMBER = '+919380552833';

export default function ProfileScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    city: user?.city || '',
    state: user?.state || '',
  });

  const refreshProfile = useCallback(async () => {
    try {
      const res = await authAPI.getProfile();
      const profileData = res.data;
      dispatch(updateUser(profileData));
      await AsyncStorage.setItem('user_data', JSON.stringify({ ...user, ...profileData }));
      setForm({
        full_name: profileData.full_name || user?.full_name || '',
        phone: profileData.phone || user?.phone || '',
        city: profileData.city || user?.city || '',
        state: profileData.state || user?.state || '',
      });
    } catch (error) {
      // Silent fail — we still show cached data
      console.log('Profile refresh failed', error);
    }
  }, [dispatch, user]);

  // Refresh profile from server on focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshProfile();
    });
    return unsubscribe;
  }, [navigation, refreshProfile]);

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('full_name', form.full_name);
      formData.append('phone', form.phone);
      formData.append('city', form.city);
      formData.append('state', form.state);

      const res = await authAPI.updateProfile(formData);
      const updatedUser = res.data;

      dispatch(updateUser(updatedUser));
      await AsyncStorage.setItem('user_data', JSON.stringify({ ...user, ...updatedUser }));

      setIsEditing(false);
      Alert.alert('Profile updated', 'Your changes have been saved.');
    } catch (error: any) {
      Alert.alert('Update failed', error?.response?.data?.detail || 'Unable to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await authAPI.logout();
              dispatch(logout());
            } catch {
              Alert.alert('Error', 'Failed to log out properly');
            }
          },
        },
      ],
    );
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'To change your password, contact support at help@bookmygrounds.in or use the "Forgot Password" flow from the login screen.',
    );
  };

  const handleDeveloperContact = async () => {
    const phoneUrl = `tel:${DEVELOPER_CONTACT_NUMBER}`;

    try {
      const supported = await Linking.canOpenURL(phoneUrl);

      if (supported) {
        await Linking.openURL(phoneUrl);
        return;
      }
    } catch (error) {
      console.log('Unable to open phone dialer', error);
    }

    Alert.alert('Developer Contact', DEVELOPER_CONTACT_NUMBER);
  };

  const initials = user?.full_name
    ?.split(' ')
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase();

  const memberSince = 'April 2026'; // Could be derived from user.date_joined if available

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Hero */}
        <View style={styles.heroCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials || 'BG'}</Text>
          </View>
          <Text style={styles.name}>{user?.full_name || 'BookMyGrounds User'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.rolePill}>
              <Icon
                name={user?.role === 'admin' ? 'business-outline' : 'flash-outline'}
                size={14}
                color={theme.colors.white}
              />
              <Text style={styles.roleText}>
                {user?.role === 'admin' ? 'VENUE HOST' : 'PLAYER'}
              </Text>
            </View>
            <View style={styles.memberPill}>
              <Icon name="calendar-outline" size={13} color="#B3C7DC" />
              <Text style={styles.memberText}>Since {memberSince}</Text>
            </View>
          </View>
        </View>

        {/* Profile Details / Edit */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Profile details</Text>
            <TouchableOpacity
              onPress={() => {
                if (isEditing) {
                  // Reset form on cancel
                  setForm({
                    full_name: user?.full_name || '',
                    phone: user?.phone || '',
                    city: user?.city || '',
                    state: user?.state || '',
                  });
                }
                setIsEditing(!isEditing);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.editToggle}>
                {isEditing ? 'Cancel' : 'Edit'}
              </Text>
            </TouchableOpacity>
          </View>

          {isEditing ? (
            <>
              <Input
                label="Full Name"
                value={form.full_name}
                onChangeText={value => setForm(prev => ({ ...prev, full_name: value }))}
              />
              <Input
                label="Phone"
                value={form.phone}
                keyboardType="phone-pad"
                onChangeText={value => setForm(prev => ({ ...prev, phone: value }))}
              />
              <View style={styles.row}>
                <Input
                  label="City"
                  value={form.city}
                  onChangeText={value => setForm(prev => ({ ...prev, city: value }))}
                  containerStyle={styles.halfInput}
                />
                <Input
                  label="State"
                  value={form.state}
                  onChangeText={value => setForm(prev => ({ ...prev, state: value }))}
                  containerStyle={styles.halfInput}
                />
              </View>
              <Button
                title="Save Changes"
                onPress={handleSaveProfile}
                isLoading={saving}
                icon={<Icon name="checkmark-circle-outline" size={18} color={theme.colors.white} />}
              />
            </>
          ) : (
            <>
              <ProfileInfoRow icon="person-outline" label="Full Name" value={user?.full_name || 'Not provided'} />
              <ProfileInfoRow icon="call-outline" label="Phone" value={user?.phone || 'Not provided'} />
              <ProfileInfoRow icon="location-outline" label="Location" value={
                [user?.city, user?.state].filter(Boolean).join(', ') || 'Not provided'
              } />
              <ProfileInfoRow icon="mail-outline" label="Email" value={user?.email || 'Not provided'} />
              <ProfileInfoRow icon="shield-checkmark-outline" label="Account type" value={
                user?.role === 'admin' ? 'Venue host — manage grounds & bookings' : 'Player — book & play'
              } />
            </>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
          <ActionButton
            icon="notifications-outline"
            label="Notifications"
            onPress={() => navigation.navigate('Notifications')}
          />
          {user?.role === 'admin' ? (
            <ActionButton
              icon="wallet-outline"
              label="Payout Profile"
              onPress={() => navigation.navigate('PayoutProfile')}
            />
          ) : null}
          <ActionButton
            icon="key-outline"
            label="Change Password"
            onPress={handleChangePassword}
          />
          {user?.role === 'admin' ? (
            <View style={styles.supportCard}>
              <View style={styles.supportHeader}>
                <Icon name="construct-outline" size={18} color={theme.colors.primary} />
                <Text style={styles.supportTitle}>Developer contact</Text>
              </View>
              <Text style={styles.supportCopy}>
                Ground owners can reach the app developer directly for rollout and support.
              </Text>
              <ProfileInfoRow icon="call-outline" label="Phone" value={DEVELOPER_CONTACT_NUMBER} />
              <Button
                title="Call Developer"
                onPress={handleDeveloperContact}
                variant="outline"
                icon={<Icon name="call-outline" size={18} color={theme.colors.primaryDark} />}
              />
            </View>
          ) : null}
          <View style={styles.logoutSpacer} />
          <Button
            title="Sign Out"
            onPress={handleLogout}
            variant="outline"
            icon={<Icon name="log-out-outline" size={18} color={theme.colors.primaryDark} />}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const ProfileInfoRow = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoIconWrap}>
      <Icon name={icon} size={18} color={theme.colors.primary} />
    </View>
    <View style={styles.infoBody}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  </View>
);

const ActionButton = ({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) => (
  <TouchableOpacity style={styles.actionRow} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.actionLeft}>
      <Icon name={icon} size={20} color={theme.colors.primary} />
      <Text style={styles.actionLabel}>{label}</Text>
    </View>
    <Icon name="chevron-forward" size={18} color={theme.colors.textSoft} />
  </TouchableOpacity>
);

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
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.2)',
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
  badgeRow: {
    flexDirection: 'row',
    marginTop: theme.spacing.m,
    gap: theme.spacing.s,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.pill,
    gap: 6,
  },
  roleText: {
    ...theme.typography.caption,
    color: theme.colors.white,
  },
  memberPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.pill,
    gap: 5,
  },
  memberText: {
    ...theme.typography.caption,
    color: '#B3C7DC',
  },
  sectionCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.l,
    ...theme.shadows.soft,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.textMain,
    marginBottom: theme.spacing.m,
  },
  editToggle: {
    ...theme.typography.bodyS,
    color: theme.colors.primary,
    fontWeight: '700',
    marginBottom: theme.spacing.m,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.l,
  },
  infoIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
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
  row: {
    flexDirection: 'row',
    gap: theme.spacing.m,
  },
  halfInput: {
    flex: 1,
  },
  actionsCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.l,
    ...theme.shadows.soft,
  },
  supportCard: {
    marginTop: theme.spacing.m,
    paddingTop: theme.spacing.m,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  supportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.s,
    marginBottom: theme.spacing.s,
  },
  supportTitle: {
    ...theme.typography.bodyM,
    color: theme.colors.textMain,
    fontWeight: '700',
  },
  supportCopy: {
    ...theme.typography.bodyS,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.m,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.m,
  },
  actionLabel: {
    ...theme.typography.bodyM,
    color: theme.colors.textMain,
  },
  logoutSpacer: {
    height: theme.spacing.m,
  },
});
