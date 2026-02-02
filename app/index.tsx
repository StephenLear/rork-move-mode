import React, { useRef, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sparkles, Flame } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import CheckInSection from '@/components/CheckInSection';
import SessionPreview from '@/components/SessionPreview';
import { EnergyLevel, BodyState, MentalState } from '@/types';

const energyOptions = [
  { value: 'low' as EnergyLevel, label: 'Low' },
  { value: 'medium' as EnergyLevel, label: 'Medium' },
  { value: 'high' as EnergyLevel, label: 'High' },
];

const bodyOptions = [
  { value: 'tight' as BodyState, label: 'Tight' },
  { value: 'ok' as BodyState, label: 'OK' },
  { value: 'sore' as BodyState, label: 'Sore' },
];

const mindOptions = [
  { value: 'stressed' as MentalState, label: 'Stressed' },
  { value: 'neutral' as MentalState, label: 'Neutral' },
  { value: 'calm' as MentalState, label: 'Calm' },
];

export default function CheckInScreen() {
  const router = useRouter();
  const { checkIn, updateCheckIn, isCheckInComplete, generateSession, currentSession, currentStreak, streakLoaded, completedToday } = useApp();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isCheckInComplete && !currentSession) {
      generateSession();
    }
  }, [isCheckInComplete, currentSession, generateSession]);

  const handleStartSession = () => {
    if (currentSession) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push('/session');
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.header,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <View style={styles.headerRow}>
              <View style={styles.logoContainer}>
                <View style={styles.logoCircle}>
                  <Sparkles size={24} color={Colors.sage} />
                </View>
              </View>
              {streakLoaded && currentStreak > 0 && (
                <View style={styles.streakBadge}>
                  <Flame size={16} color={Colors.terracotta} fill={completedToday ? Colors.terracotta : 'transparent'} />
                  <Text style={styles.streakText}>{currentStreak}</Text>
                </View>
              )}
            </View>
            <Text style={styles.title}>
              {completedToday ? 'Welcome back' : 'How are you feeling?'}
            </Text>
            <Text style={styles.subtitle}>
              {completedToday ? 'Ready to move again?' : 'No wrong answers. Just check in.'}
            </Text>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim }}>
            <CheckInSection
              title="Energy"
              subtitle="How's your battery today?"
              options={energyOptions}
              selectedValue={checkIn.energy}
              onSelect={(value) => updateCheckIn({ energy: value })}
              color={Colors.terracotta}
            />

            <CheckInSection
              title="Body"
              subtitle="How does your body feel?"
              options={bodyOptions}
              selectedValue={checkIn.body}
              onSelect={(value) => updateCheckIn({ body: value })}
              color={Colors.sage}
            />

            <CheckInSection
              title="Mind"
              subtitle="What's your mental state?"
              options={mindOptions}
              selectedValue={checkIn.mind}
              onSelect={(value) => updateCheckIn({ mind: value })}
              color={Colors.lavender}
            />

            {currentSession && (
              <SessionPreview 
                session={currentSession} 
                onStart={handleStartSession}
              />
            )}
          </Animated.View>

          <View style={styles.spacer} />
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoContainer: {
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.terracottaLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  streakText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.terracotta,
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.sageLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textMuted,
  },
  spacer: {
    height: 40,
  },
});
