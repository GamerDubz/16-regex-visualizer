'use client'

import { useMemo, type ReactNode } from 'react'
import type { RegexNode } from '@/lib/regex/types'
import { parseRegex } from '@/lib/regex/parser'
import {
  BOX_H,
  BRANCH_GAP,
  GAP,
  GROUP_PAD_SIDE,
  GROUP_PAD_TOP,
  LOOP_GAP,
  MARGIN,
  SKIP_GAP,
  alternationOffsets,
  atomLabel,
  groupLabel,
  measure,
} from '@/lib/regex/layout'

function Rail({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} className="rr-rail" />
}

function ArrowLeft({ x, y }: { x: number; y: number }) {
  return <path d={`M ${x + 6} ${y - 4} L ${x - 2} ${y} L ${x + 6} ${y + 4} Z`} className="rr-arrow" />
}

function ArrowRight({ x, y }: { x: number; y: number }) {
  return <path d={`M ${x - 6} ${y - 4} L ${x + 2} ${y} L ${x - 6} ${y + 4} Z`} className="rr-arrow" />
}

function AtomBox({ node, x, y }: { node: RegexNode; x: number; y: number }) {
  const label = atomLabel(node)
  const m = measure(node)
  const isAssertion = node.type === 'anchor'
  const description = describeAtom(node)
  return (
    <g>
      <rect
        x={x}
        y={y - BOX_H / 2}
        width={m.width}
        height={BOX_H}
        rx={3}
        className={isAssertion ? 'rr-box rr-box-assertion' : 'rr-box'}
      >
        <title>{description}</title>
      </rect>
      <text x={x + m.width / 2} y={y} className="rr-box-text" dominantBaseline="central" textAnchor="middle">
        {label}
      </text>
    </g>
  )
}

function describeAtom(node: RegexNode): string {
  switch (node.type) {
    case 'literal':
      return `Literal text "${node.value}"`
    case 'charclass':
      return `Character class ${node.raw}`
    case 'any':
      return 'Any character (except line break)'
    case 'anchor':
      return node.kind === '^'
        ? 'Start of string/line'
        : node.kind === '$'
          ? 'End of string/line'
          : node.kind === '\\b'
            ? 'Word boundary'
            : 'Non-word boundary'
    case 'escape':
      return `Shorthand class ${node.raw}`
    case 'backref':
      return `Backreference ${node.raw}`
    default:
      return ''
  }
}

function renderNode(node: RegexNode, x: number, y: number, key: string): ReactNode {
  switch (node.type) {
    case 'literal':
    case 'charclass':
    case 'any':
    case 'anchor':
    case 'escape':
    case 'backref':
      return <AtomBox key={key} node={node} x={x} y={y} />

    case 'sequence': {
      if (node.items.length === 0) {
        const m = measure(node)
        return <Rail key={key} x1={x} y1={y} x2={x + m.width} y2={y} />
      }
      let cursor = x
      const parts: ReactNode[] = []
      node.items.forEach((item, i) => {
        const m = measure(item)
        if (i > 0) {
          parts.push(<Rail key={`${key}-g${i}`} x1={cursor} y1={y} x2={cursor + GAP} y2={y} />)
          cursor += GAP
        }
        parts.push(renderNode(item, cursor, y, `${key}-i${i}`))
        cursor += m.width
      })
      return <g key={key}>{parts}</g>
    }

    case 'alternation': {
      const m = measure(node)
      const branchMetrics = node.branches.map(measure)
      const offsets = alternationOffsets(branchMetrics)
      const splitX = x + BRANCH_GAP / 2
      const mergeX = x + m.width - BRANCH_GAP / 2
      const parts: ReactNode[] = [
        <Rail key={`${key}-in`} x1={x} y1={y} x2={splitX} y2={y} />,
        <Rail key={`${key}-out`} x1={mergeX} y1={y} x2={x + m.width} y2={y} />,
      ]
      node.branches.forEach((branch, i) => {
        const oy = offsets[i]
        const by = y + oy
        const bw = branchMetrics[i].width
        const branchStart = x + BRANCH_GAP
        parts.push(
          <Rail key={`${key}-sv${i}`} x1={splitX} y1={y} x2={splitX} y2={by} />,
          <Rail key={`${key}-sh${i}`} x1={splitX} y1={by} x2={branchStart} y2={by} />,
          renderNode(branch, branchStart, by, `${key}-b${i}`),
          <Rail key={`${key}-eh${i}`} x1={branchStart + bw} y1={by} x2={mergeX} y2={by} />,
          <Rail key={`${key}-ev${i}`} x1={mergeX} y1={by} x2={mergeX} y2={y} />
        )
      })
      return <g key={key}>{parts}</g>
    }

    case 'group': {
      const inner = measure(node.child)
      const m = measure(node)
      const top = y - m.up
      const label = groupLabel(node.kind, node.name, node.index)
      const isAssertion = node.kind.includes('look')
      const innerX = x + GROUP_PAD_SIDE
      return (
        <g key={key}>
          <Rail x1={x} y1={y} x2={innerX} y2={y} />
          <Rail x1={innerX + inner.width} y1={y} x2={x + m.width} y2={y} />
          <rect
            x={x}
            y={top}
            width={m.width}
            height={m.up + m.down}
            rx={4}
            className={isAssertion ? 'rr-group rr-group-assertion' : 'rr-group'}
          />
          <text x={x + 10} y={top + GROUP_PAD_TOP / 2 + 2} className="rr-group-label">
            {label}
          </text>
          {renderNode(node.child, innerX, y, `${key}-c`)}
        </g>
      )
    }

    case 'quantifier': {
      const child = measure(node.child)
      const m = measure(node)
      const repeat = node.max === null || node.max > 1
      const optional = node.min === 0
      const parts: ReactNode[] = [renderNode(node.child, x, y, `${key}-c`)]
      const qLabel = node.raw + (node.greedy ? '' : '?')

      if (repeat) {
        const topEdge = y - child.up
        const loopY = topEdge - LOOP_GAP
        parts.push(
          <path
            key={`${key}-loop`}
            d={`M ${x} ${topEdge} L ${x} ${loopY} L ${x + m.width} ${loopY} L ${x + m.width} ${topEdge}`}
            className="rr-loop"
          />,
          <ArrowLeft key={`${key}-loop-arrow`} x={x + m.width / 2} y={loopY} />,
          <text key={`${key}-loop-label`} x={x + m.width / 2} y={loopY - 7} className="rr-quant-label" textAnchor="middle">
            {qLabel}
          </text>
        )
      } else {
        parts.push(
          <text
            key={`${key}-label`}
            x={x + m.width / 2}
            y={y - child.up - 8}
            className="rr-quant-label"
            textAnchor="middle"
          >
            {qLabel}
          </text>
        )
      }

      if (optional) {
        const bottomEdge = y + child.down
        const skipY = bottomEdge + SKIP_GAP
        parts.push(
          <path
            key={`${key}-skip`}
            d={`M ${x} ${bottomEdge} L ${x} ${skipY} L ${x + m.width} ${skipY} L ${x + m.width} ${bottomEdge}`}
            className="rr-skip"
          />,
          <ArrowRight key={`${key}-skip-arrow`} x={x + m.width / 2} y={skipY} />
        )
      }

      return <g key={key}>{parts}</g>
    }

    default:
      return null
  }
}

interface RailroadDiagramProps {
  pattern: string
}

export function RailroadDiagram({ pattern }: RailroadDiagramProps) {
  const parsed = useMemo(() => {
    if (!pattern) return { ast: null as RegexNode | null, error: null as string | null }
    try {
      return { ast: parseRegex(pattern), error: null }
    } catch (e: unknown) {
      return { ast: null, error: e instanceof Error ? e.message : 'Could not parse pattern' }
    }
  }, [pattern])

  if (!pattern) {
    return (
      <div className="rr-empty" role="note">
        Type a pattern above to see its structure diagrammed here.
      </div>
    )
  }

  if (!parsed.ast) {
    return (
      <div className="rr-empty rr-empty-error" role="note">
        Structure diagram unavailable — {parsed.error ?? 'the pattern could not be parsed.'}
      </div>
    )
  }

  const m = measure(parsed.ast)
  const width = m.width + MARGIN * 2
  const height = m.up + m.down + MARGIN * 2
  const y = MARGIN + m.up
  const x = MARGIN

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label={`Structure diagram of the pattern /${pattern}/`}
      className="rr-svg"
    >
      <circle cx={x - 10} cy={y} r={3.5} className="rr-terminal" />
      <Rail x1={x - 10} y1={y} x2={x} y2={y} />
      {renderNode(parsed.ast, x, y, 'root')}
      <Rail x1={x + m.width} y1={y} x2={x + m.width + 10} y2={y} />
      <ArrowRight x={x + m.width + 10} y={y} />
    </svg>
  )
}
