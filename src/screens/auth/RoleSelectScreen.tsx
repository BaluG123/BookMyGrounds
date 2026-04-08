import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { Button } from '../../components/Button';
import { theme } from '../../utils/theme';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';

export default function RoleSelectScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<Record<string, any>, string>>();

  return (
    <ScreenContainer style={styles.container}>
      <Text style={styles.title}>How do you want to use the app?</Text>
      
      <View style={styles.options}>
        <Button
          title="Customer (To Book Turfs)"
          onPress={() => navigation.navigate('Register', { role: 'customer' })}
          style={styles.btn}
        />
        <Button
          title="Admin/Owner (To Host Turfs)"
          variant="secondary"
          onPress={() => navigation.navigate('Register', { role: 'admin' })}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.l,
    justifyContent: 'center',
  },
  title: {
    ...theme.typography.h2,
    textAlign: 'center',
    color: theme.colors.primaryDark,
    marginBottom: theme.spacing.xxl,
  },
  options: {
    paddingHorizontal: theme.spacing.m,
  },
  btn: {
    marginBottom: theme.spacing.l,
  },
});
