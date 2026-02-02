import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StyleSheet, Text, View, Pressable, Animated, Image } from 'react-native';
import { Play, Pause, SkipForward } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { Movement } from '@/types';

interface MovementTimerProps {
  movement: Movement;
  movementIndex: number;
  totalMovements: number;
  onComplete: () => void;
  onSkip: () => void;
  sessionColor: string;
}

export default function MovementTimer({
  movement,
  movementIndex,
  totalMovements,
  onComplete,
  onSkip,
  sessionColor,
}: MovementTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(movement.duration);
  const [isRunning, setIsRunning] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const initialDuration = useRef(movement.duration);

  useEffect(() => {
    initialDuration.current = movement.duration;
    setTimeRemaining(movement.duration);
    progressAnim.setValue(0);
    setIsRunning(true);
    setIsComplete(false);
  }, [movement, progressAnim]);

  useEffect(() => {
    if (isRunning && !isComplete) {
      const currentProgress = 1 - (timeRemaining / initialDuration.current);
      progressAnim.setValue(currentProgress);
      
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: timeRemaining * 1000,
        useNativeDriver: false,
      }).start();
    } else {
      progressAnim.stopAnimation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, isComplete]);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning && timeRemaining > 0 && !isComplete) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsComplete(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, isComplete]);

  useEffect(() => {
    if (isComplete) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onComplete();
    }
  }, [isComplete, onComplete]);

  const togglePlayPause = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsRunning((prev) => !prev);
  }, []);

  const handleSkip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSkip();
  }, [onSkip]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.progressTrack}>
        {Array.from({ length: totalMovements }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index < movementIndex && { backgroundColor: sessionColor },
              index === movementIndex && { backgroundColor: sessionColor, transform: [{ scale: 1.3 }] },
            ]}
          />
        ))}
      </View>

      <Text style={styles.movementCount}>
        {movementIndex + 1} of {totalMovements}
      </Text>

      {movement.image && (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: movement.image }}
            style={styles.exerciseImage}
            resizeMode="contain"
          />
        </View>
      )}

      <Animated.View style={[styles.timerCircle, { transform: [{ scale: pulseAnim }] }]}>
        <View style={[styles.timerInner, { borderColor: sessionColor }]}>
          <Text style={styles.movementName}>{movement.name}</Text>
          <Text style={[styles.timer, { color: sessionColor }]}>{formatTime(timeRemaining)}</Text>
        </View>
      </Animated.View>

      <View style={styles.instructionContainer}>
        <Text style={styles.instruction}>{movement.instruction}</Text>
        {movement.breathCue && (
          <Text style={[styles.breathCue, { color: sessionColor }]}>{movement.breathCue}</Text>
        )}
      </View>

      <View style={styles.controls}>
        <Pressable style={styles.controlButton} onPress={togglePlayPause}>
          <View style={[styles.playButton, { backgroundColor: sessionColor }]}>
            {isRunning ? (
              <Pause size={28} color={Colors.card} />
            ) : (
              <Play size={28} color={Colors.card} style={{ marginLeft: 3 }} />
            )}
          </View>
        </Pressable>
        <Pressable style={styles.skipButton} onPress={handleSkip}>
          <SkipForward size={24} color={Colors.textMuted} />
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      <View style={styles.progressBarContainer}>
        <Animated.View
          style={[styles.progressBar, { width: progress, backgroundColor: sessionColor }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  progressTrack: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.sandMuted,
  },
  movementCount: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 32,
  },
  imageContainer: {
    width: 160,
    height: 120,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.sandMuted,
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
  },
  timerCircle: {
    marginBottom: 24,
  },
  timerInner: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: Colors.card,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  movementName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 6,
    paddingHorizontal: 12,
  },
  timer: {
    fontSize: 40,
    fontWeight: '700' as const,
    fontVariant: ['tabular-nums'],
  },
  instructionContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  instruction: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 12,
  },
  breathCue: {
    fontSize: 15,
    fontWeight: '500' as const,
    fontStyle: 'italic' as const,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
    marginBottom: 32,
  },
  controlButton: {
    alignItems: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 12,
  },
  skipText: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    backgroundColor: Colors.sandMuted,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
});
