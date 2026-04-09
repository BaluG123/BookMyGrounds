import React from 'react';
import { StatusBar, StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../utils/theme';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  backgroundColor?: string;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  style,
  contentStyle,
  backgroundColor = theme.colors.background,
}) => {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor }, style]} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor={backgroundColor} />
      <View style={styles.backdrop} pointerEvents="none">
        <View style={styles.backdropOrbPrimary} />
        <View style={styles.backdropOrbSecondary} />
      </View>
      <View style={[styles.content, contentStyle]}>{children}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  backdropOrbPrimary: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#DDE9FF',
    top: -120,
    right: -100,
    opacity: 0.8,
  },
  backdropOrbSecondary: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#D9FBF3',
    bottom: -120,
    left: -120,
    opacity: 0.65,
  },
});
