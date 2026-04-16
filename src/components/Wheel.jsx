import { useEffect, useMemo, useRef, useState } from 'react'
import ResultModal from './ResultModal.jsx'

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

const RESPIN_WARNING_THRESHOLD = 3
const RESPIN_SOUND_SOURCES = [
  '/sounds/fahhh.mp3',
  'https://www.myinstants.com/media/sounds/fahhh.mp3',
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

function fitLabelToSlice(name, maxCharacters) {
  const compactName = name.trim()

  if (compactName.length <= maxCharacters) {
    return compactName
  }

  const words = compactName.split(' ').filter(Boolean)
  let candidate = ''

  for (const word of words) {
    const nextCandidate = candidate ? `${candidate} ${word}` : word

    if (nextCandidate.length > maxCharacters - 1) {
      break
    }

    candidate = nextCandidate
  }

  if (candidate) {
    return `${candidate}...`
  }

  return `${compactName.slice(0, Math.max(1, maxCharacters - 1))}...`
}

function normalizeLabelRotation(angle) {
  const normalizedAngle = ((angle % 360) + 360) % 360

  if (normalizedAngle > 90 && normalizedAngle < 270) {
    return normalizedAngle + 180
  }

  return normalizedAngle
}

function Wheel({
  isDark,
  mallName,
  options,
  lastResult,
  disabledMessage,
  isLoading,
  onSpinComplete,
}) {
  const [rotation, setRotation] = useState(0)
  const [isSpinning, setIsSpinning] = useState(false)
  const [currentResult, setCurrentResult] = useState(lastResult)
  const [pendingResult, setPendingResult] = useState(null)
  const [isResultModalOpen, setIsResultModalOpen] = useState(false)
  const [isRespinWarningOpen, setIsRespinWarningOpen] = useState(false)
  const [respinCount, setRespinCount] = useState(0)
  const spinTimeoutRef = useRef(null)
  const resultTimeoutRef = useRef(null)
  const audioRef = useRef(null)
  const size = 680
  const center = size / 2
  const radius = 304
  const durationMs = 4800
  const segmentAngle = options.length ? 360 / options.length : 0
  const isDenseWheel = options.length >= 16
  const labelRadius = radius * (isDenseWheel ? 0.78 : 0.72)
  const labelFontSize = isDenseWheel ? 11 : 13
  const segmentAngleInRadians = segmentAngle ? (segmentAngle * Math.PI) / 180 : 0
  const labelWidth = Math.max(
    42,
    2 * labelRadius * Math.tan(segmentAngleInRadians / 2) * 0.9,
  )
  const labelMaxCharacters = Math.max(
    4,
    Math.floor(labelWidth / (labelFontSize * 0.58)),
  )

  const segments = useMemo(
    () =>
      options.map((option, index) => {
        const startAngle = index * segmentAngle - 90
        const endAngle = startAngle + segmentAngle
        const labelAngle = startAngle + segmentAngle / 2
        const labelPoint = toPoint(labelAngle, labelRadius, center)
        const label = fitLabelToSlice(option.name, labelMaxCharacters)

        return {
          id: option.id,
          name: option.name,
          path: createSegmentPath(startAngle, endAngle, radius, center),
          fill: COLORS[index % COLORS.length],
          label,
          labelPoint,
          labelRotation: normalizeLabelRotation(labelAngle),
        }
      }),
    [center, labelMaxCharacters, labelRadius, options, radius, segmentAngle],
  )

  useEffect(() => {
    setCurrentResult(lastResult)
  }, [lastResult])

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }

    const audio = new window.Audio(RESPIN_SOUND_SOURCES[0])
    audio.preload = 'auto'
    audioRef.current = audio

    return () => {
      audio.pause()
      audioRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!isSpinning && options.length < 2) {
      setPendingResult(null)
      setIsResultModalOpen(false)
      setIsRespinWarningOpen(false)
    }
  }, [isSpinning, options.length])

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

  function startSpin() {
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
    setRotation(nextRotation)
    setCurrentResult('')
    setPendingResult(null)
    setIsResultModalOpen(false)
    setIsRespinWarningOpen(false)

    resultTimeoutRef.current = window.setTimeout(() => {
      setCurrentResult(chosen.name)
      setPendingResult(chosen)
      setIsResultModalOpen(true)
      void onSpinComplete(chosen)
    }, durationMs)
  }

async function playRespinSound() {
    if (!audioRef.current) {
      return
    }

    for (const source of RESPIN_SOUND_SOURCES) {
      try {
        const resolvedSource = new URL(source, window.location.origin).href

        if (audioRef.current.src !== resolvedSource) {
          audioRef.current.src = source
        }

        audioRef.current.currentTime = 0
        await audioRef.current.play()
        return
      } catch {
        continue
      }
    }
  }

  function handleSpinAgain() {
    if (isSpinning) {
      return
    }

    if (respinCount >= RESPIN_WARNING_THRESHOLD) {
      setIsResultModalOpen(false)
      setIsRespinWarningOpen(true)
      return
    }

    void playRespinSound()
    setRespinCount((currentCount) => currentCount + 1)
    setIsResultModalOpen(false)
    startSpin()
  }

  function handleRespinWarningConfirm() {
    setIsRespinWarningOpen(false)
    setRespinCount(0)
  }

  function handleRespinWarningSpinAgain() {
    if (isSpinning) {
      return
    }

    void playRespinSound()
    setIsRespinWarningOpen(false)
    setRespinCount((currentCount) => currentCount + 1)
    startSpin()
  }

  function handleResultConfirm() {
    setIsResultModalOpen(false)
    setRespinCount(0)
  }

  const canSpin = !isSpinning && !isLoading && options.length >= 2

  return (
    <>
      <section className="wheel-card" data-mode={isDark ? 'dark' : 'light'}>
        <div className="wheel-card-header">
          <div>
            <p className="section-kicker" data-mode={isDark ? 'dark' : 'light'}>Wheel</p>
            <h2 className="section-title text-2xl" data-mode={isDark ? 'dark' : 'light'}>{mallName}</h2>
          </div>
          <div className="wheel-card-actions">
            <div className="wheel-result-summary">
              <p className="wheel-result-kicker" data-mode={isDark ? 'dark' : 'light'}>Result</p>
              <p className="wheel-result-name" data-mode={isDark ? 'dark' : 'light'}>
                {currentResult || 'Waiting for the next spin'}
              </p>
              <p className="wheel-result-meta" data-mode={isDark ? 'dark' : 'light'}>
                {options.length} in wheel
              </p>
            </div>
            <button
              type="button"
              onClick={startSpin}
              disabled={!canSpin}
              className="wheel-spin-button"
            >
              {isSpinning ? 'Spinning...' : 'Spin Wheel'}
            </button>
          </div>
        </div>

        <div className="wheel-viewport">
          <div className="wheel-canvas-shell">
            <div className="wheel-canvas-frame" data-mode={isDark ? 'dark' : 'light'}>
              <div className="wheel-pointer" />
              <svg
                viewBox={`0 0 ${size} ${size}`}
                className="wheel-svg"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: isSpinning
                    ? `transform ${durationMs}ms cubic-bezier(0.12, 0.82, 0.18, 1)`
                    : 'none',
                }}
              >
                <circle
                  cx={center}
                  cy={center}
                  r={radius + 12}
                  fill={isDark ? '#334155' : '#e2e8f0'}
                />
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
                        fontSize={labelFontSize}
                        fontWeight="700"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${segment.labelRotation} ${segment.labelPoint.x} ${segment.labelPoint.y})`}
                      >
                        {segment.label}
                      </text>
                    </g>
                  ))
                ) : (
                  <text
                    x={center}
                    y={center}
                    fill={isDark ? '#cbd5e1' : '#475569'}
                    fontSize="24"
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    Need at least two foods to spin
                  </text>
                )}
                <g
                  role="button"
                  tabIndex={canSpin ? 0 : -1}
                  aria-label={canSpin ? 'Spin wheel' : 'Wheel cannot spin yet'}
                  onClick={canSpin ? startSpin : undefined}
                  onKeyDown={(event) => {
                    if (!canSpin) {
                      return
                    }

                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      startSpin()
                    }
                  }}
                  className={canSpin ? 'cursor-pointer' : 'cursor-not-allowed'}
                >
                  <circle
                    cx={center}
                    cy={center}
                    r="30"
                    fill="#0f172a"
                    stroke={canSpin ? '#10b981' : '#475569'}
                    strokeWidth="4"
                  />
                  <circle cx={center} cy={center} r="12" fill="#fff" opacity="0.9" />
                </g>
              </svg>
            </div>
          </div>
          {options.length < 2 ? (
            <p className="wheel-empty-message" data-mode={isDark ? 'dark' : 'light'}>{disabledMessage}</p>
          ) : null}
        </div>
      </section>

      <ResultModal
        isDark={isDark}
        isOpen={isResultModalOpen}
        resultName={pendingResult?.name ?? ''}
        onConfirm={handleResultConfirm}
        onSpinAgain={handleSpinAgain}
      />

      <ResultModal
        isDark={isDark}
        isOpen={isRespinWarningOpen}
        resultName={pendingResult?.name ?? ''}
        message="You already spun again a few times. This one still not good enough?"
        confirmLabel="OK FINE"
        spinAgainLabel="I DONT CARE"
        onConfirm={handleRespinWarningConfirm}
        onSpinAgain={handleRespinWarningSpinAgain}
      />
    </>
  )
}

export default Wheel
