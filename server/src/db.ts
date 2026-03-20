import Database from 'better-sqlite3';
import path from 'path';
import { AnalyticsEvent, DashboardSummary } from './types';

const dbPath = path.join(process.cwd(), 'strype_analytics.db');
const db = new Database(dbPath);

// Enable foreign keys and WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize database schema
function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_name TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      session_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      project_id TEXT NOT NULL,
      frame_id TEXT,
      frame_type TEXT,
      metadata TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_session_id ON events(session_id);
    CREATE INDEX IF NOT EXISTS idx_event_name ON events(event_name);
    CREATE INDEX IF NOT EXISTS idx_timestamp ON events(timestamp);
  `);
}

initializeDatabase();

export function insertEvent(event: AnalyticsEvent): void {
  const stmt = db.prepare(`
    INSERT INTO events (
      event_name,
      timestamp,
      session_id,
      user_id,
      project_id,
      frame_id,
      frame_type,
      metadata
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const metadata = event.metadata ? JSON.stringify(event.metadata) : null;

  stmt.run(
    event.eventName,
    event.timestamp,
    event.sessionId,
    event.userId,
    event.projectId,
    event.frameId || null,
    event.frameType || null,
    metadata
  );
}

export function insertEvents(events: AnalyticsEvent[]): void {
  const stmt = db.prepare(`
    INSERT INTO events (
      event_name,
      timestamp,
      session_id,
      user_id,
      project_id,
      frame_id,
      frame_type,
      metadata
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertMany = db.transaction((eventsToInsert: AnalyticsEvent[]) => {
    for (const event of eventsToInsert) {
      const metadata = event.metadata ? JSON.stringify(event.metadata) : null;
      stmt.run(
        event.eventName,
        event.timestamp,
        event.sessionId,
        event.userId,
        event.projectId,
        event.frameId || null,
        event.frameType || null,
        metadata
      );
    }
  });

  insertMany(events);
}

export function getRecentEvents(limit: number = 100): AnalyticsEvent[] {
  const stmt = db.prepare(`
    SELECT
      id,
      event_name as eventName,
      timestamp,
      session_id as sessionId,
      user_id as userId,
      project_id as projectId,
      frame_id as frameId,
      frame_type as frameType,
      metadata
    FROM events
    ORDER BY timestamp DESC
    LIMIT ?
  `);

  const rows = stmt.all(limit) as any[];

  return rows.map((row) => ({
    id: row.id,
    eventName: row.eventName,
    timestamp: row.timestamp,
    sessionId: row.sessionId,
    userId: row.userId,
    projectId: row.projectId,
    frameId: row.frameId,
    frameType: row.frameType,
    metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
  }));
}

export function getDashboardSummary(): DashboardSummary {
  // Total sessions
  const totalSessionsResult = db
    .prepare('SELECT COUNT(DISTINCT session_id) as count FROM events')
    .get() as { count: number };
  const totalSessions = totalSessionsResult.count;

  // Total events
  const totalEventsResult = db
    .prepare('SELECT COUNT(*) as count FROM events')
    .get() as { count: number };
  const totalEvents = totalEventsResult.count;

  // Total frames added
  const totalFramesResult = db
    .prepare(
      "SELECT COUNT(*) as count FROM events WHERE event_name = 'frame_added'"
    )
    .get() as { count: number };
  const totalFramesAdded = totalFramesResult.count;

  // Average session duration
  const sessionDurationsResult = db
    .prepare(
      `
    SELECT AVG(duration) as avgDuration FROM (
      SELECT
        session_id,
        (julianday(MAX(timestamp)) - julianday(MIN(timestamp))) * 24 * 60 * 60 * 1000 as duration
      FROM events
      GROUP BY session_id
    )
  `
    )
    .get() as { avgDuration: number | null };
  const avgSessionDurationMs = Math.round(sessionDurationsResult.avgDuration || 0);

  // Frame type usage
  const frameTypeUsageResult = db
    .prepare(
      `
    SELECT frame_type as type, COUNT(*) as count
    FROM events
    WHERE event_name = 'frame_added' AND frame_type IS NOT NULL
    GROUP BY frame_type
    ORDER BY count DESC
  `
    )
    .all() as { type: string; count: number }[];
  const frameTypeUsage = frameTypeUsageResult;

  // Edits before run - calculate average edits before each run in a session
  const editsBeforeRunResult = db
    .prepare(
      `
    WITH session_events AS (
      SELECT
        session_id,
        event_name,
        ROW_NUMBER() OVER (PARTITION BY session_id ORDER BY timestamp) as rn
      FROM events
    ),
    run_positions AS (
      SELECT session_id, rn as run_rn
      FROM session_events
      WHERE event_name = 'program_run_clicked'
    ),
    edits_before_runs AS (
      SELECT
        COUNT(*) as edits
      FROM session_events se
      JOIN run_positions rp ON se.session_id = rp.session_id
      WHERE se.event_name = 'frame_edited' AND se.rn < rp.run_rn
      GROUP BY se.session_id, rp.run_rn
    )
    SELECT AVG(edits) as avgEdits FROM edits_before_runs
  `
    )
    .get() as { avgEdits: number | null };
  const editsBeforeRun = Math.round(editsBeforeRunResult.avgEdits || 0);

  // Run attempts per session
  const runAttemptsResult = db
    .prepare(
      `
    SELECT
      CAST(COUNT(*) AS FLOAT) / COUNT(DISTINCT session_id) as avgRuns
    FROM events
    WHERE event_name = 'program_run_clicked'
  `
    )
    .get() as { avgRuns: number | null };
  const runAttemptsPerSession = Math.round(runAttemptsResult.avgRuns || 0);

  // Recent events (last 50)
  const recentEvents = getRecentEvents(50);

  return {
    totalSessions,
    totalEvents,
    totalFramesAdded,
    avgSessionDurationMs,
    frameTypeUsage,
    editsBeforeRun,
    runAttemptsPerSession,
    recentEvents,
  };
}

export function closeDatabase(): void {
  db.close();
}

export default db;
