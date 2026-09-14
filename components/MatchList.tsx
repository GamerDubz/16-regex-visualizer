import type { RegexMatch } from '@/lib/regex/match'

interface MatchListProps {
  matches: RegexMatch[]
}

export function MatchList({ matches }: MatchListProps) {
  if (matches.length === 0) return null

  return (
    <div>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
        Captures ({matches.length})
      </span>
      <ol className="max-h-72 space-y-2 overflow-y-auto">
        {matches.map((m) => (
          <li key={m.index} className="flex items-start gap-3 border border-[var(--color-line)] bg-[var(--color-surface)] p-2.5">
            <span className="mt-0.5 shrink-0 border border-[var(--color-accent-soft)] bg-[var(--color-accent-wash)] px-1.5 py-0.5 font-mono text-xs font-semibold text-[var(--color-accent-strong)]">
              #{m.index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate font-mono text-sm text-[var(--color-ink)]">&quot;{m.text}&quot;</div>
              <div className="text-xs text-[var(--color-ink-faint)]">index {m.start}–{m.end}</div>
              {Object.keys(m.groups).length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {Object.entries(m.groups).map(([k, v]) => (
                    <span key={k} className="border border-[var(--color-line)] bg-[var(--color-surface-raised)] px-1.5 py-0.5 font-mono text-xs text-[var(--color-ink-muted)]">
                      {k}: <span className="text-[var(--color-ink)]">&quot;{v}&quot;</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
