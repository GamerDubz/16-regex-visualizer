/**
 * AST node types produced by the regex parser and consumed by the railroad
 * diagram layout/renderer. This is a simplified regex grammar covering the
 * constructs the visualizer needs to draw — it is not a validating engine
 * (the browser's RegExp constructor remains the source of truth for
 * correctness; see lib/regex/match.ts).
 */

export type GroupKind =
  | 'capture'
  | 'noncapture'
  | 'named'
  | 'lookahead'
  | 'neg-lookahead'
  | 'lookbehind'
  | 'neg-lookbehind'

export type AnchorKind = '^' | '$' | '\\b' | '\\B'

export interface LiteralNode {
  type: 'literal'
  value: string
}

export interface CharClassNode {
  type: 'charclass'
  raw: string
}

export interface AnyCharNode {
  type: 'any'
}

export interface AnchorNode {
  type: 'anchor'
  kind: AnchorKind
}

export interface EscapeNode {
  type: 'escape'
  raw: string
}

export interface BackrefNode {
  type: 'backref'
  raw: string
}

export interface GroupNode {
  type: 'group'
  kind: GroupKind
  name?: string
  index?: number
  child: RegexNode
}

export interface QuantifierNode {
  type: 'quantifier'
  child: RegexNode
  min: number
  max: number | null
  greedy: boolean
  raw: string
}

export interface SequenceNode {
  type: 'sequence'
  items: RegexNode[]
}

export interface AlternationNode {
  type: 'alternation'
  branches: RegexNode[]
}

export type RegexNode =
  | LiteralNode
  | CharClassNode
  | AnyCharNode
  | AnchorNode
  | EscapeNode
  | BackrefNode
  | GroupNode
  | QuantifierNode
  | SequenceNode
  | AlternationNode

export class RegexParseError extends Error {}
