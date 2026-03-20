export interface AnalyticsEvent {
  id?: number;
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
