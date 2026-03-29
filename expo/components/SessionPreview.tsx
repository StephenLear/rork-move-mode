import React, { useRef } from 'react';
import { StyleSheet, Text, View, Pressable, Animated } from 'react-native';
import { Clock, ChevronRight } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { Session } from '@/types';
import { getSessionTypeInfo } from '@/utils/sessionMatcher';

interface SessionPreviewProps {
  session: Session;
  onStart: () => void;
}

export default function SessionPreview({ session, onStart }: SessionPreviewProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const typeInfo = getSessionTypeInfo(session.type);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onStart();
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        style={styles.card}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={[styles.typeIndicator, { backgroundColor: typeInfo.color }]} />
        <View style={styles.content}>
          <View style={[styles.badge, { backgroundColor: typeInfo.color + '20' }]}>
            <Text style={[styles.badgeText, { color: typeInfo.color }]}>{typeInfo.label}</Text>
          </View>
          <Text style={styles.name}>{session.name}</Text>
          <Text style={styles.description}>{typeInfo.description}</Text>
          <View style={styles.meta}>
            <Clock size={16} color={Colors.textMuted} />
            <Text style={styles.duration}>{session.duration} min</Text>
            <Text style={styles.dot}>·</Text>
            <Text style={styles.movements}>{session.movements.length} movements</Text>
          </View>
        </View>
        <View style={styles.arrow}>
          <ChevronRight size={24} color={Colors.textMuted} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  typeIndicator: {
    width: 6,
    height: '100%',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  duration: {
    fontSize: 14,
    color: Colors.textMuted,
    marginLeft: 6,
  },
  dot: {
    fontSize: 14,
    color: Colors.textMuted,
    marginHorizontal: 8,
  },
  movements: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  arrow: {
    padding: 20,
  },
});
