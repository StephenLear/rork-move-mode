import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Colors from '@/constants/colors';
import CheckInOption from './CheckInOption';

interface CheckInSectionProps<T extends string> {
  title: string;
  subtitle?: string;
  options: { value: T; label: string }[];
  selectedValue: T | null;
  onSelect: (value: T) => void;
  color?: string;
}

export default function CheckInSection<T extends string>({
  title,
  subtitle,
  options,
  selectedValue,
  onSelect,
  color,
}: CheckInSectionProps<T>) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      <View style={styles.options}>
        {options.map((option) => (
          <CheckInOption
            key={option.value}
            label={option.label}
            selected={selectedValue === option.value}
            onSelect={() => onSelect(option.value)}
            color={color}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 16,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
});
