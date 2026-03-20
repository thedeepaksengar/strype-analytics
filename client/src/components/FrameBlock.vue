<template>
  <div class="frame-block" :class="`frame-${frame.type}`" @mouseenter="hovering = true" @mouseleave="hovering = false">
    <div class="frame-header">
      <div class="frame-badge">
        <span class="frame-icon">{{ frameConfig.icon }}</span>
        <span class="frame-label">{{ frameConfig.label }}</span>
      </div>
    </div>

    <div class="frame-content">
      <!-- Print statement: print(expression) -->
      <template v-if="frame.type === 'funccall'">
        <div class="frame-line">
          <span class="frame-keyword">print</span>
          <span class="frame-paren">(</span>
          <input
            v-model="fields.expression"
            type="text"
            class="frame-input"
            :placeholder="frameConfig.fields[0].placeholder"
            @input="onEdit"
          />
          <span class="frame-paren">)</span>
        </div>
      </template>

      <!-- If statement: if condition: -->
      <template v-else-if="frame.type === 'if'">
        <div class="frame-line">
          <span class="frame-keyword">if</span>
          <input
            v-model="fields.condition"
            type="text"
            class="frame-input"
            :placeholder="frameConfig.fields[0].placeholder"
            @input="onEdit"
          />
          <span class="frame-keyword">:</span>
        </div>
      </template>

      <!-- For loop: for variable in iterable: -->
      <template v-else-if="frame.type === 'for'">
        <div class="frame-line">
          <span class="frame-keyword">for</span>
          <input
            v-model="fields.variable"
            type="text"
            class="frame-input"
            :placeholder="frameConfig.fields[0].placeholder"
            @input="onEdit"
          />
          <span class="frame-keyword">in</span>
          <input
            v-model="fields.iterable"
            type="text"
            class="frame-input"
            :placeholder="frameConfig.fields[1].placeholder"
            @input="onEdit"
          />
          <span class="frame-keyword">:</span>
        </div>
      </template>

      <!-- Variable assignment: name = value -->
      <template v-else-if="frame.type === 'varassign'">
        <div class="frame-line">
          <input
            v-model="fields.name"
            type="text"
            class="frame-input"
            :placeholder="frameConfig.fields[0].placeholder"
            @input="onEdit"
          />
          <span class="frame-operator">=</span>
          <input
            v-model="fields.value"
            type="text"
            class="frame-input"
            :placeholder="frameConfig.fields[1].placeholder"
            @input="onEdit"
          />
        </div>
      </template>

      <!-- Comment: # text -->
      <template v-else-if="frame.type === 'comment'">
        <div class="frame-line">
          <span class="frame-keyword comment-hash">#</span>
          <input
            v-model="fields.text"
            type="text"
            class="frame-input frame-input-comment"
            :placeholder="frameConfig.fields[0].placeholder"
            @input="onEdit"
          />
        </div>
      </template>
    </div>

    <!-- Action buttons -->
    <div class="frame-actions" :class="{ visible: hovering }">
      <button class="action-btn" title="Move up" @click="emit('moveUp')">↑</button>
      <button class="action-btn" title="Move down" @click="emit('moveDown')">↓</button>
      <button class="action-btn action-btn-delete" title="Delete" @click="emit('delete')">✕</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { Frame, FrameType } from '../types/events'
import { FRAME_CONFIGS } from '../types/events'

const props = defineProps<{
  frame: Frame
}>()

const emit = defineEmits<{
  edit: []
  delete: []
  moveUp: []
  moveDown: []
}>()

const hovering = ref(false)

const frameConfig = computed(() => FRAME_CONFIGS[props.frame.type as FrameType])

const fields = reactive({ ...props.frame.fields })

// Debounce edit events to avoid flooding
let editTimeout: ReturnType<typeof setTimeout> | null = null
function onEdit() {
  // Sync fields back to the frame
  Object.assign(props.frame.fields, fields)
  if (editTimeout) clearTimeout(editTimeout)
  editTimeout = setTimeout(() => {
    emit('edit')
  }, 300)
}
</script>

<style scoped>
.frame-block {
  background-color: var(--color-bg-frame);
  border: 1px solid var(--color-border);
  border-left: 4px solid var(--frame-color, var(--color-accent));
  border-radius: var(--radius-md);
  padding: 12px 16px;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition);
  animation: slideIn 0.3s ease;
  position: relative;
}

.frame-block:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--frame-color, var(--color-accent));
  border-left-width: 4px;
}

.frame-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.frame-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: var(--radius-sm);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.frame-icon {
  font-size: 0.9rem;
}

.frame-label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

.frame-content {
  font-family: var(--font-code);
  font-size: 0.95rem;
  line-height: 1.6;
}

.frame-line {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.frame-keyword {
  font-weight: 600;
  color: #8b5cf6;
}

.comment-hash {
  color: var(--color-frame-comment);
}

.frame-operator {
  color: var(--color-text-secondary);
  font-weight: 500;
  padding: 0 2px;
}

.frame-paren {
  color: var(--color-text-secondary);
  font-weight: 500;
}

.frame-input {
  flex: 0 1 auto;
  min-width: 80px;
  padding: 4px 8px;
  background-color: rgba(0, 0, 0, 0.02);
  color: var(--color-text-primary);
  border: 1px solid transparent;
  border-bottom: 2px solid var(--color-border);
  border-radius: 4px;
  transition: all var(--transition);
  font-family: var(--font-code);
  font-size: inherit;
}

.frame-input:focus {
  border-bottom-color: var(--frame-color, var(--color-accent));
  background-color: rgba(0, 0, 0, 0.03);
  outline: none;
  box-shadow: 0 2px 0 var(--frame-color, var(--color-accent));
}

.frame-input::placeholder {
  color: var(--color-text-secondary);
  opacity: 0.4;
  font-style: italic;
}

.frame-input-comment {
  flex: 1;
  min-width: 200px;
  font-style: italic;
  color: var(--color-frame-comment);
}

.frame-actions {
  position: absolute;
  right: 12px;
  top: 12px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.15s ease;
  pointer-events: none;
}

.frame-actions.visible {
  opacity: 1;
  pointer-events: auto;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border-radius: var(--radius-sm);
  background-color: rgba(0, 0, 0, 0.05);
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  font-weight: 600;
  transition: all var(--transition);
  cursor: pointer;
  border: none;
}

.action-btn:hover {
  background-color: rgba(0, 0, 0, 0.1);
  color: var(--color-text-primary);
}

.action-btn-delete:hover {
  background-color: #fee2e2;
  color: #dc2626;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
