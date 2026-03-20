<template>
  <div class="app-container" :class="{ 'is-home': isHomePage }">
    <nav v-if="!isHomePage" class="navbar">
      <div class="navbar-content">
        <div class="navbar-left">
          <router-link to="/" class="navbar-logo">
            <span class="logo-icon">📊</span>
            <span class="logo-text">Strype Analytics</span>
          </router-link>
        </div>

        <div class="navbar-center">
          <router-link to="/editor" class="nav-link" :class="{ active: route.path === '/editor' }">
            Editor
          </router-link>
          <router-link to="/dashboard" class="nav-link" :class="{ active: route.path === '/dashboard' }">
            Dashboard
          </router-link>
          <router-link to="/architecture" class="nav-link" :class="{ active: route.path === '/architecture' }">
            Architecture
          </router-link>
        </div>

        <div class="navbar-right">
          <div class="session-badge">
            <span class="badge-label">Session:</span>
            <span class="session-id">{{ sessionIdShort }}</span>
          </div>
        </div>
      </div>
    </nav>

    <main class="main-content" :class="{ 'main-full': isHomePage }">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useInstrumentation } from './composables/useInstrumentation'

const route = useRoute()
const { startSession, sessionId } = useInstrumentation()

const sessionIdShort = computed(() => sessionId.value.slice(0, 8))
const isHomePage = computed(() => route.path === '/')

onMounted(() => {
  startSession()
})
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--color-bg-editor);
}

.app-container.is-home {
  background-color: #003153;
}

.navbar {
  flex-shrink: 0;
  background-color: var(--color-bg-primary);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: var(--shadow-sm);
  z-index: 100;
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
  padding: 0 32px;
  max-width: 100%;
}

.navbar-left {
  flex-shrink: 0;
}

.navbar-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  text-decoration: none;
}

.logo-icon {
  font-size: 1.4rem;
}

.logo-text {
  color: var(--color-text-light);
  background: linear-gradient(135deg, #6366f1 0%, #10b981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.navbar-center {
  display: flex;
  gap: 32px;
  flex: 1;
  justify-content: center;
}

.nav-link {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--color-text-light);
  opacity: 0.6;
  transition: opacity var(--transition), color var(--transition);
  position: relative;
  padding-bottom: 4px;
  text-decoration: none;
}

.nav-link:hover {
  opacity: 0.8;
}

.nav-link.active {
  opacity: 1;
  color: var(--color-accent);
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--color-accent);
  border-radius: 1px;
}

.navbar-right {
  flex-shrink: 0;
}

.session-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background-color: rgba(99, 102, 241, 0.1);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
}

.badge-label {
  color: var(--color-text-secondary);
}

.session-id {
  font-family: var(--font-code);
  color: var(--color-accent);
  font-weight: 600;
  letter-spacing: 0.02em;
}

.main-content {
  flex: 1;
  overflow: auto;
}

.main-full {
  overflow: visible;
}
</style>
