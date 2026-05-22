import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Modal,
} from 'react-native';
import { Spacing, BorderRadius, Shadows, Typography } from '@/constants/theme';
import type { ThemeColors } from '@/constants/theme';
import { useTheme } from '@/contexts/ThemeContext';

interface CompletionCelebrationProps {
  visible: boolean;
  onDismiss: () => void;
}

export default function CompletionCelebration({
  visible,
  onDismiss,
}: CompletionCelebrationProps) {
  const { colors } = useTheme();
  const styles = React.useMemo(() => createStyles(colors), [colors]);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (visible) {
      // Reset values
      opacity.setValue(0);
      scale.setValue(0.8);

      // Animate in
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-dismiss after 0.8 seconds
      const timer = setTimeout(() => {
        animateOut();
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const animateOut = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onDismiss();
    });
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={animateOut}
    >
      <Pressable style={styles.overlay} onPress={animateOut}>
        <Animated.View
          style={[
            styles.card,
            {
              opacity,
              transform: [{ scale }],
            },
          ]}
        >
          <Text style={styles.emoji}>✅</Text>
          <Text style={styles.title}>完了！いい感じです 🎉</Text>
          <Text style={styles.subtitle}>一歩ずつ前に進んでいます</Text>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const createStyles = (colors: ThemeColors) => StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.xxxl,
    paddingHorizontal: Spacing.xxxl + Spacing.lg,
    alignItems: 'center',
    ...Shadows.card,
  },
  emoji: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.title,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
