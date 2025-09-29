import React, { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

function CodeBlock({ code, language = 'python' }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = code
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (fallbackErr) {
        console.error('Failed to copy code:', fallbackErr)
      }
      document.body.removeChild(textArea)
    }
  }

  return (
    <div className="code-block">
      <div className="code-header">
        <span className="language-tag">{language}</span>
        <button 
          className={`copy-button ${copied ? 'copied' : ''}`}
          onClick={copyToClipboard}
          title="Copy code"
        >
          {copied ? '✓ Copied!' : '📋 Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          borderRadius: '0 0 8px 8px',
          fontSize: '14px',
        }}
        showLineNumbers={true}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

function parseContent(text) {
  if (!text) return []

  const parts = []
  let currentIndex = 0
  
  // Enhanced regex to match code blocks with optional language
  const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g
  let match

  while ((match = codeBlockRegex.exec(text)) !== null) {
    // Add text before code block
    if (match.index > currentIndex) {
      const beforeText = text.slice(currentIndex, match.index).trim()
      if (beforeText) {
        parts.push({ type: 'text', content: beforeText })
      }
    }

    // Add code block
    const language = match[1] || 'python' // Default to python if no language specified
    const code = match[2].trim()
    
    if (code) {
      parts.push({ 
        type: 'code', 
        content: code, 
        language: language.toLowerCase() 
      })
    }

    currentIndex = match.index + match[0].length
  }

  // Add remaining text after last code block
  if (currentIndex < text.length) {
    const remainingText = text.slice(currentIndex).trim()
    if (remainingText) {
      parts.push({ type: 'text', content: remainingText })
    }
  }

  // If no code blocks found, return the entire text as one part
  if (parts.length === 0 && text.trim()) {
    parts.push({ type: 'text', content: text.trim() })
  }

  return parts
}

function formatTextWithInlineCode(text) {
  // Handle inline code with backticks
  const parts = []
  const inlineCodeRegex = /`([^`]+)`/g
  let lastIndex = 0
  let match

  while ((match = inlineCodeRegex.exec(text)) !== null) {
    // Add text before inline code
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, match.index)
      })
    }

    // Add inline code
    parts.push({
      type: 'inline-code',
      content: match[1]
    })

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex)
    })
  }

  if (parts.length === 0) {
    parts.push({ type: 'text', content: text })
  }

  return parts
}

export default function EnhancedOutput({ output }) {
  const parts = parseContent(output)

  if (!output || output.trim() === '') {
    return <pre className="empty-output">Run the model to see results here.</pre>
  }

  return (
    <div className="enhanced-output">
      {parts.map((part, index) => {
        if (part.type === 'code') {
          return (
            <CodeBlock 
              key={index} 
              code={part.content} 
              language={part.language} 
            />
          )
        } else {
          return (
            <div key={index} className="text-content">
              {part.content.split('\n').map((line, lineIndex) => {
                const inlineParts = formatTextWithInlineCode(line)
                return (
                  <p key={lineIndex}>
                    {inlineParts.map((inlinePart, inlineIndex) => {
                      if (inlinePart.type === 'inline-code') {
                        return (
                          <code key={inlineIndex} className="inline-code">
                            {inlinePart.content}
                          </code>
                        )
                      } else {
                        return inlinePart.content || '\u00A0'
                      }
                    })}
                  </p>
                )
              })}
            </div>
          )
        }
      })}
    </div>
  )
}