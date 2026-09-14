'use client'

import { useState, useMemo, useCallback } from 'react'

const COMMON_PATTERNS = [
  { name: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', flags: 'g', test: 'Contact us at hello@example.com or support@company.org' },
  { name: 'URL', pattern: 'https?:\\/\\/[^\\s]+', flags: 'g', test: 'Visit https://example.com and http://site.org/page' },
  { name: 'Phone (US)', pattern: '\\(?\\d{3}\\)?[-\\s]?\\d{3}[-\\s]?\\d{4}', flags: 'g', test: 'Call us at (555) 123-4567 or 555-987-6543' },
  { name: 'Date (YYYY-MM-DD)', pattern: '\\d{4}-\\d{2}-\\d{2}', flags: 'g', test: 'Events: 2024-01-15, 2024-12-31' },
  { name: 'Hex Color', pattern: '#[0-9a-fA-F]{3,6}', flags: 'g', test: 'Colors: #fff, #1a2b3c, #FF5733' },
  { name: 'IPv4', pattern: '\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b', flags: 'g', test: 'Servers: 192.168.1.1, 10.0.0.255' },
  { name: 'Username', pattern: '^[a-zA-Z][a-zA-Z0-9_]{2,19}$', flags: '', test: 'john_doe123' },
  { name: 'Named group', pattern: '(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})', flags: 'g', test: 'Date: 2024-06-15' },
]

const GROUP_COLORS = ['#f97316', '#3b82f6', '#10b981', '#a855f7', '#ef4444', '#f59e0b']

type Match = { start: number; end: number; text: string; groups: Record<string, string>; index: number }

function getMatches(pattern: string, flags: string, text: string): { matches: Match[]; error: string | null } {
  if (!pattern) return { matches: [], error: null }
  try {
    const f = flags.replace(/[^gimsuy]/g, '')
    const re = new RegExp(pattern, f.includes('g') ? f : 'g' + f)
    const matches: Match[] = []
    let m: RegExpExecArray | null
    let count = 0
    while ((m = re.exec(text)) !== null && count < 500) {
      const groups: Record<string, string> = {}
      if (m.groups) Object.assign(groups, m.groups)
      m.forEach((g, i) => { if (i > 0) groups[`$${i}`] = g ?? '' })
      matches.push({ start: m.index, end: m.index + m[0].length, text: m[0], groups, index: count })
      count++
      if (!f.includes('g')) break
    }
    return { matches, error: null }
  } catch (e: unknown) {
    return { matches: [], error: (e as Error).message }
  }
}

function HighlightedText({ text, matches }: { text: string; matches: Match[] }) {
  if (!matches.length) return <span className="whitespace-pre-wrap text-sm text-neutral-300">{text}</span>
  const parts: React.ReactNode[] = []
  let last = 0
  matches.forEach((m, i) => {
    if (m.start > last) parts.push(<span key={`t${i}`} className="whitespace-pre-wrap text-sm text-neutral-300">{text.slice(last, m.start)}</span>)
    const color = GROUP_COLORS[i % GROUP_COLORS.length]
    parts.push(
      <mark key={`m${i}`} style={{ background: `${color}40`, color, borderRadius: '2px', padding: '0 1px' }} title={`Match ${i + 1}: "${m.text}"`}>
        {m.text}
      </mark>
    )
    last = m.end
  })
  if (last < text.length) parts.push(<span key="tend" className="whitespace-pre-wrap text-sm text-neutral-300">{text.slice(last)}</span>)
  return <>{parts}</>
}

export default function RegexVisualizerPage() {
  const [pattern, setPattern] = useState('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}')
  const [flags, setFlags] = useState('g')
  const [testStr, setTestStr] = useState('Contact us at hello@example.com or support@company.org for assistance.')

  const { matches, error } = useMemo(() => getMatches(pattern, flags, testStr), [pattern, flags, testStr])

  const toggleFlag = useCallback((f: string) => {
    setFlags((prev) => prev.includes(f) ? prev.replace(f, '') : prev + f)
  }, [])

  const loadPreset = useCallback((p: typeof COMMON_PATTERNS[0]) => {
    setPattern(p.pattern); setFlags(p.flags); setTestStr(p.test)
  }, [])

  return (
    <div className="min-h-screen bg-[#0d1117] text-neutral-100 font-mono">
      <div className="max-w-6xl mx-auto p-6 md:p-8">
        <header className="mb-6 font-sans">
          <h1 className="text-2xl font-bold tracking-tight mb-1">Regex Visualizer</h1>
          <p className="text-sm text-neutral-500">Interactive regular expression tester with live match highlighting</p>
        </header>

        {/* Regex input */}
        <div className="mb-4">
          <div className="flex items-stretch gap-0">
            <div className="flex items-center px-3 bg-[#161b22] border border-r-0 border-[#30363d] rounded-l-lg text-neutral-400 text-lg select-none">/</div>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder="Enter regex pattern…"
              className={`flex-1 bg-[#161b22] border-y text-sm py-3 px-3 outline-none text-amber-300 ${error ? 'border-red-500' : 'border-[#30363d] focus:border-blue-500'}`}
              aria-label="Regular expression pattern"
              aria-invalid={!!error}
            />
            <div className="flex items-center px-3 bg-[#161b22] border border-l-0 border-[#30363d] text-neutral-400 text-lg">/</div>
            <div className="flex items-center gap-1 bg-[#161b22] border border-l-0 border-[#30363d] rounded-r-lg px-3">
              {['g', 'i', 'm', 's'].map((f) => (
                <button
                  key={f}
                  onClick={() => toggleFlag(f)}
                  className={`w-7 h-7 rounded text-sm font-bold transition-colors ${flags.includes(f) ? 'bg-blue-600 text-white' : 'text-neutral-500 hover:text-neutral-200'}`}
                  aria-pressed={flags.includes(f)}
                  aria-label={`Toggle ${f} flag`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          {error && <div className="text-red-400 text-xs mt-1.5 font-sans" role="alert">⚠ {error}</div>}
          {!error && pattern && (
            <div className="text-xs text-neutral-600 mt-1.5 font-sans">
              {matches.length === 0 ? 'No matches' : `${matches.length} match${matches.length !== 1 ? 'es' : ''} found`}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Test string */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="block text-xs text-neutral-500 mb-2 font-sans uppercase tracking-wider" htmlFor="test-input">Test String</label>
              <textarea
                id="test-input"
                value={testStr}
                onChange={(e) => setTestStr(e.target.value)}
                className="w-full h-32 bg-[#161b22] border border-[#30363d] rounded-lg p-3 text-sm text-neutral-300 resize-none outline-none focus:border-blue-500"
                aria-label="Test string"
              />
            </div>

            {/* Highlighted preview */}
            <div>
              <label className="block text-xs text-neutral-500 mb-2 font-sans uppercase tracking-wider">Match Highlights</label>
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 min-h-24 leading-relaxed">
                <HighlightedText text={testStr} matches={matches} />
              </div>
            </div>

            {/* Match list */}
            {matches.length > 0 && (
              <div>
                <label className="block text-xs text-neutral-500 mb-2 font-sans uppercase tracking-wider">Matches ({matches.length})</label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {matches.map((m) => {
                    const color = GROUP_COLORS[m.index % GROUP_COLORS.length]
                    return (
                      <div key={m.index} className="flex items-start gap-3 bg-[#161b22] border border-[#30363d] rounded-lg p-3">
                        <span className="text-xs px-2 py-0.5 rounded font-bold shrink-0 font-sans" style={{ background: `${color}30`, color }}>#{m.index + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-mono text-neutral-200 truncate" style={{ color }}>&quot;{m.text}&quot;</div>
                          <div className="text-xs text-neutral-600 font-sans">Index: {m.start}–{m.end}</div>
                          {Object.keys(m.groups).length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {Object.entries(m.groups).map(([k, v]) => (
                                <span key={k} className="text-xs px-1.5 py-0.5 bg-[#21262d] rounded text-neutral-400 font-sans">
                                  {k}: <span className="text-neutral-200">&quot;{v}&quot;</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: presets */}
          <div>
            <label className="block text-xs text-neutral-500 mb-2 font-sans uppercase tracking-wider">Common Patterns</label>
            <div className="space-y-1.5">
              {COMMON_PATTERNS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => loadPreset(p)}
                  className="w-full text-left px-3 py-2.5 bg-[#161b22] border border-[#30363d] hover:border-[#444] rounded-lg transition-colors group"
                >
                  <div className="text-sm font-sans text-neutral-300 group-hover:text-neutral-100">{p.name}</div>
                  <div className="text-xs text-neutral-600 truncate mt-0.5">/{p.pattern.slice(0, 30)}{p.pattern.length > 30 ? '…' : ''}/{p.flags}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
