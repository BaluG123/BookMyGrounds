import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { theme } from '../../utils/theme';
import { groundsAPI } from '../../api/grounds';
import { Button } from '../../components/Button';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function GroundDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { id } = route.params;
  
  const [ground, setGround] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const res = await groundsAPI.detail(id);
      setGround(res.data);
    } catch (e) {
      console.log('Error fetching detail', e);
    } finally {
      setLoading(false);
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

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} />
          <Icon name="arrow-back-circle" size={36} color="white" style={styles.backBtn} onPress={() => navigation.goBack()} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{ground.name}</Text>
          <Text style={styles.location}>
            <Icon name="location" size={16} color={theme.colors.textMuted} /> {ground.address}, {ground.city}
          </Text>

          <View style={styles.tags}>
            <View style={styles.tag}><Text style={styles.tagText}>{ground.ground_type}</Text></View>
            <View style={styles.tag}><Text style={styles.tagText}>⭐ {ground.avg_rating || 'New'}</Text></View>
          </View>

          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.description}>{ground.description || 'No description available for this turf.'}</Text>
          
          <Text style={styles.sectionTitle}>Rules</Text>
          <Text style={styles.description}>{ground.rules || 'No specific rules listed.'}</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View>
          <Text style={styles.priceLabel}>Starting at</Text>
          <Text style={styles.priceValue}>₹{ground.price || '500'}/hr</Text>
        </View>
        <Button 
          title="Book Now" 
          onPress={() => navigation.navigate('SelectSlot', { groundId: ground.id })} 
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 100,
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
  title: {
    ...theme.typography.h1,
    color: theme.colors.textMain,
    marginBottom: theme.spacing.xs,
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
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.m,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  priceValue: {
    ...theme.typography.h2,
    color: theme.colors.textMain,
  },
});
