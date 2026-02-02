import { CheckInState, Session, SessionType } from '@/types';
import { allSessions } from '@/mocks/sessions';

export function determineSessionType(checkIn: CheckInState): SessionType {
  const { energy, body, mind } = checkIn;
  
  if (energy === 'low' || body === 'sore' || mind === 'stressed') {
    return 'reset';
  }
  
  if (energy === 'high' && body === 'ok' && (mind === 'calm' || mind === 'neutral')) {
    return 'build';
  }
  
  return 'flow';
}

export function findMatchingSession(checkIn: CheckInState): Session {
  const { energy, body, mind } = checkIn;
  const targetType = determineSessionType(checkIn);
  
  const matchingSessions = allSessions.filter(session => {
    if (session.type !== targetType) return false;
    
    const energyMatch = energy && session.suitableFor.energy.includes(energy);
    const bodyMatch = body && session.suitableFor.body.includes(body);
    const mindMatch = mind && session.suitableFor.mind.includes(mind);
    
    return energyMatch && bodyMatch && mindMatch;
  });
  
  if (matchingSessions.length > 0) {
    const randomIndex = Math.floor(Math.random() * matchingSessions.length);
    return matchingSessions[randomIndex];
  }
  
  const typeSessions = allSessions.filter(s => s.type === targetType);
  const randomIndex = Math.floor(Math.random() * typeSessions.length);
  return typeSessions[randomIndex];
}

export function getSessionTypeInfo(type: SessionType): { label: string; description: string; color: string } {
  switch (type) {
    case 'reset':
      return {
        label: 'Reset',
        description: 'Mobility + breath',
        color: '#B8A9C4',
      };
    case 'flow':
      return {
        label: 'Flow',
        description: 'Gentle strength + movement',
        color: '#8FA886',
      };
    case 'build':
      return {
        label: 'Build',
        description: 'Light strength',
        color: '#C4907A',
      };
  }
}
