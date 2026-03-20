<template>
  <div class="dashboard">
    <div class="dashboard-container">
      <!-- Header -->
      <div class="dashboard-header">
        <h1>Analytics Dashboard</h1>
        <p class="dashboard-subtitle">Real-time instrumentation data from Strype frame-based editor</p>
        <button v-if="!autoRefreshing" class="refresh-btn" @click="toggleAutoRefresh">
          Enable auto-refresh
        </button>
        <button v-else class="refresh-btn refresh-active" @click="toggleAutoRefresh">
          ✓ Auto-refreshing (10s)
        </button>
      </div>

      <!-- Metric Cards -->
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-accent metric-accent-sessions"></div>
          <div class="metric-content">
            <div class="metric-number">{{ summary?.totalSessions ?? 0 }}</div>
            <div class="metric-label">Total Sessions</div>
            <div class="metric-icon">📊</div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-accent metric-accent-events"></div>
          <div class="metric-content">
            <div class="metric-number">{{ summary?.totalEvents ?? 0 }}</div>
            <div class="metric-label">Total Events</div>
            <div class="metric-icon">⚡</div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-accent metric-accent-frames"></div>
          <div class="metric-content">
            <div class="metric-number">{{ summary?.totalFramesAdded ?? 0 }}</div>
            <div class="metric-label">Frames Added</div>
            <div class="metric-icon">📦</div>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-accent metric-accent-duration"></div>
          <div class="metric-content">
            <div class="metric-number">{{ formattedDuration }}</div>
            <div class="metric-label">Avg Session Duration</div>
            <div class="metric-icon">⏱</div>
          </div>
        </div>
      </div>

      <!-- Analysis Panels -->
      <div class="analysis-grid">
        <!-- Frame Type Usage -->
        <div class="analysis-panel">
          <h2 class="panel-title">Frame Type Usage</h2>
          <div class="frame-usage-chart">
            <div v-if="summary && summary.frameTypeUsage.length > 0" class="chart-bars">
              <div
                v-for="item in summary.frameTypeUsage"
                :key="item.type"
                class="chart-bar-row"
              >
                <div class="chart-label">{{ item.type }}</div>
                <div class="chart-bar-container">
                  <div
                    class="chart-bar"
                    :class="`chart-bar-${item.type}`"
                    :style="{ width: chartBarWidth(item.count) + '%' }"
                  ></div>
                  <div class="chart-count">{{ item.count }}</div>
                </div>
              </div>
            </div>
            <div v-else class="chart-empty">
              No frame data yet
            </div>
          </div>
        </div>

        <!-- Session Metrics -->
        <div class="analysis-panel">
          <h2 class="panel-title">Session Metrics</h2>
          <div class="metrics-stats">
            <div class="stat-row">
              <div class="stat-label">Edits Before Run</div>
              <div class="stat-value">{{ summary?.editsBeforeRun ?? 0 }}</div>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-row">
              <div class="stat-label">Run Attempts Per Session</div>
              <div class="stat-value">{{ (summary?.runAttemptsPerSession ?? 0).toFixed(1) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Event Timeline -->
      <div class="timeline-panel">
        <h2 class="panel-title">Recent Events</h2>
        <div v-if="summary && summary.recentEvents.length > 0" class="timeline-list">
          <div v-for="event in summary.recentEvents" :key="event.timestamp + event.eventName" class="timeline-item">
            <div class="timeline-time">{{ formatRelativeTime(event.timestamp) }}</div>
            <div class="timeline-event">
              <span class="event-badge" :class="`event-badge-${eventBadgeType(event.eventName)}`">
                {{ formatEventName(event.eventName) }}
              </span>
              <span v-if="event.frameType" class="event-frame-type">{{ event.frameType }}</span>
              <span class="event-session">{{ event.sessionId.slice(0, 8) }}</span>
            </div>
          </div>
        </div>
        <div v-else class="timeline-empty">
          No events recorded yet
        </div>
      </div>

      <!-- Research Note -->
      <div class="research-note">
        <h3>📊 Research Questions This Data Can Answer</h3>
        <ul class="research-list">
          <li>Where do learners hesitate most?</li>
          <li>Which constructs are used most frequently?</li>
          <li>How many edits occur before running?</li>
          <li>Do certain frame types cause more confusion?</li>
          <li>Does structured editing reduce common syntax mistakes?</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useInstrumentation } from '../composables/useInstrumentation'
import type { DashboardSummary } from '../types/events'

const { track } = useInstrumentation()

const summary = ref<DashboardSummary | null>(null)
const autoRefreshing = ref(false)
let refreshInterval: ReturnType<typeof setInterval> | null = null

const formattedDuration = computed(() => {
  const ms = summary.value?.avgSessionDurationMs ?? 0
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const secs = seconds % 60
  return minutes > 0 ? `${minutes}m ${secs}s` : `${secs}s`
})

function formatEventName(eventName: string): string {
  return eventName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function eventBadgeType(eventName: string): string {
  if (eventName.includes('frame')) return 'frame'
  if (eventName.includes('run')) return 'run'
  if (eventName.includes('save')) return 'save'
  if (eventName.includes('error')) return 'error'
  return 'default'
}

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return `${Math.max(0, seconds)}s ago`
}

function chartBarWidth(count: number): number {
  const maxCount = summary.value?.frameTypeUsage.reduce((max, item) => Math.max(max, item.count), 0) ?? 1
  return (count / Math.max(maxCount, 1)) * 100
}

async function loadDashboardData() {
  try {
    const response = await fetch('/api/dashboard/summary')
    if (response.ok) {
      summary.value = await response.json()
    }
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  }
}

function toggleAutoRefresh() {
  autoRefreshing.value = !autoRefreshing.value
  if (autoRefreshing.value) {
    refreshInterval = setInterval(loadDashboardData, 10000)
    loadDashboardData()
  } else {
    if (refreshInterval) clearInterval(refreshInterval)
  }
}

onMounted(() => {
  track('dashboard_viewed')
  loadDashboardData()
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})
</script>

<style scoped>
.dashboard {
  background-color: var(--color-bg-editor);
  min-height: 100vh;
}

.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 24px;
}

.dashboard-header {
  margin-bottom: 40px;
  position: relative;
}

.dashboard-header h1 {
  margin-bottom: 8px;
  color: var(--color-text-primary);
}

.dashboard-subtitle {
  color: var(--color-text-secondary);
  margin-bottom: 20px;
}

.refresh-btn {
  padding: 8px 16px;
  background-color: var(--color-accent);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition);
  position: absolute;
  top: 0;
  right: 0;
}

.refresh-btn:hover {
  background-color: var(--color-accent-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.refresh-active {
  background-color: var(--color-frame-funccall);
}

.refresh-active:hover {
  background-color: #059669;
}

/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.metric-card {
  background-color: var(--color-bg-frame);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: all var(--transition);
  position: relative;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.metric-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.metric-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.metric-accent-sessions {
  background-color: var(--color-frame-if);
}

.metric-accent-events {
  background-color: var(--color-frame-for);
}

.metric-accent-frames {
  background-color: var(--color-frame-funccall);
}

.metric-accent-duration {
  background-color: var(--color-frame-varassign);
}

.metric-content {
  flex: 1;
  padding-top: 4px;
}

.metric-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: 4px;
}

.metric-label {
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}

.metric-icon {
  font-size: 1.8rem;
  opacity: 0.6;
}

/* Analysis Grid */
.analysis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.analysis-panel {
  background-color: var(--color-bg-frame);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: 24px;
}

.panel-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: 20px;
}

/* Frame Usage Chart */
.frame-usage-chart {
  display: flex;
  flex-direction: column;
}

.chart-bars {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chart-bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chart-label {
  min-width: 80px;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: capitalize;
  color: var(--color-text-secondary);
}

.chart-bar-container {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.chart-bar {
  height: 24px;
  border-radius: var(--radius-sm);
  transition: all var(--transition);
  min-width: 20px;
}

.chart-bar-funccall {
  background-color: var(--color-frame-funccall);
}

.chart-bar-if {
  background-color: var(--color-frame-if);
}

.chart-bar-for {
  background-color: var(--color-frame-for);
}

.chart-bar-varassign {
  background-color: var(--color-frame-varassign);
}

.chart-bar-comment {
  background-color: var(--color-frame-comment);
}

.chart-count {
  min-width: 30px;
  text-align: right;
  font-weight: 600;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.chart-empty {
  padding: 32px 0;
  text-align: center;
  color: var(--color-text-secondary);
}

/* Metrics Stats */
.metrics-stats {
  display: flex;
  flex-direction: column;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}

.stat-label {
  color: var(--color-text-secondary);
  font-size: 0.95rem;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-accent);
}

.stat-divider {
  height: 1px;
  background-color: var(--color-border);
}

/* Timeline Panel */
.timeline-panel {
  background-color: var(--color-bg-frame);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: 24px;
  margin-bottom: 32px;
}

.timeline-list {
  max-height: 400px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.timeline-item {
  display: flex;
  gap: 16px;
  padding: 12px;
  background-color: var(--color-bg-editor);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--color-accent);
  transition: all var(--transition);
}

.timeline-item:hover {
  background-color: rgba(99, 102, 241, 0.02);
}

.timeline-time {
  min-width: 60px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  font-family: var(--font-code);
}

.timeline-event {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  flex-wrap: wrap;
}

.event-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.event-badge-frame {
  background-color: rgba(16, 185, 129, 0.1);
  color: var(--color-frame-funccall);
}

.event-badge-run {
  background-color: rgba(59, 130, 246, 0.1);
  color: var(--color-frame-if);
}

.event-badge-save {
  background-color: rgba(139, 92, 246, 0.1);
  color: var(--color-frame-for);
}

.event-badge-error {
  background-color: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.event-badge-default {
  background-color: rgba(100, 116, 139, 0.1);
  color: var(--color-text-secondary);
}

.event-frame-type {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: capitalize;
}

.event-session {
  font-size: 0.75rem;
  font-family: var(--font-code);
  color: var(--color-text-secondary);
  opacity: 0.7;
}

.timeline-empty {
  padding: 40px 0;
  text-align: center;
  color: var(--color-text-secondary);
}

/* Research Note */
.research-note {
  background-color: rgba(99, 102, 241, 0.05);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: var(--radius-md);
  padding: 24px;
}

.research-note h3 {
  font-size: 1rem;
  margin-bottom: 16px;
  color: var(--color-text-primary);
}

.research-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.research-list li {
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  padding-left: 24px;
  position: relative;
}

.research-list li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: var(--color-accent);
  font-weight: 600;
}
</style>
