import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { AnalyticsEvent } from './types';
import { insertEvents, getRecentEvents, getDashboardSummary } from './db';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  // Capture the original res.send
  const originalSend = res.send;

  // Override res.send to log the response
  res.send = function (data: any) {
    const duration = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);

    // Call the original send
    return originalSend.call(this, data);
  };

  next();
});

// Routes

/**
 * POST /api/events
 * Batch insert analytics events
 */
app.post('/api/events', (req: Request, res: Response) => {
  try {
    const { events } = req.body;

    if (!Array.isArray(events)) {
      return res.status(400).json({ error: 'events must be an array' });
    }

    if (events.length === 0) {
      return res.json({ success: true, count: 0 });
    }

    // Validate events
    const validatedEvents: AnalyticsEvent[] = events.map((event: any) => ({
      eventName: event.eventName,
      timestamp: event.timestamp,
      sessionId: event.sessionId,
      userId: event.userId,
      projectId: event.projectId,
      frameId: event.frameId,
      frameType: event.frameType,
      metadata: event.metadata,
    }));

    insertEvents(validatedEvents);

    return res.json({ success: true, count: validatedEvents.length });
  } catch (error) {
    console.error('Error inserting events:', error);
    return res.status(500).json({ error: 'Failed to insert events' });
  }
});

/**
 * GET /api/events
 * Get recent events
 */
app.get('/api/events', (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 1000);

    const events = getRecentEvents(limit);

    return res.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    return res.status(500).json({ error: 'Failed to fetch events' });
  }
});

/**
 * GET /api/dashboard/summary
 * Get dashboard analytics summary
 */
app.get('/api/dashboard/summary', (req: Request, res: Response) => {
  try {
    const summary = getDashboardSummary();

    return res.json(summary);
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard summary' });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req: Request, res: Response) => {
  return res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Strype Analytics Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
