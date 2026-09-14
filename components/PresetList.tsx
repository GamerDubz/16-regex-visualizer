export interface Preset {
  name: string
  pattern: string
  flags: string
  test: string
}

export const COMMON_PATTERNS: Preset[] = [
  { name: 'Email', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', flags: 'g', test: 'Contact us at hello@example.com or support@company.org' },
  { name: 'URL', pattern: 'https?:\\/\\/[^\\s]+', flags: 'g', test: 'Visit https://example.com and http://site.org/page' },
  { name: 'Phone (US)', pattern: '\\(?\\d{3}\\)?[-\\s]?\\d{3}[-\\s]?\\d{4}', flags: 'g', test: 'Call us at (555) 123-4567 or 555-987-6543' },
  { name: 'Date (YYYY-MM-DD)', pattern: '\\d{4}-\\d{2}-\\d{2}', flags: 'g', test: 'Events: 2024-01-15, 2024-12-31' },
  { name: 'Hex color', pattern: '#[0-9a-fA-F]{3,6}', flags: 'g', test: 'Colors: #fff, #1a2b3c, #FF5733' },
  { name: 'IPv4', pattern: '\\b\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\b', flags: 'g', test: 'Servers: 192.168.1.1, 10.0.0.255' },
  { name: 'Username', pattern: '^[a-zA-Z][a-zA-Z0-9_]{2,19}$', flags: '', test: 'john_doe123' },
  { name: 'Named date group', pattern: '(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})', flags: 'g', test: 'Date: 2024-06-15' },
  { name: 'Alternation', pattern: 'cat|dog|bird', flags: 'gi', test: 'I have a Cat, a dog, and a parrot.' },
]

interface PresetListProps {
  onSelect: (preset: Preset) => void
  activeName: string | null
}

export function PresetList({ onSelect, activeName }: PresetListProps) {
  return (
    <div>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-muted)]">
        Common patterns
      </span>
      <ul className="space-y-1.5">
        {COMMON_PATTERNS.map((p) => (
          <li key={p.name}>
            <button
              type="button"
              onClick={() => onSelect(p)}
              className={`w-full min-h-11 border px-3 py-2.5 text-left transition-fast ${
                activeName === p.name
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-wash)]'
                  : 'border-[var(--color-line)] bg-[var(--color-surface)] hover:border-[var(--color-line-strong)]'
              }`}
            >
              <div className="text-sm font-medium text-[var(--color-ink)]">{p.name}</div>
              <div className="mt-0.5 truncate font-mono text-xs text-[var(--color-ink-faint)]">
                /{p.pattern.slice(0, 30)}{p.pattern.length > 30 ? '…' : ''}/{p.flags}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
