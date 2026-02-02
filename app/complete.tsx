import React, { useEffect, useRef, useMemo } from 'react';
import { StyleSheet, Text, View, Pressable, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Sparkles, Flame } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { completionMessages } from '@/constants/messages';
import { getSessionTypeInfo } from '@/utils/sessionMatcher';

export default function CompleteScreen() {
  const router = useRouter();
  const { currentSession, resetCheckIn, currentStreak, recordSessionCompletion } = useApp();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const heartAnim = useRef(new Animated.Value(1)).current;

  const message = useMemo(() => {
    return completionMessages[Math.floor(Math.random() * completionMessages.length)];
  }, []);

  const typeInfo = currentSession ? getSessionTypeInfo(currentSession.type) : null;

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    recordSessionCompletion();
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    const heartPulse = Animated.loop(
      Animated.sequence([
        Animated.timing(heartAnim, {
          toValue: 1.15,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(heartAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    heartPulse.start();

    return () => heartPulse.stop();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDone = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    resetCheckIn();
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Animated.View 
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
          ]}
        >
          <View style={styles.celebrationContainer}>
            <View style={styles.sparkleTop}>
              <Sparkles size={24} color={Colors.terracottaMuted} />
            </View>
            <View style={styles.sparkleBottom}>
              <Sparkles size={20} color={Colors.sageMuted} />
            </View>
            <Animated.View 
              style={[
                styles.heartCircle,
                typeInfo && { backgroundColor: typeInfo.color + '20' },
                { transform: [{ scale: heartAnim }] }
              ]}
            >
              <Heart 
                size={48} 
                color={typeInfo?.color || Colors.sage} 
                fill={typeInfo?.color || Colors.sage}
              />
            </Animated.View>
          </View>

          <Text style={styles.title}>You did it.</Text>
          <Text style={styles.message}>{message}</Text>

          {currentSession && (
            <View style={styles.sessionInfo}>
              <Text style={styles.sessionLabel}>You completed</Text>
              <Text style={[styles.sessionName, typeInfo && { color: typeInfo.color }]}>
                {currentSession.name}
              </Text>
              <Text style={styles.sessionDuration}>
                {currentSession.duration} minutes · {currentSession.movements.length} movements
              </Text>
            </View>
          )}

          {currentStreak > 0 && (
            <View style={styles.streakContainer}>
              <View style={styles.streakBadge}>
                <Flame size={24} color={Colors.terracotta} fill={Colors.terracotta} />
                <Text style={styles.streakNumber}>{currentStreak}</Text>
              </View>
              <Text style={styles.streakLabel}>
                {currentStreak === 1 ? 'day moving' : 'day streak'}
              </Text>
              {currentStreak >= 3 && (
                <Text style={styles.streakMessage}>
                  {currentStreak >= 7 ? 'Amazing consistency!' : 'Keep it going!'}
                </Text>
              )}
            </View>
          )}
        </Animated.View>

        <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
          <Text style={styles.footerText}>Come back whenever you are ready.</Text>
          <Pressable style={styles.doneButton} onPress={handleDone}>
            <Text style={styles.doneButtonText}>Done</Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  celebrationContainer: {
    position: 'relative',
    marginBottom: 32,
  },
  sparkleTop: {
    position: 'absolute',
    top: -20,
    right: -30,
  },
  sparkleBottom: {
    position: 'absolute',
    bottom: -10,
    left: -25,
  },
  heartCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.sageLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  message: {
    fontSize: 20,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 40,
  },
  sessionInfo: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: Colors.card,
    borderRadius: 20,
    width: '100%',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  sessionLabel: {
    fontSize: 13,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  sessionName: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.sage,
    marginBottom: 4,
  },
  sessionDuration: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  streakContainer: {
    alignItems: 'center',
    marginTop: 24,
    paddingVertical: 20,
    paddingHorizontal: 32,
    backgroundColor: Colors.terracottaLight,
    borderRadius: 20,
    width: '100%',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  streakNumber: {
    fontSize: 36,
    fontWeight: '700' as const,
    color: Colors.terracotta,
  },
  streakLabel: {
    fontSize: 14,
    color: Colors.terracottaMuted,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  streakMessage: {
    fontSize: 15,
    color: Colors.text,
    marginTop: 8,
    fontWeight: '500' as const,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 16,
  },
  doneButton: {
    width: '100%',
    backgroundColor: Colors.text,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: Colors.card,
  },
});
