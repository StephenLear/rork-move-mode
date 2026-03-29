import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CheckInState, Session } from '@/types';
import { findMatchingSession } from '@/utils/sessionMatcher';

const STREAK_KEY = 'movemode_streak';
const LAST_SESSION_KEY = 'movemode_last_session_date';

export const [AppProvider, useApp] = createContextHook(() => {
  const [checkIn, setCheckIn] = useState<CheckInState>({
    energy: null,
    body: null,
    mind: null,
  });
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [currentMovementIndex, setCurrentMovementIndex] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [lastSessionDate, setLastSessionDate] = useState<string | null>(null);
  const [streakLoaded, setStreakLoaded] = useState(false);

  useEffect(() => {
    loadStreakData();
  }, []);

  const loadStreakData = async () => {
    try {
      const streakStr = await AsyncStorage.getItem(STREAK_KEY);
      const lastDateStr = await AsyncStorage.getItem(LAST_SESSION_KEY);
      
      if (streakStr) {
        setCurrentStreak(parseInt(streakStr, 10));
      }
      if (lastDateStr) {
        setLastSessionDate(lastDateStr);
      }
      setStreakLoaded(true);
    } catch (error) {
      console.log('Error loading streak data:', error);
      setStreakLoaded(true);
    }
  };

  const getDateString = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const calculateStreak = useCallback((lastDate: string | null, currentStreakValue: number): number => {
    const today = getDateString(new Date());
    
    if (!lastDate) {
      return 1;
    }
    
    if (lastDate === today) {
      return currentStreakValue;
    }
    
    const lastDateObj = new Date(lastDate);
    const todayObj = new Date(today);
    const diffTime = todayObj.getTime() - lastDateObj.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return currentStreakValue + 1;
    } else if (diffDays > 1) {
      return 1;
    }
    
    return currentStreakValue;
  }, []);

  const recordSessionCompletion = useCallback(async () => {
    const today = getDateString(new Date());
    
    if (lastSessionDate === today) {
      return;
    }
    
    const newStreak = calculateStreak(lastSessionDate, currentStreak);
    
    try {
      await AsyncStorage.setItem(STREAK_KEY, newStreak.toString());
      await AsyncStorage.setItem(LAST_SESSION_KEY, today);
      setCurrentStreak(newStreak);
      setLastSessionDate(today);
    } catch (error) {
      console.log('Error saving streak data:', error);
    }
  }, [lastSessionDate, currentStreak, calculateStreak]);

  const updateCheckIn = useCallback((updates: Partial<CheckInState>) => {
    setCheckIn(prev => ({ ...prev, ...updates }));
  }, []);

  const resetCheckIn = useCallback(() => {
    setCheckIn({ energy: null, body: null, mind: null });
    setCurrentSession(null);
    setCurrentMovementIndex(0);
  }, []);

  const generateSession = useCallback(() => {
    if (checkIn.energy && checkIn.body && checkIn.mind) {
      const session = findMatchingSession(checkIn);
      setCurrentSession(session);
      setCurrentMovementIndex(0);
      return session;
    }
    return null;
  }, [checkIn]);

  const nextMovement = useCallback(() => {
    if (currentSession && currentMovementIndex < currentSession.movements.length - 1) {
      setCurrentMovementIndex(prev => prev + 1);
      return true;
    }
    return false;
  }, [currentSession, currentMovementIndex]);

  const isCheckInComplete = checkIn.energy !== null && checkIn.body !== null && checkIn.mind !== null;

  const completedToday = lastSessionDate === getDateString(new Date());

  return {
    checkIn,
    updateCheckIn,
    resetCheckIn,
    currentSession,
    generateSession,
    currentMovementIndex,
    nextMovement,
    isCheckInComplete,
    currentStreak,
    streakLoaded,
    completedToday,
    recordSessionCompletion,
  };
});
