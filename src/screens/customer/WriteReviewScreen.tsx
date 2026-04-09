import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { theme } from '../../utils/theme';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { reviewsAPI } from '../../api/reviews';
import { getErrorMessage } from '../../utils/error';

export default function WriteReviewScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const booking = route.params?.booking;

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!booking?.ground) {
      Alert.alert('Missing ground', 'This booking is missing the ground reference.');
      return;
    }

    try {
      setSubmitting(true);
      await reviewsAPI.create({
        ground: booking.ground,
        rating,
        comment,
      });
      Alert.alert('Review submitted', 'Thanks for rating your experience.', [
        {
          text: 'Done',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert('Review failed', getErrorMessage(error, 'Unable to submit your review.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Text style={styles.eyebrow}>POST-MATCH REVIEW</Text>
          <Text style={styles.title}>Rate the venue experience.</Text>
          <Text style={styles.subtitle}>{booking?.ground_name || 'Tell other players what to expect.'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Your rating</Text>
          <View style={styles.starRow}>
            {[1, 2, 3, 4, 5].map(star => {
              const active = star <= rating;
              return (
                <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.85} style={styles.starButton}>
                  <Icon name={active ? 'star' : 'star-outline'} size={34} color={active ? theme.colors.accent : theme.colors.textSoft} />
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.ratingLabel}>{rating}/5</Text>

          <Input
            label="Comment"
            placeholder="What worked well? Anything players should know?"
            multiline
            numberOfLines={5}
            style={styles.commentInput}
            value={comment}
            onChangeText={setComment}
          />

          <Button title="Submit Review" onPress={handleSubmit} isLoading={submitting} />
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
    marginTop: theme.spacing.s,
    marginBottom: theme.spacing.l,
    ...theme.shadows.strong,
  },
  eyebrow: {
    ...theme.typography.caption,
    color: '#9CCAFF',
    marginBottom: theme.spacing.s,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.white,
    marginBottom: theme.spacing.s,
  },
  subtitle: {
    ...theme.typography.bodyM,
    color: '#B3C7DC',
  },
  card: {
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
  starRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.spacing.s,
  },
  starButton: {
    marginHorizontal: theme.spacing.xs,
  },
  ratingLabel: {
    ...theme.typography.bodyM,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.l,
  },
  commentInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
});
