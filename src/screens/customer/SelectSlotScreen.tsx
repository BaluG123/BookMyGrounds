import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { theme } from '../../utils/theme';
import { Button } from '../../components/Button';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

export default function SelectSlotScreen() {
  const navigation = useNavigation<any>();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  
  // Dummy slots for UI
  const slots = [
    { id: '1', time: '06:00 AM - 07:00 AM', available: true },
    { id: '2', time: '07:00 AM - 08:00 AM', available: true },
    { id: '3', time: '08:00 AM - 09:00 AM', available: false },
    { id: '4', time: '05:00 PM - 06:00 PM', available: true },
    { id: '5', time: '06:00 PM - 07:00 PM', available: true },
  ];

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Icon name="arrow-back" size={24} color={theme.colors.textMain} onPress={() => navigation.goBack()} />
        <Text style={styles.title}>Select Time Slot</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>Available Slots for Today</Text>
        
        <View style={styles.grid}>
          {slots.map(slot => (
            <Button
              key={slot.id}
              title={slot.time}
              variant={selectedSlot === slot.id ? 'primary' : (slot.available ? 'outline' : 'text')}
              disabled={!slot.available}
              style={[styles.slotBtn, !slot.available && { backgroundColor: theme.colors.backgroundLight }]}
              onPress={() => setSelectedSlot(slot.id)}
            />
          ))}
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="Proceed to Pay" 
          disabled={!selectedSlot}
          onPress={() => {
            Alert.alert("Success", "Slot reserved! Proceeding to gateway...");
            navigation.navigate('Home');
          }} 
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    ...theme.typography.h2,
    marginLeft: theme.spacing.m,
  },
  content: {
    padding: theme.spacing.m,
  },
  subtitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.m,
  },
  grid: {
    flexDirection: 'column',
  },
  slotBtn: {
    marginBottom: theme.spacing.m,
  },
  footer: {
    padding: theme.spacing.m,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  },
});
