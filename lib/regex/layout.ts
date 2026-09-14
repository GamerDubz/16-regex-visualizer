import type { GroupKind, RegexNode } from './types'

/**
 * Geometry engine for the railroad/schematic diagram. Every node measures
 * itself relative to a single horizontal "rail" it enters and exits on
 * (local y = 0); `up` / `down` record how far the node's artwork reaches
 * above / below that rail. Parents propagate the same rail y-coordinate to
 * children so the whole tree connects with straight, aligned lines.
 */

export const CHAR_W = 7.8
export const BOX_H = 26
export const BOX_PAD_X = 9
export const MIN_BOX_W = 30
export const GAP = 18
export const ROW_GAP = 14
export const BRANCH_GAP = 22
export const GROUP_PAD_TOP = 30
export const GROUP_PAD_BOTTOM = 13
export const GROUP_PAD_SIDE = 16
export const LOOP_GAP = 15
export const SKIP_GAP = 15
export const MARGIN = 26

export interface Metrics {
  width: number
  up: number
  down: number
}

function boxMetrics(label: string): Metrics {
  const width = Math.max(MIN_BOX_W, label.length * CHAR_W + BOX_PAD_X * 2)
  return { width, up: BOX_H / 2, down: BOX_H / 2 }
}

export function atomLabel(node: RegexNode): string {
  switch (node.type) {
    case 'literal':
      return node.value
    case 'charclass':
      return node.raw
    case 'any':
      return '.'
    case 'anchor':
      return node.kind
    case 'escape':
      return node.raw
    case 'backref':
      return node.raw
    default:
      return ''
  }
}

export function groupLabel(kind: GroupKind, name?: string, index?: number): string {
  switch (kind) {
    case 'capture':
      return `GROUP ${index ?? ''}`.trim()
    case 'named':
      return `<${name ?? ''}>`
    case 'noncapture':
      return 'NON-CAPTURING'
    case 'lookahead':
      return 'LOOKAHEAD'
    case 'neg-lookahead':
      return 'NOT AHEAD'
    case 'lookbehind':
      return 'LOOKBEHIND'
    case 'neg-lookbehind':
      return 'NOT BEHIND'
    default:
      return ''
  }
}

export function measure(node: RegexNode): Metrics {
  switch (node.type) {
    case 'literal':
    case 'charclass':
    case 'any':
    case 'anchor':
    case 'escape':
    case 'backref':
      return boxMetrics(atomLabel(node))
    case 'sequence': {
      if (node.items.length === 0) return { width: 26, up: BOX_H / 2, down: BOX_H / 2 }
      let width = 0
      let up = 0
      let down = 0
      node.items.forEach((item, i) => {
        const m = measure(item)
        if (i > 0) width += GAP
        width += m.width
        up = Math.max(up, m.up)
        down = Math.max(down, m.down)
      })
      return { width, up, down }
    }
    case 'alternation': {
      const branchMetrics = node.branches.map(measure)
      const maxBw = Math.max(...branchMetrics.map((m) => m.width))
      let bottom = 0
      branchMetrics.forEach((m, i) => {
        if (i === 0) {
          bottom = m.down
          return
        }
        bottom = bottom + ROW_GAP + m.up + m.down
      })
      return {
        width: BRANCH_GAP * 2 + maxBw,
        up: branchMetrics[0].up,
        down: bottom,
      }
    }
    case 'group': {
      const inner = measure(node.child)
      return {
        width: inner.width + GROUP_PAD_SIDE * 2,
        up: inner.up + GROUP_PAD_TOP,
        down: inner.down + GROUP_PAD_BOTTOM,
      }
    }
    case 'quantifier': {
      const child = measure(node.child)
      const repeat = node.max === null || node.max > 1
      const optional = node.min === 0
      return {
        width: child.width,
        up: child.up + (repeat ? LOOP_GAP : 0),
        down: child.down + (optional ? SKIP_GAP : 0),
      }
    }
    default:
      return { width: MIN_BOX_W, up: BOX_H / 2, down: BOX_H / 2 }
  }
}

/** Offsets (from the rail) each alternation branch is drawn at, first branch on the rail itself. */
export function alternationOffsets(branchMetrics: Metrics[]): number[] {
  const offsets: number[] = [0]
  let bottom = branchMetrics[0]?.down ?? 0
  for (let i = 1; i < branchMetrics.length; i += 1) {
    const oy = bottom + ROW_GAP + branchMetrics[i].up
    offsets.push(oy)
    bottom = oy + branchMetrics[i].down
  }
  return offsets
}
