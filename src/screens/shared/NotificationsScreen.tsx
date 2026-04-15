import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { theme } from '../../utils/theme';
import { authAPI } from '../../api/auth';
import { getErrorMessage } from '../../utils/error';
import { openFromNotification } from '../../navigation/navigationService';
import { emitNotificationEvent, subscribeToNotificationEvents } from '../../utils/notificationEvents';

export default function NotificationsScreen() {
  const navigation = useNavigation<any>();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      const firstLoad = notifications.length === 0 && !refreshing;
      if (firstLoad) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const res = await authAPI.listNotifications(unreadOnly ? { unread_only: true } : undefined);
      setNotifications(res.data.results || res.data || []);
    } catch (error) {
      setNotifications([]);
      console.log('Notification fetch failed', getErrorMessage(error));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [notifications.length, refreshing, unreadOnly]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const unsubscribe = subscribeToNotificationEvents(fetchNotifications);
    return () => { unsubscribe(); };
  }, [fetchNotifications]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchNotifications();
    });
    return unsubscribe;
  }, [fetchNotifications, navigation]);

  const handleOpenNotification = async (item: any) => {
    try {
      if (!item.is_read) {
        await authAPI.markNotificationRead(item.id);
        setNotifications(current =>
          current.map(notification =>
            notification.id === item.id ? { ...notification, is_read: true } : notification,
          ),
        );
        emitNotificationEvent();
      }
      openFromNotification(item.data);
    } catch (error) {
      console.log('Notification mark-read failed', getErrorMessage(error));
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.card, !item.is_read && styles.cardUnread]}
      onPress={() => handleOpenNotification(item)}
      activeOpacity={0.9}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        {!item.is_read ? <View style={styles.unreadDot} /> : null}
      </View>
      <Text style={styles.cardBody}>{item.body}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{item.notification_type || 'general'}</Text>
        <Text style={styles.metaText}>
          {item.sent_at ? new Date(item.sent_at).toLocaleString('en-IN') : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer>
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchNotifications} tintColor={theme.colors.primary} />
        }
        ListHeaderComponent={
          <View>
            <View style={styles.heroCard}>
              <Text style={styles.eyebrow}>INBOX</Text>
              <Text style={styles.title}>Notifications and booking updates.</Text>
              <Text style={styles.subtitle}>Keep track of confirmations, cancellations, payments, and reminders.</Text>
            </View>

            <View style={styles.filterRow}>
              <TouchableOpacity
                style={[styles.filterChip, !unreadOnly && styles.filterChipActive]}
                onPress={() => setUnreadOnly(false)}
                activeOpacity={0.88}>
                <Text style={[styles.filterText, !unreadOnly && styles.filterTextActive]}>All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.filterChip, unreadOnly && styles.filterChipActive]}
                onPress={() => setUnreadOnly(true)}
                activeOpacity={0.88}>
                <Text style={[styles.filterText, unreadOnly && styles.filterTextActive]}>Unread</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
          ) : (
            <View style={styles.emptyState}>
              <Icon name="notifications-outline" size={28} color={theme.colors.primary} />
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptyText}>Booking and payment updates will appear here as your account becomes active.</Text>
            </View>
          )
        }
        showsVerticalScrollIndicator={false}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    padding: theme.spacing.m,
    paddingBottom: 120,
  },
  heroCard: {
    marginTop: theme.spacing.s,
    marginBottom: theme.spacing.l,
  },
  eyebrow: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    marginBottom: theme.spacing.s,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.textMain,
    marginBottom: theme.spacing.s,
  },
  subtitle: {
    ...theme.typography.bodyL,
    color: theme.colors.textMuted,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.l,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.pill,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'rgba(255,255,255,0.92)',
    marginRight: theme.spacing.s,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterText: {
    ...theme.typography.bodyS,
    color: theme.colors.textMain,
  },
  filterTextActive: {
    color: theme.colors.white,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.m,
    ...theme.shadows.soft,
  },
  cardUnread: {
    borderWidth: 1,
    borderColor: '#BCD4FF',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.s,
  },
  cardTitle: {
    ...theme.typography.h3,
    color: theme.colors.textMain,
    flex: 1,
    marginRight: theme.spacing.m,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  },
  cardBody: {
    ...theme.typography.bodyM,
    color: theme.colors.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.m,
  },
  metaText: {
    ...theme.typography.caption,
    color: theme.colors.textSoft,
    textTransform: 'capitalize',
  },
  loader: {
    marginTop: theme.spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    ...theme.shadows.soft,
  },
  emptyTitle: {
    ...theme.typography.h3,
    color: theme.colors.textMain,
    marginTop: theme.spacing.m,
    marginBottom: theme.spacing.s,
  },
  emptyText: {
    ...theme.typography.bodyM,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});
