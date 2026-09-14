'use client'

import { useState } from 'react'
import { Check, Copy, TriangleAlert } from 'lucide-react'

const FLAG_INFO: Record<string, string> = {
  g: 'Global — find all matches, not just the first',
  i: 'Ignore case',
  m: 'Multiline — ^ and $ match line boundaries',
  s: 'Dot-all — . also matches line breaks',
}

interface PatternFieldProps {
  pattern: string
  onPatternChange: (value: string) => void
  flags: string
  onToggleFlag: (flag: string) => void
  error: string | null
  matchCount: number
}

export function PatternField({ pattern, onPatternChange, flags, onToggleFlag, error, matchCount }: PatternFieldProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pattern)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard access denied or unavailable — no destructive fallback needed.
    }
  }

  return (
    <div>
      <label htmlFor="pattern-input" className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
        Pattern
      </label>
      <div className="flex items-stretch">
        <div
          aria-hidden="true"
          className="flex select-none items-center border border-r-0 border-[var(--color-line-strong)] bg-[var(--color-surface-raised)] px-3 font-mono text-xl text-[var(--color-ink-faint)]"
        >
          /
        </div>
        <input
          id="pattern-input"
          type="text"
          value={pattern}
          onChange={(e) => onPatternChange(e.target.value)}
          placeholder="Enter a regular expression…"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          className={`min-w-0 flex-1 border-y bg-[var(--color-surface)] px-3 py-3 font-mono text-[16px] text-[var(--color-ink)] outline-none transition-fast ${
            error ? 'border-[var(--color-danger)]' : 'border-[var(--color-line-strong)] focus:border-[var(--color-accent)]'
          }`}
          aria-label="Regular expression pattern"
          aria-invalid={!!error}
          aria-describedby={error ? 'pattern-error' : 'pattern-status'}
        />
        <div
          aria-hidden="true"
          className="flex select-none items-center border-y border-[var(--color-line-strong)] bg-[var(--color-surface-raised)] px-3 font-mono text-xl text-[var(--color-ink-faint)]"
        >
          /
        </div>
        <div className="flex items-stretch border-y border-r border-[var(--color-line-strong)] bg-[var(--color-surface-raised)]">
          {['g', 'i', 'm', 's'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onToggleFlag(f)}
              className={`flex h-11 w-11 items-center justify-center border-l border-[var(--color-line)] font-mono text-sm font-semibold transition-fast first:border-l-0 ${
                flags.includes(f)
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'text-[var(--color-ink-faint)] hover:bg-[var(--color-accent-wash)] hover:text-[var(--color-accent-strong)]'
              }`}
              aria-pressed={flags.includes(f)}
              aria-label={`Toggle ${f} flag: ${FLAG_INFO[f]}`}
              title={FLAG_INFO[f]}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          disabled={!pattern}
          className="ml-2 flex h-11 w-11 shrink-0 items-center justify-center border border-[var(--color-line-strong)] bg-[var(--color-surface-raised)] text-[var(--color-ink-faint)] transition-fast hover:text-[var(--color-accent-strong)] disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={copied ? 'Pattern copied' : 'Copy pattern to clipboard'}
          title="Copy pattern"
        >
          {copied ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
        </button>
      </div>

      {error && (
        <div id="pattern-error" role="alert" className="mt-2 flex items-start gap-1.5 text-sm text-[var(--color-danger)]">
          <TriangleAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}
      {!error && pattern && (
        <div id="pattern-status" className="mt-2 text-sm text-[var(--color-ink-muted)]">
          {matchCount === 0 ? 'No matches' : `${matchCount} match${matchCount !== 1 ? 'es' : ''} found`}
        </div>
      )}
    </div>
  )
}
