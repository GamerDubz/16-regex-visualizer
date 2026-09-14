import type { ReactNode } from 'react'
import type { RegexMatch } from '@/lib/regex/match'

interface HighlightedTextProps {
  text: string
  matches: RegexMatch[]
}

function HighlightedText({ text, matches }: HighlightedTextProps) {
  if (!matches.length) {
    return <span className="whitespace-pre-wrap">{text}</span>
  }
  const parts: ReactNode[] = []
  let last = 0
  matches.forEach((m, i) => {
    if (m.start > last) {
      parts.push(<span key={`t${i}`} className="whitespace-pre-wrap">{text.slice(last, m.start)}</span>)
    }
    parts.push(
      <mark
        key={`m${i}`}
        className={`match-highlight whitespace-pre-wrap ${i % 2 === 1 ? 'match-alt' : ''}`}
        title={`Match ${i + 1} of ${matches.length}: "${m.text}"`}
      >
        <sup className="mr-px text-[10px] font-semibold not-italic text-[var(--color-accent-strong)]">{i + 1}</sup>
        {m.text || '​'}
      </mark>
    )
    last = m.end
  })
  if (last < text.length) {
    parts.push(<span key="tend" className="whitespace-pre-wrap">{text.slice(last)}</span>)
  }
  return <>{parts}</>
}

interface TestStringPanelProps {
  value: string
  onChange: (value: string) => void
  matches: RegexMatch[]
}

export function TestStringPanel({ value, onChange, matches }: TestStringPanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="test-input" className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
          Test string
        </label>
        <textarea
          id="test-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          spellCheck={false}
          className="w-full resize-y border border-[var(--color-line-strong)] bg-[var(--color-surface)] p-3 font-mono text-[16px] leading-relaxed text-[var(--color-ink)] outline-none transition-fast focus:border-[var(--color-accent)]"
          aria-label="Test string"
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
            Inline matches
          </span>
          {matches.length > 0 && (
            <span className="text-xs text-[var(--color-ink-faint)]">{matches.length} highlighted</span>
          )}
        </div>
        <div className="min-h-24 border border-[var(--color-line)] bg-[var(--color-surface-raised)] p-3 font-mono text-[16px] leading-relaxed text-[var(--color-ink)]">
          {value ? <HighlightedText text={value} matches={matches} /> : (
            <span className="text-[var(--color-ink-faint)]">Nothing to test yet — type a string above.</span>
          )}
        </div>
      </div>
    </div>
  )
}
