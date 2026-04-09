import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { theme } from '../../utils/theme';
import { groundsAPI } from '../../api/grounds';
import { Button } from '../../components/Button';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { getErrorMessage } from '../../utils/error';
import { openCoordinatesInGoogleMaps } from '../../utils/map';

export default function GroundDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { id } = route.params;
  
  const [ground, setGround] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await groundsAPI.detail(id);
      setGround(res.data);
    } catch (error) {
      Alert.alert('Unable to load turf', getErrorMessage(error, 'Please refresh and try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!ground) {
      return;
    }

    try {
      setFavoriteLoading(true);
      if (ground.is_favorited) {
        const favoritesRes = await groundsAPI.listFavorites();
        const favorites = favoritesRes.data.results || favoritesRes.data || [];
        const currentFavorite = favorites.find((item: any) => item.ground?.id === ground.id);

        if (!currentFavorite) {
          throw new Error('Favorite entry not found.');
        }

        await groundsAPI.removeFavorite(currentFavorite.id);
        setGround((current: any) => ({ ...current, is_favorited: false }));
        return;
      }

      await groundsAPI.addFavorite(ground.id);
      setGround((current: any) => ({ ...current, is_favorited: true }));
    } catch (error) {
      Alert.alert('Favorite update failed', getErrorMessage(error, 'Please try again.'));
    } finally {
      setFavoriteLoading(false);
    }
  };

  if (loading || !ground) {
    return (
      <ScreenContainer style={{ justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </ScreenContainer>
    );
  }

  const imageUri = ground.images?.length > 0 ? ground.images[0].image : 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=600&auto=format&fit=crop';
  const pricingText = ground.min_price?.amount || ground.price || '500';

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <Icon name="arrow-back-circle" size={36} color="white" style={styles.backBtn} onPress={() => navigation.goBack()} />
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{ground.name}</Text>
            <View style={styles.titleActions}>
              <TouchableOpacity
                style={[
                  styles.favoriteButton,
                  ground.is_favorited && styles.favoriteButtonActive,
                  favoriteLoading && styles.iconButtonDisabled,
                ]}
                onPress={handleFavoriteToggle}
                activeOpacity={0.85}
                disabled={favoriteLoading}>
                <Icon
                  name={ground.is_favorited ? 'heart' : 'heart-outline'}
                  size={20}
                  color={ground.is_favorited ? theme.colors.white : theme.colors.primaryDark}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.mapButton}
                onPress={() =>
                  openCoordinatesInGoogleMaps({
                    latitude: ground.latitude,
                    longitude: ground.longitude,
                    label: ground.name,
                  })
                }
                activeOpacity={0.85}>
                <Icon name="map-outline" size={20} color={theme.colors.white} />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.location}>
            <Icon name="location" size={16} color={theme.colors.textMuted} /> {ground.address}, {ground.city}, {ground.state}
          </Text>

          <View style={styles.tags}>
            <View style={styles.tag}><Text style={styles.tagText}>{ground.ground_type}</Text></View>
            <View style={styles.tag}><Text style={styles.tagText}>⭐ {ground.avg_rating || 'New'}</Text></View>
            <View style={styles.tag}><Text style={styles.tagText}>{ground.max_players || 'Flexible'} players</Text></View>
          </View>

          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{ground.description || 'No description available for this turf.'}</Text>

          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailCard}>
            <DetailItem icon="time-outline" label="Hours" value={`${ground.opening_time || '06:00'} - ${ground.closing_time || '22:00'}`} />
            <DetailItem icon="albums-outline" label="Surface" value={ground.surface_type_display || ground.surface_type || 'Standard'} />
            <DetailItem icon="football-outline" label="Bookings" value={`${ground.total_bookings || 0} completed`} />
          </View>
          
          <Text style={styles.sectionTitle}>Rules</Text>
          <Text style={styles.description}>{ground.rules || 'No specific rules listed.'}</Text>

          <View style={styles.bookingCard}>
            <View>
              <Text style={styles.priceLabel}>Starting at</Text>
              <Text style={styles.priceValue}>₹{pricingText}/hr</Text>
            </View>
            <Button
              title="Book Now"
              onPress={() => navigation.navigate('SelectSlot', { groundId: ground.id })}
            />
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const DetailItem = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
  <View style={styles.detailItem}>
    <Icon name={icon} size={18} color={theme.colors.primary} />
    <View style={styles.detailTextWrap}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: theme.spacing.xl,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 250,
  },
  backBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  content: {
    padding: theme.spacing.m,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  titleActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.textMain,
    flex: 1,
    marginRight: theme.spacing.m,
  },
  favoriteButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.s,
    ...theme.shadows.soft,
  },
  favoriteButtonActive: {
    backgroundColor: theme.colors.error,
  },
  mapButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.soft,
  },
  iconButtonDisabled: {
    opacity: 0.6,
  },
  location: {
    ...theme.typography.bodyM,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.m,
  },
  tags: {
    flexDirection: 'row',
    marginBottom: theme.spacing.l,
  },
  tag: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.m,
    marginRight: theme.spacing.s,
  },
  tagText: {
    color: theme.colors.primaryDark,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  sectionTitle: {
    ...theme.typography.h2,
    color: theme.colors.textMain,
    marginBottom: theme.spacing.s,
    marginTop: theme.spacing.s,
  },
  description: {
    ...theme.typography.bodyM,
    color: theme.colors.textMuted,
    lineHeight: 24,
  },
  detailCard: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
    ...theme.shadows.soft,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.m,
  },
  detailTextWrap: {
    marginLeft: theme.spacing.m,
    flex: 1,
  },
  detailLabel: {
    ...theme.typography.caption,
    color: theme.colors.textSoft,
  },
  detailValue: {
    ...theme.typography.bodyM,
    color: theme.colors.textMain,
    marginTop: 2,
  },
  bookingCard: {
    marginTop: theme.spacing.l,
    backgroundColor: theme.colors.surfaceDark,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.l,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.m,
  },
  priceLabel: {
    ...theme.typography.caption,
    color: '#B3C7DC',
  },
  priceValue: {
    ...theme.typography.h2,
    color: theme.colors.white,
  },
});
