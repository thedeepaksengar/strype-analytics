import { ref } from 'vue';
import type { AnalyticsEvent, EventName } from '../types/events';

function generateId(): string {
  // Use crypto.randomUUID if available, otherwise fallback
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

const sessionId = ref(generateId());
const userId = ref('anon-' + generateId().slice(0, 8));
const projectId = ref('project-' + generateId().slice(0, 8));
const eventBuffer = ref<AnalyticsEvent[]>([]);
const FLUSH_INTERVAL = 5000;
const API_BASE = '/api';

function createEvent(eventName: EventName, extra?: Partial<AnalyticsEvent>): AnalyticsEvent {
  return {
    eventName,
    timestamp: new Date().toISOString(),
    sessionId: sessionId.value,
    userId: userId.value,
    projectId: projectId.value,
    ...extra,
  };
}

function track(eventName: EventName, extra?: Partial<AnalyticsEvent>) {
  const event = createEvent(eventName, extra);
  eventBuffer.value.push(event);
  console.debug(`[Instrumentation] ${eventName}`, extra || '');
}

async function flush() {
  if (eventBuffer.value.length === 0) return;
  const events = [...eventBuffer.value];
  eventBuffer.value = [];
  try {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
    });
    if (!res.ok) {
      // Re-add failed events
      eventBuffer.value.unshift(...events);
    }
  } catch (e) {
    // Re-add failed events on network error
    eventBuffer.value.unshift(...events);
    console.warn('[Instrumentation] Flush failed, events re-queued', e);
  }
}

export function useInstrumentation() {
  let flushTimer: ReturnType<typeof setInterval> | null = null;

  function startSession() {
    track('session_started');
    flushTimer = setInterval(flush, FLUSH_INTERVAL);

    window.addEventListener('beforeunload', () => {
      track('session_ended');
      const events = [...eventBuffer.value];
      if (events.length > 0) {
        // Use sendBeacon for reliable delivery on page unload
        const blob = new Blob([JSON.stringify({ events })], { type: 'application/json' });
        navigator.sendBeacon(`${API_BASE}/events`, blob);
      }
    });
  }

  function stopSession() {
    if (flushTimer) clearInterval(flushTimer);
    track('session_ended');
    flush();
  }

  return { track, flush, startSession, stopSession, sessionId, userId, projectId };
}
