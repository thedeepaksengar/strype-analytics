export interface AnalyticsEvent {
  eventName: EventName;
  timestamp: string;
  sessionId: string;
  userId: string;
  projectId: string;
  frameId?: string;
  frameType?: string;
  metadata?: Record<string, any>;
}

export type EventName =
  | 'session_started'
  | 'session_ended'
  | 'frame_added'
  | 'frame_deleted'
  | 'frame_edited'
  | 'frame_moved'
  | 'program_run_clicked'
  | 'program_saved'
  | 'error_shown'
  | 'dashboard_viewed';

export type FrameType = 'funccall' | 'if' | 'for' | 'varassign' | 'comment';

export interface Frame {
  id: string;
  type: FrameType;
  fields: Record<string, string>;
  order: number;
}

export interface DashboardSummary {
  totalSessions: number;
  totalEvents: number;
  totalFramesAdded: number;
  avgSessionDurationMs: number;
  frameTypeUsage: { type: string; count: number }[];
  editsBeforeRun: number;
  runAttemptsPerSession: number;
  recentEvents: AnalyticsEvent[];
}

export const FRAME_CONFIGS: Record<FrameType, { label: string; color: string; icon: string; fields: { key: string; placeholder: string }[] }> = {
  funccall: {
    label: 'print',
    color: '#10b981',
    icon: '⟩',
    fields: [{ key: 'expression', placeholder: 'expression' }]
  },
  if: {
    label: 'if',
    color: '#3b82f6',
    icon: '◇',
    fields: [{ key: 'condition', placeholder: 'condition' }]
  },
  for: {
    label: 'for',
    color: '#8b5cf6',
    icon: '↻',
    fields: [
      { key: 'variable', placeholder: 'variable' },
      { key: 'iterable', placeholder: 'iterable' }
    ]
  },
  varassign: {
    label: 'var =',
    color: '#f59e0b',
    icon: '←',
    fields: [
      { key: 'name', placeholder: 'variable name' },
      { key: 'value', placeholder: 'value' }
    ]
  },
  comment: {
    label: '#',
    color: '#6b7280',
    icon: '#',
    fields: [{ key: 'text', placeholder: 'comment text' }]
  }
};
