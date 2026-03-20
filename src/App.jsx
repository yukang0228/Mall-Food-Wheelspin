import { useEffect, useMemo, useState } from 'react'
import History from './components/History.jsx'
import ImportExport from './components/ImportExport.jsx'
import MallSelector from './components/MallSelector.jsx'
import OptionsEditor from './components/OptionsEditor.jsx'
import Wheel from './components/Wheel.jsx'
import {
  SCHEMA_VERSION,
  loadStoredState,
  saveStoredState,
} from './lib/storage.js'

const HISTORY_LIMIT = 50
const DEFAULT_MALLS = [
  {
    id: 'ioi-city-mall',
    name: 'IOI City Mall',
    options: [
      { id: crypto.randomUUID(), name: 'Nasi Lemak', normalizedName: 'nasi lemak' },
      { id: crypto.randomUUID(), name: 'Ramen', normalizedName: 'ramen' },
      { id: crypto.randomUUID(), name: 'Chicken Rice', normalizedName: 'chicken rice' },
    ],
  },
  {
    id: 'the-exchange-trx',
    name: 'The Exchange TRX',
    options: [
      { id: crypto.randomUUID(), name: 'Pasta', normalizedName: 'pasta' },
      { id: crypto.randomUUID(), name: 'Burger', normalizedName: 'burger' },
      { id: crypto.randomUUID(), name: 'Sushi', normalizedName: 'sushi' },
    ],
  },
  {
    id: 'mid-valley-megamall',
    name: 'Mid Valley Megamall',
    options: [
      { id: crypto.randomUUID(), name: 'Bak Kut Teh', normalizedName: 'bak kut teh' },
      { id: crypto.randomUUID(), name: 'Ban Mian', normalizedName: 'ban mian' },
      { id: crypto.randomUUID(), name: 'Korean Fried Chicken', normalizedName: 'korean fried chicken' },
    ],
  },
]

function createDefaultState() {
  return {
    malls: DEFAULT_MALLS,
    activeMallId: DEFAULT_MALLS[0]?.id ?? '',
    history: [],
  }
}

function normalizeOptionName(value) {
  return value
    .replace(/[\u2018\u2019\u02bc]/g, "'")
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
}

function sanitizeOptions(options) {
  const seen = new Set()

  return (Array.isArray(options) ? options : []).reduce((list, option) => {
    const rawName =
      typeof option === 'string'
        ? option
        : typeof option?.name === 'string'
          ? option.name
          : ''
    const cleanName = rawName
      .replace(/[\u2018\u2019\u02bc]/g, "'")
      .trim()
      .replace(/\s+/g, ' ')
    const normalizedName = normalizeOptionName(cleanName)

    if (!cleanName || seen.has(normalizedName)) {
      return list
    }

    seen.add(normalizedName)
    list.push({
      id: option?.id || crypto.randomUUID(),
      name: cleanName,
      normalizedName,
    })
    return list
  }, [])
}

function sanitizeMall(mall, fallbackName) {
  const name =
    typeof mall?.name === 'string' && mall.name.trim()
      ? mall.name.trim()
      : fallbackName

  return {
    id: mall?.id || crypto.randomUUID(),
    name,
    options: sanitizeOptions(mall?.options),
  }
}

function sanitizeHistory(history, malls) {
  return (Array.isArray(history) ? history : [])
    .map((entry) => {
      const mallMatch = malls.find((mall) => mall.id === entry?.mallId)

      if (
        !entry ||
        typeof entry.result !== 'string' ||
        typeof entry.timestamp !== 'string'
      ) {
        return null
      }

      return {
        id: entry.id || crypto.randomUUID(),
        timestamp: entry.timestamp,
        mallId: mallMatch?.id || entry.mallId || '',
        mallName:
          mallMatch?.name ||
          (typeof entry.mallName === 'string' && entry.mallName.trim()) ||
          'Unknown Mall',
        result: entry.result.trim(),
      }
    })
    .filter(Boolean)
    .slice(0, HISTORY_LIMIT)
}

function sanitizeState(input) {
  const candidateMalls =
    Array.isArray(input?.malls) && input.malls.length
      ? input.malls.map((mall, index) => sanitizeMall(mall, `Mall ${index + 1}`))
      : DEFAULT_MALLS.map((mall) => ({
          ...mall,
          options: sanitizeOptions(mall.options),
        }))

  const uniqueMalls = candidateMalls.reduce((list, mall) => {
    if (list.some((existing) => existing.id === mall.id)) {
      list.push({ ...mall, id: crypto.randomUUID() })
      return list
    }

    list.push(mall)
    return list
  }, [])

  const activeMallId = uniqueMalls.some((mall) => mall.id === input?.activeMallId)
    ? input.activeMallId
    : uniqueMalls[0]?.id ?? ''

  return {
    malls: uniqueMalls,
    activeMallId,
    history: sanitizeHistory(input?.history, uniqueMalls),
  }
}

function App() {
  const [appState, setAppState] = useState(() =>
    sanitizeState(loadStoredState(createDefaultState())),
  )
  const [lastResult, setLastResult] = useState('')
  const activeMall = useMemo(
    () => appState.malls.find((mall) => mall.id === appState.activeMallId) ?? null,
    [appState.activeMallId, appState.malls],
  )

  useEffect(() => {
    saveStoredState(appState)
  }, [appState])

  function updateActiveMall(updater) {
    setAppState((current) => ({
      ...current,
      malls: current.malls.map((mall) =>
        mall.id === current.activeMallId ? updater(mall) : mall,
      ),
    }))
  }

  function handleAddOption(name) {
    updateActiveMall((mall) => ({
      ...mall,
      options: sanitizeOptions([...mall.options, { name }]),
    }))
  }

  function handleUpdateOption(optionId, name) {
    updateActiveMall((mall) => ({
      ...mall,
      options: sanitizeOptions(
        mall.options.map((option) =>
          option.id === optionId ? { ...option, name } : option,
        ),
      ),
    }))
  }

  function handleDeleteOption(optionId) {
    updateActiveMall((mall) => ({
      ...mall,
      options: mall.options.filter((option) => option.id !== optionId),
    }))
  }

  function handleBulkImport(rawText) {
    const importedOptions = rawText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((name) => ({ name }))

    if (!importedOptions.length) {
      return 0
    }

    let addedCount = 0

    setAppState((current) => ({
      ...current,
      malls: current.malls.map((mall) => {
        if (mall.id !== current.activeMallId) {
          return mall
        }

        const nextOptions = sanitizeOptions([...mall.options, ...importedOptions])
        addedCount = nextOptions.length - mall.options.length
        return { ...mall, options: nextOptions }
      }),
    }))

    return addedCount
  }

  function handleSpinResult(result) {
    if (!activeMall) {
      return
    }

    const entry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      mallId: activeMall.id,
      mallName: activeMall.name,
      result,
    }

    setLastResult(result)
    setAppState((current) => ({
      ...current,
      history: [entry, ...current.history].slice(0, HISTORY_LIMIT),
    }))
  }

  function handleImportState(nextState) {
    setLastResult('')
    setAppState(sanitizeState(nextState))
  }

  const exportPayload = {
    version: SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    ...appState,
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,239,213,0.85),_rgba(249,250,251,0.96)_45%,_rgba(214,228,255,0.85)_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-orange-700">
                Mall Food Wheelspin
              </p>
              <h1 className="font-['Trebuchet_MS','Avenir_Next',sans-serif] text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                Spin once, settle lunch, move on.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Pick a mall, tune the food list, then let the wheel decide with a
                uniform random result. Everything stays in localStorage and the last
                50 spins remain in history.
              </p>
            </div>
            <ImportExport
              exportData={exportPayload}
              onImport={handleImportState}
            />
          </div>
        </header>

        <main className="mt-6 grid flex-1 gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
          <section className="space-y-6">
            <MallSelector
              malls={appState.malls}
              activeMallId={appState.activeMallId}
              onSelect={(mallId) =>
                setAppState((current) => ({ ...current, activeMallId: mallId }))
              }
            />
            <Wheel
              key={activeMall?.id ?? 'wheel'}
              mallName={activeMall?.name ?? 'Select a mall'}
              options={activeMall?.options ?? []}
              lastResult={lastResult}
              onSpinComplete={handleSpinResult}
            />
          </section>

          <aside className="space-y-6">
            <OptionsEditor
              mall={activeMall}
              onAddOption={handleAddOption}
              onUpdateOption={handleUpdateOption}
              onDeleteOption={handleDeleteOption}
              onBulkImport={handleBulkImport}
            />
            <History entries={appState.history} />
          </aside>
        </main>
      </div>
    </div>
  )
}

export default App
