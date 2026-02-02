import React, { useRef } from 'react';
import { StyleSheet, Text, Pressable, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

interface CheckInOptionProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
  color?: string;
}

export default function CheckInOption({ label, selected, onSelect, color }: CheckInOptionProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        style={[
          styles.option,
          selected && styles.optionSelected,
          selected && color && { backgroundColor: color, borderColor: color },
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Text
          style={[
            styles.optionText,
            selected && styles.optionTextSelected,
          ]}
        >
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  option: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.sandMuted,
    minWidth: 100,
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: Colors.sage,
    borderColor: Colors.sage,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  optionTextSelected: {
    color: Colors.card,
    fontWeight: '600' as const,
  },
});
