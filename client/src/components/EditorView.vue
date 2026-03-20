<template>
  <div class="editor-layout">
    <!-- Left Sidebar: Frame Palette -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h3>Frames</h3>
        <p class="sidebar-subtitle">Click to add</p>
      </div>

      <div class="frame-palette">
        <button
          v-for="(config, frameType) in frameConfigs"
          :key="frameType"
          class="frame-palette-btn"
          :style="{ '--accent-color': config.color }"
          @click="addFrame(frameType as FrameType)"
          :title="`Add ${config.label} frame`"
        >
          <span class="palette-icon">{{ config.icon }}</span>
          <span class="palette-label">{{ config.label }}</span>
          <span class="palette-shortcut">{{ frameType.charAt(0).toUpperCase() }}</span>
        </button>
      </div>

      <div class="sidebar-footer">
        <div class="sidebar-stats">
          <div class="stat-mini">
            <span class="stat-mini-value">{{ frames.length }}</span>
            <span class="stat-mini-label">frames</span>
          </div>
          <div class="stat-mini">
            <span class="stat-mini-value">{{ editCount }}</span>
            <span class="stat-mini-label">edits</span>
          </div>
        </div>
        <div class="python-status" :class="{ ready: pythonReady, loading: pythonLoading }">
          <span class="status-dot"></span>
          <span v-if="pythonLoading">Loading Python...</span>
          <span v-else-if="pythonReady">Python ready</span>
          <span v-else>Python idle</span>
        </div>
      </div>
    </aside>

    <!-- Center: Editor + Output -->
    <div class="editor-main">
      <div class="editor-header">
        <div class="file-info">
          <span class="file-icon">📄</span>
          <span class="file-label">main.py</span>
          <span v-if="editCount > 0" class="edit-badge">{{ editCount }} edits</span>
        </div>
        <div class="header-actions">
          <span class="event-counter">{{ eventCount }} events tracked</span>
        </div>
      </div>

      <!-- Scrollable area: frames + output -->
      <div class="editor-body">
        <!-- Frame Canvas -->
        <div class="editor-canvas" :class="{ 'canvas-shrunk': consoleOpen }">
          <div v-if="frames.length === 0" class="empty-state">
            <div class="empty-visual">
              <div class="empty-frame-preview">
                <div class="preview-line"></div>
                <div class="preview-line short"></div>
                <div class="preview-line"></div>
              </div>
            </div>
            <h3>Start building your program</h3>
            <p>Click a frame type from the palette to add it here</p>
          </div>

          <TransitionGroup v-else name="frame-list" tag="div" class="frames-list">
            <FrameBlock
              v-for="frame in frames"
              :key="frame.id"
              :frame="frame"
              @edit="onFrameEdit(frame.id)"
              @delete="deleteFrame(frame.id)"
              @moveUp="moveFrame(frame.id, 'up')"
              @moveDown="moveFrame(frame.id, 'down')"
            />
          </TransitionGroup>
        </div>

        <!-- Output Console (appears on Run) -->
        <div v-if="consoleOpen" class="console-panel">
          <div class="console-header">
            <div class="console-title">
              <span class="console-icon">▶</span>
              <span>Output</span>
              <span class="console-status" :class="runStatus">{{ runStatusText }}</span>
            </div>
            <div class="console-actions">
              <button class="console-btn" @click="runProgram" :disabled="pythonRunning" title="Re-run">↻ Re-run</button>
              <button class="console-btn console-btn-close" @click="consoleOpen = false" title="Close">✕</button>
            </div>
          </div>
          <div class="console-body" ref="consoleBody">
            <div
              v-for="(line, i) in consoleOutput"
              :key="i"
              class="console-line"
              :class="line.type"
            >
              <span v-if="line.type === 'prompt'" class="line-prompt">&gt;&gt;&gt; </span>
              <span v-if="line.type === 'error'" class="line-error-icon">✕ </span>
              <span>{{ line.text }}</span>
            </div>
          </div>
          <div class="console-source">
            <div class="source-header">Generated Python:</div>
            <pre class="source-code">{{ generatedCode }}</pre>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <footer class="bottom-bar">
      <div class="bar-left">
        <button class="btn btn-run" @click="runProgram" :disabled="pythonRunning">
          <span class="btn-icon" v-if="!pythonRunning">▶</span>
          <span class="btn-icon spinner" v-else></span>
          {{ pythonRunning ? 'Running...' : 'Run' }}
        </button>
        <button class="btn btn-save" @click="saveProgram">
          <span class="btn-icon">💾</span> Save
        </button>
      </div>

      <div class="bar-center">
        <div class="code-preview" v-if="frames.length > 0">
          {{ frames.length }} frame{{ frames.length !== 1 ? 's' : '' }} · {{ generatedLineCount }} lines
        </div>
      </div>

      <div class="bar-right">
        <router-link to="/dashboard" class="btn btn-dashboard">
          📊 View Dashboard
        </router-link>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick, onMounted } from 'vue'
import { useInstrumentation } from '../composables/useInstrumentation'
import { usePythonRunner } from '../composables/usePythonRunner'
import type { Frame, FrameType } from '../types/events'
import { FRAME_CONFIGS } from '../types/events'
import FrameBlock from './FrameBlock.vue'

const { track } = useInstrumentation()
const { runPython, isRunning: pythonRunning, isLoading: pythonLoading, isReady: pythonReady, preload } = usePythonRunner()

const frames = reactive<Frame[]>([])
const editCount = ref(0)
const eventCount = ref(1) // session_started

const consoleOpen = ref(false)
const consoleOutput = ref<{ text: string; type: 'output' | 'error' | 'info' | 'prompt' }[]>([])
const generatedCode = ref('')
const runStatus = ref<'success' | 'error' | 'running'>('success')
const runStatusText = ref('Finished')
const consoleBody = ref<HTMLElement | null>(null)

const frameConfigs = FRAME_CONFIGS

// Preload Pyodide in the background so it's ready when user clicks Run
onMounted(() => {
  // Delay preload slightly so the UI renders first
  setTimeout(() => { preload().catch(() => {}) }, 2000)
})

let frameCounter = 0
function generateId(): string {
  return `frame-${Date.now()}-${++frameCounter}`
}

const generatedLineCount = computed(() => {
  return frames.reduce((count, frame) => {
    if (frame.type === 'if' || frame.type === 'for') return count + 2
    return count + 1
  }, 0)
})

function addFrame(frameType: FrameType) {
  const defaultFields: Record<FrameType, Record<string, string>> = {
    funccall: { expression: '' },
    if: { condition: '' },
    for: { variable: '', iterable: '' },
    varassign: { name: '', value: '' },
    comment: { text: '' },
  }

  const newFrame: Frame = {
    id: generateId(),
    type: frameType,
    fields: { ...defaultFields[frameType] },
    order: frames.length,
  }

  frames.push(newFrame)
  track('frame_added', { frameId: newFrame.id, frameType: frameType })
  eventCount.value++
}

function deleteFrame(frameId: string) {
  const index = frames.findIndex(f => f.id === frameId)
  if (index !== -1) {
    const frame = frames[index]
    frames.splice(index, 1)
    track('frame_deleted', { frameId: frame.id, frameType: frame.type })
    eventCount.value++
  }
}

function moveFrame(frameId: string, direction: 'up' | 'down') {
  const index = frames.findIndex(f => f.id === frameId)
  if (index === -1) return

  if (direction === 'up' && index > 0) {
    const temp = frames[index]
    frames[index] = frames[index - 1]
    frames[index - 1] = temp
  } else if (direction === 'down' && index < frames.length - 1) {
    const temp = frames[index]
    frames[index] = frames[index + 1]
    frames[index + 1] = temp
  }

  track('frame_moved', { frameId, metadata: { direction } })
  eventCount.value++
}

function onFrameEdit(frameId: string) {
  editCount.value++
  const frame = frames.find(f => f.id === frameId)
  if (frame) {
    track('frame_edited', { frameId, frameType: frame.type })
    eventCount.value++
  }
}

/**
 * Generate real Python code from the frame structure.
 * This is a simplified transpiler — in the real Strype, this is
 * handled by the compiler module that walks the frame tree.
 */
function generatePythonCode(): string {
  const lines: string[] = []

  for (const frame of frames) {
    switch (frame.type) {
      case 'funccall': {
        const expr = frame.fields.expression?.trim()
        if (expr) {
          lines.push(`print(${expr})`)
        } else {
          lines.push(`print()`)
        }
        break
      }
      case 'if': {
        const condition = frame.fields.condition?.trim() || 'True'
        lines.push(`if ${condition}:`)
        lines.push(`    pass`)
        break
      }
      case 'for': {
        const variable = frame.fields.variable?.trim() || 'i'
        const iterable = frame.fields.iterable?.trim() || 'range(0)'
        lines.push(`for ${variable} in ${iterable}:`)
        lines.push(`    pass`)
        break
      }
      case 'varassign': {
        const name = frame.fields.name?.trim() || '_'
        const value = frame.fields.value?.trim() || 'None'
        lines.push(`${name} = ${value}`)
        break
      }
      case 'comment': {
        const text = frame.fields.text?.trim()
        lines.push(`# ${text || ''}`)
        break
      }
    }
  }

  return lines.join('\n')
}

/**
 * Smarter code generation: when an if or for is followed by indentable
 * frames, nest them. For this mini prototype we use a simpler approach —
 * sequential execution — but note it in the interview as a known limitation.
 */

async function runProgram() {
  if (pythonRunning.value) return

  track('program_run_clicked', { metadata: { frameCount: frames.length } })
  eventCount.value++

  if (frames.length === 0) {
    consoleOpen.value = true
    consoleOutput.value = [{ text: 'No frames to execute. Add some frames first!', type: 'info' }]
    generatedCode.value = '# empty program'
    runStatus.value = 'success'
    runStatusText.value = 'Finished'
    return
  }

  // Generate the Python code
  const code = generatePythonCode()
  generatedCode.value = code

  // Open console and show running state
  consoleOpen.value = true
  runStatus.value = 'running'
  runStatusText.value = pythonReady.value ? 'Running...' : 'Loading Python...'
  consoleOutput.value = [
    { text: pythonReady.value ? 'Executing...' : 'Loading Python runtime (first run takes ~3s)...', type: 'info' }
  ]

  // Execute via Pyodide
  const result = await runPython(code)

  // Update console
  consoleOutput.value = result
  const hasErrors = result.some(line => line.type === 'error')
  runStatus.value = hasErrors ? 'error' : 'success'
  runStatusText.value = hasErrors ? 'Error' : 'Finished'

  if (hasErrors) {
    track('error_shown', { metadata: { errorCount: result.filter(l => l.type === 'error').length } })
    eventCount.value++
  }

  // Scroll console to bottom
  await nextTick()
  if (consoleBody.value) {
    consoleBody.value.scrollTop = consoleBody.value.scrollHeight
  }
}

function saveProgram() {
  track('program_saved', { metadata: { frameCount: frames.length, editCount: editCount.value } })
  eventCount.value++
}
</script>

<style scoped>
.editor-layout {
  display: flex;
  height: 100%;
  position: relative;
}

/* ─── Sidebar ────────────────────────────────────────── */
.sidebar {
  position: fixed;
  left: 0;
  top: 60px;
  width: 220px;
  height: calc(100vh - 60px);
  background-color: var(--color-bg-primary);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  padding: 20px 16px;
  overflow-y: auto;
  z-index: 10;
}

.sidebar-header {
  margin-bottom: 20px;
  flex-shrink: 0;
}

.sidebar-header h3 {
  color: var(--color-text-light);
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 2px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.sidebar-subtitle {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  opacity: 0.6;
}

.frame-palette {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.frame-palette-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background-color: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-left: 3px solid var(--accent-color);
  border-radius: var(--radius-sm);
  color: var(--color-text-light);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition);
}

.frame-palette-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.15);
  transform: translateX(3px);
}

.palette-icon {
  font-size: 0.9rem;
  opacity: 0.8;
  width: 20px;
  text-align: center;
}

.palette-label {
  flex: 1;
  font-family: var(--font-code);
}

.palette-shortcut {
  font-size: 0.65rem;
  opacity: 0.35;
  font-family: var(--font-code);
  padding: 2px 5px;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 3px;
}

.sidebar-footer {
  flex-shrink: 0;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  margin-top: 16px;
}

.sidebar-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.stat-mini {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-mini-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-text-light);
  font-family: var(--font-code);
}

.stat-mini-label {
  font-size: 0.65rem;
  color: var(--color-text-secondary);
  opacity: 0.6;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.python-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.7rem;
  color: var(--color-text-secondary);
  opacity: 0.6;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #585b70;
}

.python-status.ready .status-dot {
  background-color: #a6e3a1;
}

.python-status.loading .status-dot {
  background-color: #fab387;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* ─── Editor Main Area ───────────────────────────────── */
.editor-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 220px;
  margin-bottom: 60px;
  overflow: hidden;
}

.editor-header {
  flex-shrink: 0;
  padding: 12px 24px;
  background-color: #fff;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.file-icon { font-size: 0.9rem; }

.file-label {
  font-family: var(--font-code);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-primary);
}

.edit-badge {
  padding: 2px 8px;
  background-color: rgba(99, 102, 241, 0.1);
  color: var(--color-accent);
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
}

.header-actions { display: flex; align-items: center; }

.event-counter {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  font-family: var(--font-code);
  padding: 4px 10px;
  background: rgba(0,0,0,0.03);
  border-radius: 12px;
}

/* ─── Editor Body (Canvas + Console) ─────────────────── */
.editor-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.editor-canvas {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background-color: var(--color-bg-editor);
  background-image: radial-gradient(circle, rgba(0,0,0,0.03) 1px, transparent 1px);
  background-size: 24px 24px;
  transition: flex 0.3s ease;
}

.editor-canvas.canvas-shrunk {
  flex: 1 1 50%;
  min-height: 150px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60%;
  gap: 16px;
  color: var(--color-text-secondary);
}

.empty-visual { margin-bottom: 8px; }

.empty-frame-preview {
  width: 200px;
  padding: 16px;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-line {
  height: 8px;
  background: var(--color-border);
  border-radius: 4px;
  opacity: 0.5;
}

.preview-line.short { width: 60%; }

.empty-state h3 {
  font-size: 1.1rem;
  color: var(--color-text-primary);
  font-weight: 600;
}

.empty-state p { font-size: 0.9rem; opacity: 0.7; }

.frames-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 700px;
}

.frame-list-enter-active { transition: all 0.3s ease; }
.frame-list-leave-active { transition: all 0.2s ease; }
.frame-list-enter-from { opacity: 0; transform: translateX(-20px); }
.frame-list-leave-to { opacity: 0; transform: translateX(20px); }
.frame-list-move { transition: transform 0.3s ease; }

/* ─── Console Panel ──────────────────────────────────── */
.console-panel {
  flex: 0 0 auto;
  max-height: 45%;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  border-top: 2px solid var(--color-bg-primary);
  background-color: #1e1e2e;
  animation: slideUp 0.25s ease;
}

@keyframes slideUp {
  from { max-height: 0; opacity: 0; }
  to { max-height: 45%; opacity: 1; }
}

.console-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background-color: #181825;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex-shrink: 0;
}

.console-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #cdd6f4;
}

.console-icon {
  color: #a6e3a1;
  font-size: 0.75rem;
}

.console-status {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.console-status.success {
  background-color: rgba(166, 227, 161, 0.15);
  color: #a6e3a1;
}

.console-status.error {
  background-color: rgba(243, 139, 168, 0.15);
  color: #f38ba8;
}

.console-status.running {
  background-color: rgba(250, 179, 135, 0.15);
  color: #fab387;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.console-actions {
  display: flex;
  gap: 6px;
}

.console-btn {
  padding: 4px 10px;
  background: rgba(255,255,255,0.06);
  border: none;
  border-radius: 4px;
  color: #9399b2;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.console-btn:hover {
  background: rgba(255,255,255,0.12);
  color: #cdd6f4;
}

.console-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.console-btn-close:hover {
  background: rgba(243, 139, 168, 0.2);
  color: #f38ba8;
}

.console-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px;
  font-family: var(--font-code);
  font-size: 0.85rem;
  line-height: 1.7;
}

.console-line {
  white-space: pre-wrap;
  word-break: break-word;
}

.console-line.output { color: #cdd6f4; }
.console-line.error { color: #f38ba8; }
.console-line.info { color: #9399b2; font-style: italic; }
.console-line.prompt { color: #a6e3a1; }

.line-prompt { color: #a6e3a1; font-weight: 600; }
.line-error-icon { color: #f38ba8; font-weight: 600; }

.console-source {
  flex-shrink: 0;
  border-top: 1px solid rgba(255,255,255,0.06);
  padding: 8px 16px;
  background-color: #181825;
  max-height: 100px;
  overflow-y: auto;
}

.source-header {
  font-size: 0.65rem;
  color: #585b70;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
  font-weight: 600;
}

.source-code {
  font-family: var(--font-code);
  font-size: 0.75rem;
  color: #7f849c;
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
}

/* ─── Bottom Bar ─────────────────────────────────────── */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 220px;
  right: 0;
  height: 60px;
  background-color: #fff;
  border-top: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 10;
}

.bar-left, .bar-right { display: flex; gap: 10px; }

.bar-center {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  font-family: var(--font-code);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition);
  border: none;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.btn-icon { font-size: 0.8rem; }

.btn-run {
  background-color: var(--color-frame-funccall);
  color: white;
}

.btn-run:hover:not(:disabled) {
  background-color: #059669;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.btn-save {
  background-color: transparent;
  color: var(--color-accent);
  border: 1.5px solid var(--color-accent);
}

.btn-save:hover {
  background-color: var(--color-accent);
  color: white;
}

.btn-dashboard {
  background-color: rgba(99, 102, 241, 0.08);
  color: var(--color-accent);
  font-size: 0.8rem;
}

.btn-dashboard:hover {
  background-color: rgba(99, 102, 241, 0.15);
}

.spinner {
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
