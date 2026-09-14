import type { GroupKind, RegexNode } from './types'
import { RegexParseError } from './types'

const ESCAPE_CLASSES = new Set(['d', 'D', 'w', 'W', 's', 'S'])

class Parser {
  private src: string
  private pos = 0
  private groupIndex = 0

  constructor(src: string) {
    this.src = src
  }

  private peek(offset = 0): string | undefined {
    return this.src[this.pos + offset]
  }

  private eof(): boolean {
    return this.pos >= this.src.length
  }

  private advance(): string {
    const ch = this.src[this.pos]
    this.pos += 1
    return ch
  }

  parseRoot(): RegexNode {
    const node = this.parseAlternation()
    if (!this.eof()) {
      throw new RegexParseError(`Unexpected "${this.peek()}" at position ${this.pos}`)
    }
    return node
  }

  private parseAlternation(): RegexNode {
    const branches: RegexNode[] = [this.parseSequence()]
    while (this.peek() === '|') {
      this.advance()
      branches.push(this.parseSequence())
    }
    if (branches.length === 1) return branches[0]
    return { type: 'alternation', branches }
  }

  private parseSequence(): RegexNode {
    const items: RegexNode[] = []
    while (!this.eof() && this.peek() !== '|' && this.peek() !== ')') {
      items.push(this.parseQuantified())
    }
    return { type: 'sequence', items: mergeLiterals(items) }
  }

  private parseQuantified(): RegexNode {
    const atom = this.parseAtom()
    const ch = this.peek()
    if (ch === '*' || ch === '+' || ch === '?') {
      this.advance()
      let greedy = true
      if (this.peek() === '?') {
        this.advance()
        greedy = false
      }
      const min = ch === '+' ? 1 : 0
      const max = ch === '?' ? 1 : null
      return { type: 'quantifier', child: atom, min, max, greedy, raw: ch }
    }
    if (ch === '{') {
      const braceMatch = /^\{(\d+)(,(\d*)?)?\}/.exec(this.src.slice(this.pos))
      if (braceMatch) {
        this.pos += braceMatch[0].length
        const min = Number(braceMatch[1])
        const hasComma = braceMatch[2] !== undefined
        const max = hasComma ? (braceMatch[3] ? Number(braceMatch[3]) : null) : min
        let greedy = true
        if (this.peek() === '?') {
          this.advance()
          greedy = false
        }
        return { type: 'quantifier', child: atom, min, max, greedy, raw: braceMatch[0] }
      }
    }
    return atom
  }

  private parseAtom(): RegexNode {
    const ch = this.peek()
    if (ch === undefined) throw new RegexParseError('Unexpected end of pattern')

    if (ch === '(') return this.parseGroup()
    if (ch === '[') return this.parseCharClass()
    if (ch === '.') {
      this.advance()
      return { type: 'any' }
    }
    if (ch === '^' || ch === '$') {
      this.advance()
      return { type: 'anchor', kind: ch }
    }
    if (ch === '\\') return this.parseEscape()
    if (ch === ')' || ch === '|') {
      throw new RegexParseError(`Unexpected "${ch}" at position ${this.pos}`)
    }
    this.advance()
    return { type: 'literal', value: ch }
  }

  private parseGroup(): RegexNode {
    this.advance() // (
    let kind: GroupKind = 'capture'
    let name: string | undefined
    let index: number | undefined

    if (this.peek() === '?') {
      const next = this.peek(1)
      if (next === ':') {
        this.pos += 2
        kind = 'noncapture'
      } else if (next === '=') {
        this.pos += 2
        kind = 'lookahead'
      } else if (next === '!') {
        this.pos += 2
        kind = 'neg-lookahead'
      } else if (next === '<' && (this.peek(2) === '=' || this.peek(2) === '!')) {
        kind = this.peek(2) === '=' ? 'lookbehind' : 'neg-lookbehind'
        this.pos += 3
      } else if (next === '<') {
        // named group (?<name>...)
        this.pos += 2
        const end = this.src.indexOf('>', this.pos)
        if (end === -1) throw new RegexParseError('Unterminated group name')
        name = this.src.slice(this.pos, end)
        this.pos = end + 1
        kind = 'named'
        this.groupIndex += 1
        index = this.groupIndex
      } else {
        throw new RegexParseError(`Unsupported group syntax at position ${this.pos}`)
      }
    } else {
      this.groupIndex += 1
      index = this.groupIndex
    }

    const child = this.parseAlternation()
    if (this.peek() !== ')') throw new RegexParseError('Unterminated group — missing ")"')
    this.advance()
    return { type: 'group', kind, name, index, child }
  }

  private parseCharClass(): RegexNode {
    const start = this.pos
    this.advance() // [
    if (this.peek() === '^') this.advance()
    if (this.peek() === ']') this.advance()
    while (!this.eof() && this.peek() !== ']') {
      if (this.peek() === '\\') this.advance()
      this.advance()
    }
    if (this.eof()) throw new RegexParseError('Unterminated character class — missing "]"')
    this.advance() // ]
    return { type: 'charclass', raw: this.src.slice(start, this.pos) }
  }

  private parseEscape(): RegexNode {
    const start = this.pos
    this.advance() // backslash
    const ch = this.advance()
    if (ch === undefined) throw new RegexParseError('Trailing backslash')

    if (ch === 'b' || ch === 'B') {
      return { type: 'anchor', kind: `\\${ch}` as '\\b' | '\\B' }
    }
    if (ESCAPE_CLASSES.has(ch)) {
      return { type: 'escape', raw: `\\${ch}` }
    }
    if (ch === 'p' || ch === 'P') {
      if (this.peek() === '{') {
        const end = this.src.indexOf('}', this.pos)
        if (end !== -1) {
          this.pos = end + 1
          return { type: 'escape', raw: this.src.slice(start, this.pos) }
        }
      }
      return { type: 'escape', raw: `\\${ch}` }
    }
    if (ch === 'k' && this.peek() === '<') {
      const end = this.src.indexOf('>', this.pos)
      if (end !== -1) {
        this.pos = end + 1
        return { type: 'backref', raw: this.src.slice(start, this.pos) }
      }
    }
    if (/[1-9]/.test(ch)) {
      let numStr = ch
      while (/[0-9]/.test(this.peek() ?? '')) numStr += this.advance()
      return { type: 'backref', raw: `\\${numStr}` }
    }
    if (ch === 'u') {
      if (this.peek() === '{') {
        const end = this.src.indexOf('}', this.pos)
        if (end !== -1) {
          this.pos = end + 1
          return { type: 'literal', value: this.src.slice(start, this.pos) }
        }
      } else if (/^[0-9a-fA-F]{4}/.test(this.src.slice(this.pos))) {
        this.pos += 4
        return { type: 'literal', value: this.src.slice(start, this.pos) }
      }
      return { type: 'literal', value: `\\${ch}` }
    }
    if (ch === 'x' && /^[0-9a-fA-F]{2}/.test(this.src.slice(this.pos))) {
      this.pos += 2
      return { type: 'literal', value: this.src.slice(start, this.pos) }
    }
    // Ordinary escaped literal (\. \+ \( \) \n \t \\ etc.) — keep raw source
    // text so the diagram shows exactly what the author wrote.
    return { type: 'literal', value: `\\${ch}` }
  }
}

function mergeLiterals(items: RegexNode[]): RegexNode[] {
  const out: RegexNode[] = []
  for (const item of items) {
    const prev = out[out.length - 1]
    if (item.type === 'literal' && prev?.type === 'literal') {
      prev.value += item.value
    } else {
      out.push(item)
    }
  }
  return out
}

/** Parses a regex pattern source string into a railroad-diagram AST. */
export function parseRegex(source: string): RegexNode {
  if (source === '') return { type: 'sequence', items: [] }
  return new Parser(source).parseRoot()
}
