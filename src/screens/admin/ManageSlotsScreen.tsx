import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { theme } from '../../utils/theme';

export default function ManageSlotsScreen() {
  return (
    <ScreenContainer style={styles.container}>
      <Text style={styles.title}>Manage Time Slots</Text>
      <Text style={styles.subtitle}>Select a turf and date to manage slots</Text>
      
      {/* Calendar and slot list UI will be implemented here */}
      <View style={styles.placeholder}>
        <Text style={{ color: theme.colors.textMuted }}>Calendar UI Placeholder</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.l,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.textMain,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.bodyM,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.l,
  },
  placeholder: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.l,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundLight,
  },
});
