<template>
  <div class="home">

    <!-- ═══ HERO: Full-viewport swiper ═══ -->
    <section class="hero">
      <div class="hero-slides" :style="{ transform: `translateX(-${currentSlide * 100}vw)` }">

        <!-- Slide 1: Main pitch -->
        <div class="hero-slide slide-1">
          <div class="slide-content">
            <div class="hero-badge">Research Project — King's College London</div>
            <h1 class="hero-title">
              <span class="title-line">Understand how</span>
              <span class="title-line title-accent">learners code.</span>
            </h1>
            <p class="hero-desc">
              Instrumentation layer for Strype — capturing interaction telemetry
              from a frame-based Python editor to answer programming education
              research questions.
            </p>
            <div class="hero-cta">
              <router-link to="/editor" class="btn-primary">Open Editor</router-link>
              <router-link to="/dashboard" class="btn-outline">View Dashboard</router-link>
            </div>
          </div>
          <div class="hero-visual">
            <div class="mock-editor">
              <div class="mock-header">
                <div class="mock-dots"><span></span><span></span><span></span></div>
                <span class="mock-file">main.py</span>
              </div>
              <div class="mock-body">
                <div class="mock-frame mock-frame-var"><span class="mf-kw">x</span> <span class="mf-op">=</span> <span class="mf-val">42</span></div>
                <div class="mock-frame mock-frame-if"><span class="mf-kw">if</span> <span class="mf-val">x &gt; 10</span> <span class="mf-kw">:</span></div>
                <div class="mock-frame mock-frame-print mock-indent"><span class="mf-kw">print</span><span class="mf-paren">(</span><span class="mf-str">"hello world"</span><span class="mf-paren">)</span></div>
                <div class="mock-frame mock-frame-for"><span class="mf-kw">for</span> <span class="mf-val">i</span> <span class="mf-kw">in</span> <span class="mf-val">range(5)</span> <span class="mf-kw">:</span></div>
                <div class="mock-frame mock-frame-print mock-indent"><span class="mf-kw">print</span><span class="mf-paren">(</span><span class="mf-val">i</span><span class="mf-paren">)</span></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Slide 2: Instrumentation -->
        <div class="hero-slide slide-2">
          <div class="slide-content">
            <div class="hero-badge">Typed Telemetry</div>
            <h1 class="hero-title">
              <span class="title-line">Every interaction,</span>
              <span class="title-line title-accent">captured.</span>
            </h1>
            <p class="hero-desc">
              10 distinct event types tracked with sub-second precision.
              Buffered delivery, session management, and reliable
              sendBeacon on page unload.
            </p>
            <div class="hero-cta">
              <router-link to="/architecture" class="btn-primary">View Architecture</router-link>
            </div>
          </div>
          <div class="hero-visual">
            <div class="event-stream">
              <div v-for="(evt, i) in streamEvents" :key="i" class="stream-line" :style="{ animationDelay: `${i * 0.3}s` }">
                <span class="stream-time">{{ evt.time }}</span>
                <span class="stream-badge" :class="evt.cls">{{ evt.name }}</span>
                <span class="stream-meta">{{ evt.meta }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Slide 3: Research -->
        <div class="hero-slide slide-3">
          <div class="slide-content">
            <div class="hero-badge">Programming Education</div>
            <h1 class="hero-title">
              <span class="title-line">Data-driven</span>
              <span class="title-line title-accent">research.</span>
            </h1>
            <p class="hero-desc">
              Built to answer questions like: where do learners hesitate?
              Which constructs cause confusion? Does frame-based editing
              reduce syntax errors?
            </p>
            <div class="hero-cta">
              <router-link to="/dashboard" class="btn-primary">Explore Data</router-link>
            </div>
          </div>
          <div class="hero-visual">
            <div class="research-cards">
              <div class="r-card" v-for="(q, i) in researchQuestions" :key="i" :style="{ animationDelay: `${i * 0.15}s` }">
                <span class="r-icon">{{ q.icon }}</span>
                <span class="r-text">{{ q.text }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Slide 4: Video -->
        <div class="hero-slide slide-4">
          <div class="slide-content">
            <div class="hero-badge">See Strype in Action</div>
            <h1 class="hero-title">
              <span class="title-line">Frame-based</span>
              <span class="title-line title-accent">coding.</span>
            </h1>
            <p class="hero-desc">
              Watch how Strype combines the structure of block-based programming
              with the flexibility of text editing — designed for learners
              transitioning to real Python.
            </p>
            <div class="hero-cta">
              <a href="https://strype.org" target="_blank" rel="noopener" class="btn-primary">Visit Strype.org</a>
              <router-link to="/editor" class="btn-outline">Try the Editor</router-link>
            </div>
          </div>
          <div class="hero-visual">
            <div class="video-embed">
              <iframe
                src="https://www.youtube.com/embed/U4CwB8fTTZs"
                title="Strype: Frame-based Python Editor"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            </div>
          </div>
        </div>
      </div>

      <!-- Slide nav -->
      <div class="slide-nav">
        <button v-for="i in totalSlides" :key="i" class="slide-dot" :class="{ active: currentSlide === i - 1 }" @click="goToSlide(i - 1)"></button>
      </div>
      <button class="slide-arrow slide-arrow-left" @click="prevSlide" v-show="currentSlide > 0">&#8249;</button>
      <button class="slide-arrow slide-arrow-right" @click="nextSlide" v-show="currentSlide < totalSlides - 1">&#8250;</button>
    </section>

    <!-- ═══ KEY FEATURES (Strype-style frame examples) ═══ -->
    <section class="key-features">
      <div class="section-inner">
        <h2 class="section-title">Key Features</h2>
        <p class="section-subtitle">
          Strype combines the structure of blocks with the power of text — and our analytics
          captures every interaction to understand how learners use these constructs.
        </p>
        <div class="kf-grid">
          <div class="kf-card" v-for="(kf, i) in keyFeatures" :key="i">
            <div class="kf-frame-demo">
              <div class="kf-frame-header">
                <span class="kf-frame-dot" :style="{ background: kf.color }"></span>
                <span class="kf-frame-label">{{ kf.frameLabel }}</span>
              </div>
              <div class="kf-frame-body">
                <div
                  v-for="(line, li) in kf.lines"
                  :key="li"
                  class="kf-line"
                  :class="{ 'kf-indent': line.indent }"
                  :style="{ borderLeftColor: kf.color }"
                >
                  <span v-for="(seg, si) in line.segments" :key="si" :class="seg.cls">{{ seg.text }}</span>
                </div>
              </div>
            </div>
            <h3 class="kf-title">{{ kf.title }}</h3>
            <p class="kf-desc">{{ kf.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ FEATURES (What it does) ═══ -->
    <section class="features">
      <div class="section-inner">
        <h2 class="section-title">What it does</h2>
        <div class="features-grid">
          <div class="feature-card" v-for="(f, i) in features" :key="i">
            <div class="feature-icon">{{ f.icon }}</div>
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ ABOUT US ═══ -->
    <section class="about-us">
      <div class="section-inner">
        <h2 class="section-title section-title-light">About the Project</h2>
        <p class="about-intro">
          This analytics prototype is built for the
          <strong>King's Programming, Education &amp; Tools (K-PET)</strong> group
          at King's College London, led by Prof. Michael K&ouml;lling and Neil Brown.
          The group has a long history of building programming environments for education.
        </p>
        <div class="about-grid">
          <div class="about-card" v-for="(proj, i) in aboutProjects" :key="i">
            <div class="about-icon-wrap" :style="{ background: proj.bg }">
              <span class="about-icon">{{ proj.icon }}</span>
            </div>
            <h3>{{ proj.name }}</h3>
            <p>{{ proj.desc }}</p>
            <a v-if="proj.url" :href="proj.url" target="_blank" rel="noopener" class="about-link">
              Learn more &rarr;
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ TECH STACK ═══ -->
    <section class="stack">
      <div class="section-inner">
        <h2 class="section-title">Built with</h2>
        <div class="stack-row">
          <div class="stack-item" v-for="(s, i) in stackItems" :key="i">
            <div class="stack-label">{{ s.label }}</div>
            <div class="stack-name">{{ s.name }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ CTA ═══ -->
    <section class="cta-section">
      <div class="section-inner cta-inner">
        <h2>Ready to explore?</h2>
        <p>Open the editor, add some frames, run your code, and see the analytics in real time.</p>
        <router-link to="/editor" class="btn-primary btn-lg">Launch Editor</router-link>
      </div>
    </section>

    <!-- ═══ FOOTER ═══ -->
    <footer class="site-footer">
      <div class="section-inner footer-inner">
        <div class="footer-col footer-brand">
          <span class="footer-logo">Strype Analytics</span>
          <span class="footer-copy">Technical demonstration — Web Programmer role</span>
        </div>
        <div class="footer-col footer-contact">
          <span class="footer-heading">Contact</span>
          <span>King's College London</span>
          <span>Department of Informatics</span>
          <span>Bush House, 30 Aldwych</span>
          <span>London WC2B 4BG</span>
        </div>
        <div class="footer-col footer-team">
          <span class="footer-heading">Team</span>
          <span>Prof. Michael K&ouml;lling</span>
          <span>Neil Brown</span>
          <span>K-PET Research Group</span>
        </div>
        <div class="footer-col footer-kcl">
          <img src="/images/kcl-logo.svg" alt="King's College London" class="kcl-logo" />
          <span class="footer-kcl-text">Part of the K-PET group</span>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; 2026 Strype Analytics — King's College London</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const totalSlides = 4
const currentSlide = ref(0)
let autoplayTimer: ReturnType<typeof setInterval> | null = null

function goToSlide(n: number) { currentSlide.value = n }
function nextSlide() { if (currentSlide.value < totalSlides - 1) currentSlide.value++ }
function prevSlide() { if (currentSlide.value > 0) currentSlide.value-- }

// Autoplay
onMounted(() => {
  autoplayTimer = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % totalSlides
  }, 7000)
})
onUnmounted(() => { if (autoplayTimer) clearInterval(autoplayTimer) })

const streamEvents = [
  { time: '0.0s', name: 'session_started', cls: 'ev-session', meta: 'sid: a1b2c3d4' },
  { time: '1.2s', name: 'frame_added', cls: 'ev-frame', meta: 'varassign' },
  { time: '2.8s', name: 'frame_edited', cls: 'ev-frame', meta: 'x = 42' },
  { time: '3.1s', name: 'frame_added', cls: 'ev-frame', meta: 'if' },
  { time: '4.5s', name: 'frame_edited', cls: 'ev-frame', meta: 'x > 10' },
  { time: '5.0s', name: 'frame_added', cls: 'ev-frame', meta: 'funccall' },
  { time: '6.2s', name: 'program_run', cls: 'ev-run', meta: '3 frames' },
  { time: '6.3s', name: 'error_shown', cls: 'ev-error', meta: 'NameError' },
]

const researchQuestions = [
  { icon: '⏱', text: 'Where do learners hesitate most?' },
  { icon: '📊', text: 'Which constructs are used most?' },
  { icon: '🔄', text: 'How many edits before running?' },
  { icon: '⚠', text: 'Which frames cause confusion?' },
  { icon: '✓', text: 'Does frame editing reduce syntax errors?' },
]

const keyFeatures = [
  {
    title: 'While Loops',
    frameLabel: 'while_loop',
    color: '#8b5cf6',
    desc: 'Repetition with condition — structured as a frame that clearly shows the loop body and its scope.',
    lines: [
      { indent: false, segments: [
        { cls: 'mf-kw', text: 'while ' }, { cls: 'mf-val', text: 'count < 10' }, { cls: 'mf-kw', text: ' :' }
      ]},
      { indent: true, segments: [
        { cls: 'mf-kw', text: 'count' }, { cls: 'mf-op', text: ' = ' }, { cls: 'mf-val', text: 'count + 1' }
      ]},
      { indent: true, segments: [
        { cls: 'mf-kw', text: 'print' }, { cls: 'mf-paren', text: '(' }, { cls: 'mf-val', text: 'count' }, { cls: 'mf-paren', text: ')' }
      ]},
    ]
  },
  {
    title: 'Function Definitions',
    frameLabel: 'def_function',
    color: '#3b82f6',
    desc: 'Named functions with parameters — learners define reusable logic with clear visual boundaries.',
    lines: [
      { indent: false, segments: [
        { cls: 'mf-kw', text: 'def ' }, { cls: 'mf-val', text: 'greet' }, { cls: 'mf-paren', text: '(' }, { cls: 'mf-val', text: 'name' }, { cls: 'mf-paren', text: ')' }, { cls: 'mf-kw', text: ' :' }
      ]},
      { indent: true, segments: [
        { cls: 'mf-kw', text: 'msg' }, { cls: 'mf-op', text: ' = ' }, { cls: 'mf-str', text: '"Hello, "' }, { cls: 'mf-op', text: ' + ' }, { cls: 'mf-val', text: 'name' }
      ]},
      { indent: true, segments: [
        { cls: 'mf-kw', text: 'print' }, { cls: 'mf-paren', text: '(' }, { cls: 'mf-val', text: 'msg' }, { cls: 'mf-paren', text: ')' }
      ]},
    ]
  },
  {
    title: 'Conditionals',
    frameLabel: 'if_statement',
    color: '#10b981',
    desc: 'If/elif/else branching — each branch is a visually distinct frame, making control flow clear.',
    lines: [
      { indent: false, segments: [
        { cls: 'mf-kw', text: 'if ' }, { cls: 'mf-val', text: 'score >= 90' }, { cls: 'mf-kw', text: ' :' }
      ]},
      { indent: true, segments: [
        { cls: 'mf-kw', text: 'grade' }, { cls: 'mf-op', text: ' = ' }, { cls: 'mf-str', text: '"A"' }
      ]},
      { indent: false, segments: [
        { cls: 'mf-kw', text: 'else :' }
      ]},
      { indent: true, segments: [
        { cls: 'mf-kw', text: 'grade' }, { cls: 'mf-op', text: ' = ' }, { cls: 'mf-str', text: '"B"' }
      ]},
    ]
  },
]

const features = [
  { icon: '🧩', title: 'Frame-Based Editor', desc: 'Five Python frame types — print, if, for, variable assignment, and comments — matching Strype terminology.' },
  { icon: '📡', title: 'Client Instrumentation', desc: 'Typed event schema, 5-second buffered flush, debounced edits, and sendBeacon for reliable page-unload delivery.' },
  { icon: '🐍', title: 'Real Python Execution', desc: 'Pyodide (Python → WebAssembly) runs real Python 3.11 in the browser — the same approach Strype uses.' },
  { icon: '📈', title: 'Analytics Dashboard', desc: 'Session metrics, frame usage charts, edit-to-run ratios, event timeline, and research context annotations.' },
  { icon: '🗄', title: 'Telemetry Backend', desc: 'Express + SQLite with transaction-based batch inserts, WAL mode, and indexed queries for fast aggregation.' },
  { icon: '🔬', title: 'Research-Oriented', desc: 'Designed to answer programming education questions about learner hesitation, construct usage, and error patterns.' },
]

const aboutProjects = [
  {
    name: 'Strype',
    icon: '🖊',
    bg: 'linear-gradient(135deg, #003153, #004a7c)',
    desc: 'A frame-based Python editor that combines the guidance of blocks with the expressiveness of text — designed for learners transitioning from Scratch to Python.',
    url: 'https://strype.org',
  },
  {
    name: 'BlueJ',
    icon: '☕',
    bg: 'linear-gradient(135deg, #1a5276, #2980b9)',
    desc: 'An integrated development environment for Java, designed specifically for introductory teaching. Used by millions of students worldwide since 1999.',
    url: 'https://bluej.org',
  },
  {
    name: 'Greenfoot',
    icon: '🐢',
    bg: 'linear-gradient(135deg, #196f3d, #27ae60)',
    desc: 'An interactive Java development environment that makes learning object-oriented programming engaging through visual, interactive scenarios.',
    url: 'https://greenfoot.org',
  },
  {
    name: 'Stride',
    icon: '🦶',
    bg: 'linear-gradient(135deg, #7d3c98, #a569bd)',
    desc: 'A frame-based language inside Greenfoot — the precursor to Strype that proved frame-based editing helps learners avoid syntax errors.',
    url: null,
  },
]

const stackItems = [
  { label: 'Frontend', name: 'Vue 3 + TypeScript' },
  { label: 'Build', name: 'Vite 5' },
  { label: 'Execution', name: 'Pyodide (WASM)' },
  { label: 'Backend', name: 'Express + TS' },
  { label: 'Database', name: 'SQLite' },
  { label: 'Styling', name: 'CSS Custom Props' },
]
</script>

<style scoped>
/* ─── Palette: White, Black, Prussian Blue ─── */
:root {
  --prussian: #003153;
  --prussian-light: #004a7c;
  --prussian-dark: #001f3f;
}

/* ─── HERO ───────────────────────────────────── */
.hero {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #003153;
}

.hero-slides {
  display: flex;
  height: 100%;
  transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

.hero-slide {
  flex: 0 0 100vw;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 80px;
  padding: 0 80px;
  box-sizing: border-box;
}

.slide-1 { background: linear-gradient(135deg, #001f3f 0%, #003153 50%, #004a7c 100%); }
.slide-2 { background: linear-gradient(135deg, #003153 0%, #001f3f 100%); }
.slide-3 { background: linear-gradient(135deg, #004a7c 0%, #003153 50%, #001f3f 100%); }
.slide-4 { background: linear-gradient(135deg, #001f3f 0%, #003153 60%, #004a7c 100%); }

.slide-content {
  flex: 1;
  max-width: 540px;
}

.hero-badge {
  display: inline-block;
  padding: 6px 14px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255,255,255,0.7);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 24px;
}

.hero-title {
  margin-bottom: 24px;
  line-height: 1.1;
}

.title-line {
  display: block;
  font-size: 3.2rem;
  font-weight: 800;
  color: white;
  letter-spacing: -0.03em;
}

.title-accent {
  background: linear-gradient(90deg, #90caf9 0%, #e0f0ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-desc {
  font-size: 1.05rem;
  line-height: 1.65;
  color: rgba(255,255,255,0.65);
  margin-bottom: 36px;
  max-width: 460px;
}

.hero-cta {
  display: flex;
  gap: 14px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  padding: 12px 28px;
  background: white;
  color: #003153;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.btn-primary:hover {
  background: #e0f0ff;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}

.btn-outline {
  display: inline-flex;
  align-items: center;
  padding: 12px 28px;
  background: transparent;
  color: white;
  border: 1.5px solid rgba(255,255,255,0.3);
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
}

.btn-outline:hover {
  border-color: rgba(255,255,255,0.6);
  background: rgba(255,255,255,0.05);
}

.btn-lg {
  padding: 14px 36px;
  font-size: 1rem;
}

.hero-visual {
  flex: 1;
  max-width: 500px;
  display: flex;
  justify-content: center;
}

/* Video embed */
.video-embed {
  width: 100%;
  max-width: 500px;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
  border: 1px solid rgba(255,255,255,0.1);
}

.video-embed iframe {
  width: 100%;
  height: 100%;
}

/* Slide navigation */
.slide-nav {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 10;
}

.slide-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255,255,255,0.25);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.slide-dot.active {
  background: white;
  transform: scale(1.3);
}

.slide-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.15);
  color: white;
  font-size: 2rem;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
  line-height: 1;
  padding: 0 0 3px 0;
}

.slide-arrow:hover {
  background: rgba(255,255,255,0.15);
}

.slide-arrow-left { left: 24px; }
.slide-arrow-right { right: 24px; }

/* ─── Mock Editor (Slide 1) ─── */
.mock-editor {
  width: 100%;
  max-width: 420px;
  background: #0d1b2a;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
  border: 1px solid rgba(255,255,255,0.08);
}

.mock-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: rgba(255,255,255,0.04);
  border-bottom: 1px solid rgba(255,255,255,0.06);
}

.mock-dots {
  display: flex;
  gap: 6px;
}

.mock-dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
}

.mock-dots span:first-child { background: #f38ba8; }
.mock-dots span:nth-child(2) { background: #fab387; }
.mock-dots span:nth-child(3) { background: #a6e3a1; }

.mock-file {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.5);
}

.mock-body {
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mock-frame {
  padding: 8px 14px;
  border-radius: 6px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  border-left: 3px solid;
  background: rgba(255,255,255,0.03);
}

.mock-indent { margin-left: 24px; }

.mock-frame-var { border-color: #f59e0b; }
.mock-frame-if { border-color: #3b82f6; }
.mock-frame-print { border-color: #10b981; }
.mock-frame-for { border-color: #8b5cf6; }

.mf-kw { color: #90caf9; font-weight: 600; }
.mf-op { color: rgba(255,255,255,0.4); }
.mf-val { color: #e0f0ff; }
.mf-str { color: #a6e3a1; }
.mf-paren { color: rgba(255,255,255,0.35); }

/* ─── Event Stream (Slide 2) ─── */
.event-stream {
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stream-line {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: rgba(255,255,255,0.04);
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.06);
  animation: fadeInRight 0.5s ease both;
}

@keyframes fadeInRight {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

.stream-time {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  color: rgba(255,255,255,0.35);
  min-width: 36px;
}

.stream-badge {
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  white-space: nowrap;
}

.ev-session { background: rgba(99,102,241,0.2); color: #a5b4fc; }
.ev-frame { background: rgba(16,185,129,0.2); color: #6ee7b7; }
.ev-run { background: rgba(59,130,246,0.2); color: #93c5fd; }
.ev-error { background: rgba(239,68,68,0.2); color: #fca5a5; }

.stream-meta {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  color: rgba(255,255,255,0.4);
}

/* ─── Research Cards (Slide 3) ─── */
.research-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 400px;
}

.r-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  animation: fadeInRight 0.5s ease both;
}

.r-icon {
  font-size: 1.3rem;
  flex-shrink: 0;
}

.r-text {
  font-size: 0.9rem;
  color: rgba(255,255,255,0.8);
  font-weight: 500;
}

/* ─── KEY FEATURES (Frame examples) ───────────── */
.key-features {
  padding: 100px 0;
  background: #f6f8fa;
}

.section-subtitle {
  text-align: center;
  max-width: 640px;
  margin: -36px auto 56px;
  font-size: 1rem;
  line-height: 1.65;
  color: #5a6577;
}

.kf-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.kf-card {
  background: white;
  border: 1px solid #e8ecf1;
  border-radius: 14px;
  padding: 0;
  overflow: hidden;
  transition: all 0.25s ease;
}

.kf-card:hover {
  border-color: #003153;
  box-shadow: 0 12px 32px rgba(0,49,83,0.1);
  transform: translateY(-4px);
}

.kf-frame-demo {
  background: #0d1b2a;
  padding: 20px;
}

.kf-frame-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.kf-frame-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.kf-frame-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.65rem;
  color: rgba(255,255,255,0.4);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.kf-frame-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.kf-line {
  padding: 6px 12px;
  border-radius: 5px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.78rem;
  border-left: 3px solid;
  background: rgba(255,255,255,0.03);
}

.kf-indent {
  margin-left: 20px;
}

.kf-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #0d1b2a;
  padding: 20px 24px 8px;
}

.kf-desc {
  font-size: 0.85rem;
  line-height: 1.6;
  color: #5a6577;
  padding: 0 24px 24px;
}

/* ─── FEATURES ───────────────────────────────── */
.features {
  padding: 100px 0;
  background: #fff;
}

.section-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 32px;
}

.section-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: #0d1b2a;
  text-align: center;
  margin-bottom: 56px;
  letter-spacing: -0.02em;
}

.section-title-light {
  color: white;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.feature-card {
  padding: 32px 28px;
  border: 1px solid #e8ecf1;
  border-radius: 12px;
  transition: all 0.25s ease;
}

.feature-card:hover {
  border-color: #003153;
  box-shadow: 0 8px 24px rgba(0,49,83,0.08);
  transform: translateY(-4px);
}

.feature-icon {
  font-size: 1.8rem;
  margin-bottom: 16px;
}

.feature-card h3 {
  font-size: 1rem;
  font-weight: 700;
  color: #0d1b2a;
  margin-bottom: 10px;
}

.feature-card p {
  font-size: 0.88rem;
  line-height: 1.6;
  color: #5a6577;
}

/* ─── ABOUT US ───────────────────────────────── */
.about-us {
  padding: 100px 0;
  background: #003153;
}

.about-intro {
  text-align: center;
  max-width: 660px;
  margin: -36px auto 56px;
  font-size: 1rem;
  line-height: 1.7;
  color: rgba(255,255,255,0.65);
}

.about-intro strong {
  color: white;
  font-weight: 700;
}

.about-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.about-card {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 14px;
  padding: 32px 24px;
  text-align: center;
  transition: all 0.25s ease;
}

.about-card:hover {
  background: rgba(255,255,255,0.08);
  border-color: rgba(255,255,255,0.2);
  transform: translateY(-4px);
}

.about-icon-wrap {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
}

.about-icon {
  font-size: 1.6rem;
}

.about-card h3 {
  font-size: 1.05rem;
  font-weight: 700;
  color: white;
  margin-bottom: 10px;
}

.about-card p {
  font-size: 0.82rem;
  line-height: 1.6;
  color: rgba(255,255,255,0.6);
  margin-bottom: 16px;
}

.about-link {
  font-size: 0.8rem;
  font-weight: 600;
  color: #90caf9;
  text-decoration: none;
  transition: color 0.2s ease;
}

.about-link:hover {
  color: #e0f0ff;
}

/* ─── TECH STACK ─────────────────────────────── */
.stack {
  padding: 80px 0;
  background: #f6f8fa;
}

.stack-row {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 24px;
}

.stack-item {
  padding: 20px 28px;
  background: white;
  border: 1px solid #e8ecf1;
  border-radius: 10px;
  text-align: center;
  min-width: 140px;
  transition: all 0.2s ease;
}

.stack-item:hover {
  border-color: #003153;
  box-shadow: 0 4px 12px rgba(0,49,83,0.06);
}

.stack-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: #003153;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 6px;
}

.stack-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: #0d1b2a;
}

/* ─── CTA ────────────────────────────────────── */
.cta-section {
  padding: 100px 0;
  background: #003153;
}

.cta-inner {
  text-align: center;
}

.cta-section h2 {
  font-size: 2rem;
  font-weight: 800;
  color: white;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}

.cta-section p {
  font-size: 1rem;
  color: rgba(255,255,255,0.6);
  margin-bottom: 36px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
}

/* ─── FOOTER ─────────────────────────────────── */
.site-footer {
  padding: 48px 0 0;
  background: #001f3f;
  border-top: 1px solid rgba(255,255,255,0.06);
}

.footer-inner {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 40px;
  align-items: start;
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.8rem;
  color: rgba(255,255,255,0.45);
}

.footer-heading {
  font-size: 0.7rem;
  font-weight: 700;
  color: rgba(255,255,255,0.7);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 8px;
}

.footer-logo {
  font-weight: 700;
  color: white;
  font-size: 1rem;
  margin-bottom: 4px;
}

.footer-copy {
  font-size: 0.75rem;
  color: rgba(255,255,255,0.35);
}

.kcl-logo {
  width: 140px;
  height: auto;
  border-radius: 6px;
  margin-bottom: 8px;
}

.footer-kcl-text {
  font-size: 0.72rem;
  color: rgba(255,255,255,0.4);
}

.footer-bottom {
  margin-top: 40px;
  padding: 16px 32px;
  border-top: 1px solid rgba(255,255,255,0.06);
  text-align: center;
  font-size: 0.72rem;
  color: rgba(255,255,255,0.3);
}

/* ─── Responsive ─────────────────────────────── */
@media (max-width: 900px) {
  .hero-slide {
    flex-direction: column;
    gap: 40px;
    padding: 60px 32px;
    text-align: center;
  }

  .title-line { font-size: 2.2rem; }
  .hero-desc { margin-left: auto; margin-right: auto; }
  .hero-cta { justify-content: center; }

  .features-grid,
  .kf-grid {
    grid-template-columns: 1fr;
    max-width: 500px;
    margin: 0 auto;
  }

  .about-grid {
    grid-template-columns: 1fr 1fr;
    max-width: 600px;
    margin: 0 auto;
  }

  .footer-inner {
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
}

@media (max-width: 600px) {
  .about-grid {
    grid-template-columns: 1fr;
    max-width: 400px;
  }

  .footer-inner {
    grid-template-columns: 1fr;
    text-align: center;
    align-items: center;
  }

  .footer-col { align-items: center; }
}
</style>
