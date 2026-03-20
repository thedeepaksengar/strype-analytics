/**
 * Pyodide-based Python runner for the browser.
 * Loads Pyodide (Python → WebAssembly) from CDN and executes real Python code.
 * This is the same approach Strype uses for its Python execution.
 */
import { ref, shallowRef } from 'vue'

// Pyodide types (minimal)
interface PyodideInterface {
  runPythonAsync(code: string): Promise<any>
  setStdout(options: { batched: (msg: string) => void }): void
  setStderr(options: { batched: (msg: string) => void }): void
  globals: any
}

declare global {
  interface Window {
    loadPyodide: (config?: any) => Promise<PyodideInterface>
  }
}

const PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'

export type OutputLine = {
  text: string
  type: 'output' | 'error' | 'info' | 'prompt'
}

const pyodide = shallowRef<PyodideInterface | null>(null)
const isLoading = ref(false)
const isReady = ref(false)
const loadError = ref<string | null>(null)

// Singleton: load Pyodide once across the entire app
let loadPromise: Promise<PyodideInterface> | null = null

async function ensurePyodideLoaded(): Promise<PyodideInterface> {
  if (pyodide.value) return pyodide.value

  if (loadPromise) return loadPromise

  loadPromise = (async () => {
    isLoading.value = true
    loadError.value = null

    try {
      // Dynamically inject the Pyodide script if not already present
      if (!window.loadPyodide) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script')
          script.src = `${PYODIDE_CDN}pyodide.js`
          script.onload = () => resolve()
          script.onerror = () => reject(new Error('Failed to load Pyodide script from CDN'))
          document.head.appendChild(script)
        })
      }

      const py = await window.loadPyodide({
        indexURL: PYODIDE_CDN,
      })

      pyodide.value = py
      isReady.value = true
      return py
    } catch (err: any) {
      loadError.value = err.message || 'Failed to initialize Python runtime'
      throw err
    } finally {
      isLoading.value = false
    }
  })()

  return loadPromise
}

export function usePythonRunner() {
  const output = ref<OutputLine[]>([])
  const isRunning = ref(false)

  async function runPython(code: string): Promise<OutputLine[]> {
    output.value = []
    isRunning.value = true

    const lines: OutputLine[] = []

    try {
      // Load Pyodide if not already loaded
      lines.push({ text: isReady.value ? 'Running...' : 'Loading Python runtime (first run may take a few seconds)...', type: 'info' })
      output.value = [...lines]

      const py = await ensurePyodideLoaded()

      // Update status after loading
      lines.length = 0
      lines.push({ text: 'Running...', type: 'info' })
      output.value = [...lines]

      // Capture stdout
      const stdoutLines: string[] = []
      py.setStdout({
        batched: (msg: string) => {
          stdoutLines.push(msg)
        },
      })

      // Capture stderr
      const stderrLines: string[] = []
      py.setStderr({
        batched: (msg: string) => {
          stderrLines.push(msg)
        },
      })

      // Execute the code
      try {
        await py.runPythonAsync(code)
      } catch (pythonError: any) {
        // Pyodide throws a JS error with the Python traceback
        const errMsg = pythonError.message || String(pythonError)
        // Extract just the last line of the traceback for cleaner display
        const tbLines = errMsg.split('\n').filter((l: string) => l.trim())
        const lastLine = tbLines[tbLines.length - 1] || errMsg
        stderrLines.push(lastLine)
      }

      // Build output
      lines.length = 0

      // Add stdout lines
      for (const line of stdoutLines) {
        lines.push({ text: line, type: 'output' })
      }

      // Add stderr lines
      for (const line of stderrLines) {
        lines.push({ text: line, type: 'error' })
      }

      if (lines.length === 0) {
        lines.push({ text: '(no output)', type: 'info' })
      }

    } catch (err: any) {
      lines.length = 0
      if (loadError.value) {
        lines.push({ text: `Failed to load Python: ${loadError.value}`, type: 'error' })
        lines.push({ text: 'Check your internet connection and try again.', type: 'info' })
      } else {
        lines.push({ text: `Execution error: ${err.message}`, type: 'error' })
      }
    } finally {
      isRunning.value = false
      output.value = lines
    }

    return lines
  }

  return {
    runPython,
    output,
    isRunning,
    isLoading,
    isReady,
    loadError,
    // Pre-load Pyodide without running code
    preload: ensurePyodideLoaded,
  }
}
