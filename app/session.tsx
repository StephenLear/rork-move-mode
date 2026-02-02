import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { StyleSheet, Text, View, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import MovementTimer from '@/components/MovementTimer';
import { getSessionTypeInfo } from '@/utils/sessionMatcher';
import { sessionIntros } from '@/constants/messages';

export default function SessionScreen() {
  const router = useRouter();
  const { currentSession, currentMovementIndex, nextMovement, resetCheckIn } = useApp();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const intro = useMemo(() => {
    if (!currentSession) return '';
    const intros = sessionIntros[currentSession.type];
    return intros[Math.floor(Math.random() * intros.length)];
  }, [currentSession]);

  const handleComplete = useCallback(() => {
    const hasMore = nextMovement();
    if (!hasMore) {
      router.replace('/complete');
    }
  }, [nextMovement, router]);

  const handleSkip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const hasMore = nextMovement();
    if (!hasMore) {
      router.replace('/complete');
    }
  }, [nextMovement, router]);

  const handleClose = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    resetCheckIn();
    router.replace('/');
  }, [resetCheckIn, router]);

  useEffect(() => {
    if (!currentSession) {
      router.replace('/');
    }
  }, [currentSession, router]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  if (!currentSession) {
    return null;
  }

  const typeInfo = getSessionTypeInfo(currentSession.type);
  const currentMovement = currentSession.movements[currentMovementIndex];

  return (
    <View style={[styles.container, { backgroundColor: typeInfo.color + '10' }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          <View style={styles.header}>
            <View>
              <Text style={styles.sessionName}>{currentSession.name}</Text>
              <Text style={[styles.intro, { color: typeInfo.color }]}>{intro}</Text>
            </View>
            <Pressable style={styles.closeButton} onPress={handleClose}>
              <X size={24} color={Colors.textMuted} />
            </Pressable>
          </View>

          <MovementTimer
            movement={currentMovement}
            movementIndex={currentMovementIndex}
            totalMovements={currentSession.movements.length}
            onComplete={handleComplete}
            onSkip={handleSkip}
            sessionColor={typeInfo.color}
          />
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sessionName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  intro: {
    fontSize: 15,
    fontWeight: '500' as const,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
});
