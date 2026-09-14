export interface RegexMatch {
  start: number
  end: number
  text: string
  groups: Record<string, string>
  index: number
}

export interface MatchResult {
  matches: RegexMatch[]
  error: string | null
}

const MAX_MATCHES = 500

/** Runs `pattern`/`flags` against `text`, capped at MAX_MATCHES to keep the UI responsive. */
export function getMatches(pattern: string, flags: string, text: string): MatchResult {
  if (!pattern) return { matches: [], error: null }
  try {
    const cleanFlags = flags.replace(/[^gimsuy]/g, '')
    const execFlags = cleanFlags.includes('g') ? cleanFlags : `g${cleanFlags}`
    const re = new RegExp(pattern, execFlags)
    const matches: RegexMatch[] = []
    let m: RegExpExecArray | null
    let count = 0
    while ((m = re.exec(text)) !== null && count < MAX_MATCHES) {
      const groups: Record<string, string> = {}
      if (m.groups) Object.assign(groups, m.groups)
      m.forEach((g, i) => {
        if (i > 0) groups[`$${i}`] = g ?? ''
      })
      matches.push({ start: m.index, end: m.index + m[0].length, text: m[0], groups, index: count })
      count += 1
      if (m[0].length === 0) re.lastIndex += 1
      if (!cleanFlags.includes('g')) break
    }
    return { matches, error: null }
  } catch (e: unknown) {
    return { matches: [], error: e instanceof Error ? e.message : 'Invalid regular expression' }
  }
}
