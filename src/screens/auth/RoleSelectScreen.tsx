import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ScreenContainer } from '../../components/ScreenContainer';
import { theme } from '../../utils/theme';

export default function RoleSelectScreen() {
  const navigation = useNavigation<any>();

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.eyebrow}>START HERE</Text>
        <Text style={styles.title}>How should BookMyGrounds work for you?</Text>
        <Text style={styles.subtitle}>
          Pick the experience you want first. You can create the right account in the next step.
        </Text>

        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => navigation.navigate('Register', { role: 'customer' })}
          activeOpacity={0.92}>
          <View style={styles.optionIconCustomer}>
            <Icon name="flash" size={20} color={theme.colors.white} />
          </View>
          <View style={styles.optionBody}>
            <Text style={styles.optionTitle}>I want to book turfs</Text>
            <Text style={styles.optionText}>Search, compare, save favorites, and reserve slots in seconds.</Text>
          </View>
          <Icon name="arrow-forward" size={20} color={theme.colors.textMain} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => navigation.navigate('Register', { role: 'admin' })}
          activeOpacity={0.92}>
          <View style={styles.optionIconAdmin}>
            <Icon name="business" size={20} color={theme.colors.white} />
          </View>
          <View style={styles.optionBody}>
            <Text style={styles.optionTitle}>I manage a venue</Text>
            <Text style={styles.optionText}>List grounds, accept bookings, and build a polished host presence.</Text>
          </View>
          <Icon name="arrow-forward" size={20} color={theme.colors.textMain} />
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: theme.spacing.l,
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
    marginBottom: theme.spacing.xl,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.l,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: theme.borderRadius.xl,
    marginBottom: theme.spacing.m,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    ...theme.shadows.soft,
  },
  optionIconCustomer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconAdmin: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.surfaceDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionBody: {
    flex: 1,
    marginHorizontal: theme.spacing.m,
  },
  optionTitle: {
    ...theme.typography.h3,
    color: theme.colors.textMain,
    marginBottom: 4,
  },
  optionText: {
    ...theme.typography.bodyM,
    color: theme.colors.textMuted,
  },
});
