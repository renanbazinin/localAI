import { useEffect, useMemo, useRef, useState } from 'react'
import { pipeline, env } from '@huggingface/transformers'
import EnhancedOutput from './EnhancedOutput'
import './App.css'

const MODEL_ID = 'onnx-community/Qwen2.5-Coder-1.5B-Instruct'
const DEFAULT_PROMPT = `You are a helpful coding assistant. Write a Python function called is_prime(n) that returns True when n is prime and False otherwise. Add a short docstring.`
const DEBUG_PREFIX = '[Qwen@App]'

const debug = (...args) => {
  console.log(DEBUG_PREFIX, ...args)
}

function App() {
  const [status, setStatus] = useState('Initializing…')
  const [output, setOutput] = useState('')
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT)
  const [maxTokens, setMaxTokens] = useState(256)
  const [isBusy, setIsBusy] = useState(true)
  const generatorRef = useRef(null)
  const abortRef = useRef(null)

  const messages = useMemo(
    () => [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: prompt },
    ],
    [prompt],
  )

  useEffect(() => {
    let cancelled = false

    async function preparePipeline() {
      debug('preparePipeline:start', { cancelled })
      try {
        // Enable both local and remote models for flexibility
        env.allowLocalModels = true
        env.allowRemoteModels = true
        env.localModelPath = '/models'
        debug('preparePipeline:env-config', {
          allowLocalModels: env.allowLocalModels,
          allowRemoteModels: env.allowRemoteModels,
          localModelPath: env.localModelPath,
        })
        setStatus('Loading ONNX weights (int8)…')

        const generator = await pipeline('text-generation', MODEL_ID, {
          dtype: 'int8',
          // Try local first, fallback to remote - perfect for GitHub Pages
          local_files_only: false,
          session_options: {
            executionProviders: [{ name: 'wasm', wasm: { numThreads: 1 } }],
            executionMode: 'sequential',
            enableMemPattern: false,
            graphOptimizationLevel: 'disabled',
          },
          progress_callback: ({ status: stage, file, progress }) => {
            if (cancelled) return
            const percent = progress !== undefined ? `${Math.round(progress)}%` : ''
            const fileLabel = file ? ` (${file})` : ''
            setStatus(`Loading ${stage}${fileLabel} ${percent}`.trim())
            debug('preparePipeline:progress', {
              stage,
              file,
              progress,
              percent,
            })
          },
        })

        if (cancelled) return

        generatorRef.current = generator
        debug('preparePipeline:success', { generatorLoaded: Boolean(generatorRef.current) })
        setStatus('Model ready. Update the prompt and press “Generate”.')
      } catch (error) {
        console.error('preparePipeline caught error', error)
        debug('preparePipeline:error', {
          error,
          typeofError: typeof error,
          name: error?.name,
          message: error?.message,
          stack: error?.stack,
          cause: error?.cause,
          keys: error && typeof error === 'object' ? Object.keys(error) : null,
        })
        if (!cancelled) {
          setStatus(`Failed to load model: ${error.message}`)
        }
      } finally {
        debug('preparePipeline:end', { cancelled })
        if (!cancelled) {
          setIsBusy(false)
        }
      }
    }

    preparePipeline()

    return () => {
      debug('preparePipeline:cleanup')
      cancelled = true
      if (abortRef.current) {
        debug('preparePipeline:cleanup aborting current generation')
        abortRef.current.abort()
      }
    }
  }, [])

  async function handleGenerate(event) {
    event.preventDefault()
    debug('handleGenerate:submit', { hasGenerator: Boolean(generatorRef.current) })
    if (!generatorRef.current) {
      debug('handleGenerate:no-generator')
      setStatus('Model not ready yet. Please wait…')
      return
    }

    // Show loading overlay immediately
    setIsBusy(true)
    setOutput('')
    setStatus('Preparing to generate response…')
    debug('handleGenerate:starting', { promptLength: prompt.length, maxTokens })

    // Small delay to ensure the loading overlay appears before heavy computation
    await new Promise(resolve => setTimeout(resolve, 100))

    const controller = new AbortController()
    abortRef.current = controller
    debug('handleGenerate:abort-controller-created')

    try {
      setStatus('Generating response…')
      const [result] = await generatorRef.current(messages, {
        max_new_tokens: maxTokens,
        do_sample: false,
        signal: controller.signal,
      })
      debug('handleGenerate:result-received', {
        hasResult: Boolean(result),
        tokensGenerated: result?.generated_text?.length,
      })

      const assistantMessage = result.generated_text.at(-1)?.content ?? ''
      setOutput(assistantMessage.trim())
      debug('handleGenerate:assistant-message', assistantMessage)
      setStatus('Generation complete.')
    } catch (error) {
      debug('handleGenerate:error', {
        error,
        typeofError: typeof error,
        name: error?.name,
        message: error?.message,
        stack: error?.stack,
        cause: error?.cause,
      })
      if (error.name === 'AbortError') {
        setStatus('Generation cancelled.')
      } else {
        console.error(error)
        setStatus(`Generation failed: ${error.message}`)
      }
    } finally {
      setIsBusy(false)
      abortRef.current = null
    }
  }

  function handleCancel() {
    debug('handleCancel invoked', { canAbort: Boolean(abortRef.current) })
    if (abortRef.current) {
      abortRef.current.abort()
    }
  }

  return (
    <div className="app">
      {isBusy && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <div className="loading-text">{status}</div>
          <div className="loading-subtext">
            {generatorRef.current 
              ? "The AI is thinking... This may take a moment and could briefly freeze the browser."
              : "Loading the local ONNX model into memory..."
            }
          </div>
        </div>
      )}

      <header>
        <h1>Qwen2.5 Coder · Local ONNX</h1>
        <p className="status">{status}</p>
      </header>

      <main>
        <form className="prompt-card" onSubmit={handleGenerate}>
          <label htmlFor="prompt">Prompt</label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            spellCheck="false"
            rows={10}
          />

          <div className="actions">
            <div className="token-control">
              <label htmlFor="tokens">Max Tokens:</label>
              <input
                id="tokens"
                type="number"
                min="64"
                max="1024"
                value={maxTokens}
                onChange={(event) => setMaxTokens(Number(event.target.value))}
                disabled={isBusy}
              />
            </div>
            <button type="submit" disabled={isBusy}>
              {isBusy ? 'Working…' : 'Generate'}
            </button>
            <button
              type="button"
              className="ghost"
              onClick={handleCancel}
              disabled={!isBusy || !abortRef.current}
            >
              Cancel
            </button>
          </div>
        </form>

        <section className="output">
          <h2>Assistant output</h2>
          <EnhancedOutput output={output} />
        </section>
      </main>

      <footer>
        <small>
          Serving weights from <code>/models/onnx-community/Qwen2.5-Coder-1.5B-Instruct</code> (quantized int8).
        </small>
      </footer>
    </div>
  )
}

export default App
