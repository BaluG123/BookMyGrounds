import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { authAPI } from '../api/auth';
import { theme } from '../utils/theme';
import { subscribeToNotificationEvents } from '../utils/notificationEvents';

export function NotificationBell({ light = false }: { light?: boolean }) {
  const navigation = useNavigation<any>();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await authAPI.listNotifications({ unread_only: true });
      const items = res.data.results || res.data || [];
      setUnreadCount(items.length);
    } catch {
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    return subscribeToNotificationEvents(fetchUnreadCount);
  }, [fetchUnreadCount]);

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Notifications')}
      activeOpacity={0.86}
      style={[styles.button, light ? styles.buttonLight : styles.buttonSolid]}>
      {loading ? (
        <ActivityIndicator size="small" color={light ? theme.colors.white : theme.colors.primaryDark} />
      ) : (
        <>
          <Icon
            name={unreadCount > 0 ? 'notifications' : 'notifications-outline'}
            size={20}
            color={light ? theme.colors.white : theme.colors.primaryDark}
          />
          {unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
            </View>
          ) : null}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  buttonSolid: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    ...theme.shadows.soft,
  },
  buttonLight: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 5,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: theme.colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    ...theme.typography.caption,
    color: theme.colors.white,
    fontSize: 10,
    lineHeight: 12,
  },
});
