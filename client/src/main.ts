import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './assets/main.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('./components/HomePage.vue') },
    { path: '/editor', component: () => import('./components/EditorView.vue') },
    { path: '/dashboard', component: () => import('./components/DashboardView.vue') },
    { path: '/architecture', component: () => import('./components/ArchitectureDiagram.vue') },
  ],
})

const app = createApp(App)
app.use(router)
app.mount('#app')
