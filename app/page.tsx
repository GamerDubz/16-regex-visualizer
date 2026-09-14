'use client'

import { useCallback, useMemo, useState } from 'react'
import { Logo } from '@/components/Logo'
import { SchematicPanel } from '@/components/SchematicPanel'
import { PatternField } from '@/components/PatternField'
import { RailroadDiagram } from '@/components/RailroadDiagram'
import { TestStringPanel } from '@/components/TestStringPanel'
import { MatchList } from '@/components/MatchList'
import { PresetList, type Preset } from '@/components/PresetList'
import { getMatches } from '@/lib/regex/match'

const DEFAULT_PATTERN = '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}'
const DEFAULT_FLAGS = 'g'
const DEFAULT_TEST = 'Contact us at hello@example.com or support@company.org for assistance.'

export default function RegexVisualizerPage() {
  const [pattern, setPattern] = useState(DEFAULT_PATTERN)
  const [flags, setFlags] = useState(DEFAULT_FLAGS)
  const [testStr, setTestStr] = useState(DEFAULT_TEST)
  const [activePreset, setActivePreset] = useState<string | null>(null)

  const { matches, error } = useMemo(() => getMatches(pattern, flags, testStr), [pattern, flags, testStr])

  const handlePatternChange = useCallback((value: string) => {
    setPattern(value)
    setActivePreset(null)
  }, [])

  const toggleFlag = useCallback((f: string) => {
    setFlags((prev) => (prev.includes(f) ? prev.replace(f, '') : prev + f))
  }, [])

  const loadPreset = useCallback((p: Preset) => {
    setPattern(p.pattern)
    setFlags(p.flags)
    setTestStr(p.test)
    setActivePreset(p.name)
  }, [])

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-8">
        <header className="mb-8 flex items-center gap-3">
          <Logo className="h-8 w-10 shrink-0 text-[var(--color-accent-strong)]" />
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-[var(--color-ink)]">Regex Visualizer</h1>
            <p className="text-sm text-[var(--color-ink-muted)]">
              Live matching with an inline schematic of your pattern&apos;s structure
            </p>
          </div>
        </header>

        <div className="mb-6">
          <PatternField
            pattern={pattern}
            onPatternChange={handlePatternChange}
            flags={flags}
            onToggleFlag={toggleFlag}
            error={error}
            matchCount={matches.length}
          />
        </div>

        <div className="mb-6">
          <SchematicPanel label="Structure">
            <div className="overflow-x-auto p-4">
              <RailroadDiagram pattern={pattern} />
            </div>
          </SchematicPanel>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div className="space-y-6">
            <TestStringPanel value={testStr} onChange={setTestStr} matches={matches} />
            <MatchList matches={matches} />
          </div>

          <aside>
            <PresetList onSelect={loadPreset} activeName={activePreset} />
          </aside>
        </div>

        <footer className="mt-10 border-t border-[var(--color-line)] pt-4 text-xs text-[var(--color-ink-faint)]">
          Matching runs entirely in your browser via the native JavaScript RegExp engine.
        </footer>
      </div>
    </div>
  )
}
