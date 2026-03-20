import { useEffect, useMemo, useRef, useState } from 'react'

const COLORS = [
  '#f97316',
  '#0f766e',
  '#2563eb',
  '#dc2626',
  '#7c3aed',
  '#ca8a04',
  '#db2777',
  '#0891b2',
]

function toPoint(angleInDegrees, radius, center) {
  const angleInRadians = (angleInDegrees * Math.PI) / 180

  return {
    x: center + radius * Math.cos(angleInRadians),
    y: center + radius * Math.sin(angleInRadians),
  }
}

function createSegmentPath(startAngle, endAngle, radius, center) {
  const start = toPoint(startAngle, radius, center)
  const end = toPoint(endAngle, radius, center)
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0

  return [
    `M ${center} ${center}`,
    `L ${start.x} ${start.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
    'Z',
  ].join(' ')
}

function Wheel({
  mallName,
  options,
  lastResult,
  disabledMessage,
  isLoading,
  onSpinComplete,
}) {
  const [rotation, setRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [status, setStatus] = useState('Ready to spin.')
  const [currentResult, setCurrentResult] = useState(lastResult)
  const spinTimeoutRef = useRef(null)
  const resultTimeoutRef = useRef(null)
  const size = 360
  const center = size / 2
  const radius = 158
  const durationMs = 4800
  const segmentAngle = options.length ? 360 / options.length : 0

  const segments = useMemo(
    () =>
      options.map((option, index) => {
        const startAngle = index * segmentAngle - 90
        const endAngle = startAngle + segmentAngle
        const labelAngle = startAngle + segmentAngle / 2
        const labelPoint = toPoint(labelAngle, radius * 0.63, center)

        return {
          id: option.id,
          name: option.name,
          path: createSegmentPath(startAngle, endAngle, radius, center),
          fill: COLORS[index % COLORS.length],
          labelPoint,
          labelRotation: labelAngle + 90,
        }
      }),
    [center, options, radius, segmentAngle],
  )

  useEffect(() => {
    setCurrentResult(lastResult)
  }, [lastResult])

  useEffect(() => {
    if (isSpinning) {
      return
    }

    if (isLoading) {
      setStatus(`Loading foods for ${mallName}...`)
      return
    }

    if (options.length < 2) {
      setStatus(disabledMessage)
      return
    }

    setStatus('Ready to spin.')
  }, [disabledMessage, isLoading, isSpinning, mallName, options.length])

  useEffect(() => {
    if (!isSpinning) {
      return undefined
    }

    spinTimeoutRef.current = window.setTimeout(() => {
      setIsSpinning(false)
    }, durationMs)

    return () => {
      if (spinTimeoutRef.current) {
        window.clearTimeout(spinTimeoutRef.current)
      }
    }
  }, [durationMs, isSpinning])

  useEffect(
    () => () => {
      if (spinTimeoutRef.current) {
        window.clearTimeout(spinTimeoutRef.current)
      }

      if (resultTimeoutRef.current) {
        window.clearTimeout(resultTimeoutRef.current)
      }
    },
    [],
  )

  function handleSpin() {
    if (isSpinning || isLoading || options.length < 2) {
      return
    }

    const pickedIndex = Math.floor(Math.random() * options.length)
    const chosen = options[pickedIndex]
    const offsetToPointer =
      (360 - (pickedIndex * segmentAngle + segmentAngle / 2)) % 360
    const extraTurns = 360 * (5 + Math.floor(Math.random() * 3))
    const nextRotation = rotation + extraTurns + offsetToPointer

    setIsSpinning(true)
    setStatus(`Spinning for ${mallName}...`)
    setRotation(nextRotation)
    setCurrentResult('')

    resultTimeoutRef.current = window.setTimeout(() => {
      setStatus(`Picked: ${chosen.name}`)
      setCurrentResult(chosen.name)
      void onSpinComplete(chosen)
    }, durationMs)
  }

  return (
    <section className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            Wheel
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            {mallName}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {options.length < 2
              ? disabledMessage
              : 'The result is chosen uniformly at random across all current filtered foods.'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleSpin}
          disabled={isSpinning || isLoading || options.length < 2}
          className="rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isSpinning ? 'Spinning...' : 'Spin Wheel'}
        </button>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(280px,420px)_minmax(0,1fr)] lg:items-center">
        <div className="mx-auto w-full max-w-[420px]">
          <div className="relative aspect-square rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,1)_0%,_rgba(226,232,240,0.92)_100%)] p-4 shadow-inner">
            <div className="absolute left-1/2 top-2 z-10 h-0 w-0 -translate-x-1/2 border-x-[18px] border-t-[30px] border-x-transparent border-t-slate-950 drop-shadow-[0_10px_12px_rgba(15,23,42,0.2)]" />
            <svg
              viewBox={`0 0 ${size} ${size}`}
              className="h-full w-full drop-shadow-[0_30px_40px_rgba(15,23,42,0.16)]"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning
                  ? `transform ${durationMs}ms cubic-bezier(0.12, 0.82, 0.18, 1)`
                  : 'none',
              }}
            >
              <circle cx={center} cy={center} r={radius + 10} fill="#e2e8f0" />
              {segments.length ? (
                segments.map((segment) => (
                  <g key={segment.id}>
                    <path
                      d={segment.path}
                      fill={segment.fill}
                      stroke="rgba(255,255,255,0.92)"
                      strokeWidth="2"
                    />
                    <text
                      x={segment.labelPoint.x}
                      y={segment.labelPoint.y}
                      fill="white"
                      fontSize="13"
                      fontWeight="700"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${segment.labelRotation} ${segment.labelPoint.x} ${segment.labelPoint.y})`}
                    >
                      {segment.name.length > 16
                        ? `${segment.name.slice(0, 15)}...`
                        : segment.name}
                    </text>
                  </g>
                ))
              ) : (
                <text
                  x={center}
                  y={center}
                  fill="#475569"
                  fontSize="16"
                  fontWeight="600"
                  textAnchor="middle"
                >
                  Need at least two foods to spin
                </text>
              )}
              <circle cx={center} cy={center} r="26" fill="#0f172a" />
              <circle cx={center} cy={center} r="10" fill="#fff" opacity="0.85" />
            </svg>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
              Status
            </p>
            <p className="mt-3 text-lg font-semibold text-slate-900">{status}</p>
          </div>
          <div className="rounded-[1.75rem] bg-slate-950 p-6 text-white shadow-[0_22px_40px_rgba(15,23,42,0.28)]">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
              Result
            </p>
            <p className="mt-4 font-['Georgia','Times_New_Roman',serif] text-3xl font-bold tracking-tight sm:text-4xl">
              {currentResult || 'Waiting for the next spin'}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Matching Foods
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-950">{options.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Ready
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-950">
                {options.length >= 2 ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Wheel
