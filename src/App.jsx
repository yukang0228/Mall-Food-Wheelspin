import { useEffect, useMemo, useState } from 'react'
import AdminToggle from './components/AdminToggle.jsx'
import MallSelector from './components/MallSelector.jsx'
import MallPage from './components/MallPage.jsx'
import Navbar from './components/Navbar.jsx'
import PinModal from './components/PinModal.jsx'
import Wheel from './components/Wheel.jsx'
import { clearAdminState, loadAdminState, saveAdminState } from './lib/storage.js'
import { supabase } from './lib/supabase.js'

const PAGES = {
  WHEEL: 'wheel',
  ADD_MALL: 'add-mall',
  ADD_FOOD: 'add-food',
}

const ADMIN_PIN = '1022'

function normalizeMallName(value) {
  return value.trim().replace(/\s+/g, ' ')
}

function App() {
  const [activePage, setActivePage] = useState(PAGES.WHEEL)
  const [isAdmin, setIsAdmin] = useState(() => loadAdminState())
  const [isPinModalOpen, setIsPinModalOpen] = useState(false)
  const [pinErrorMessage, setPinErrorMessage] = useState('')
  const [malls, setMalls] = useState([])
  const [isLoadingMalls, setIsLoadingMalls] = useState(true)
  const [mallErrorMessage, setMallErrorMessage] = useState('')
  const [activeMallId, setActiveMallId] = useState('')
  const [lastResult, setLastResult] = useState('')
  const activeMall = useMemo(
    () => malls.find((mall) => mall.id === activeMallId) ?? null,
    [activeMallId, malls],
  )

  useEffect(() => {
    void loadMalls()
  }, [])

  useEffect(() => {
    if (!isAdmin && activePage !== PAGES.WHEEL) {
      setActivePage(PAGES.WHEEL)
    }
  }, [activePage, isAdmin])

  async function loadMalls(preferredMallId) {
    setIsLoadingMalls(true)
    setMallErrorMessage('')

    const { data, error } = await supabase
      .from('malls')
      .select('id, name, created_on')
      .order('created_on', { ascending: true })

    if (error) {
      setMallErrorMessage(error.message)
      setIsLoadingMalls(false)
      return
    }

    const nextMalls = (data ?? []).map((mall) => ({
      ...mall,
      name: normalizeMallName(mall.name),
      options: [],
    }))

    setMalls(nextMalls)
    setActiveMallId((currentMallId) => {
      if (preferredMallId && nextMalls.some((mall) => mall.id === preferredMallId)) {
        return preferredMallId
      }

      if (nextMalls.some((mall) => mall.id === currentMallId)) {
        return currentMallId
      }

      return nextMalls[0]?.id ?? ''
    })
    setLastResult('')
    setIsLoadingMalls(false)
  }

  function handleAdminToggle(nextValue) {
    if (nextValue) {
      setPinErrorMessage('')
      setIsPinModalOpen(true)
      return
    }

    clearAdminState()
    setIsAdmin(false)
    setIsPinModalOpen(false)
    setPinErrorMessage('')
  }

  function handlePinSubmit(pin) {
    if (pin !== ADMIN_PIN) {
      setPinErrorMessage('Incorrect PIN.')
      return
    }

    saveAdminState(true)
    setIsAdmin(true)
    setIsPinModalOpen(false)
    setPinErrorMessage('')
  }

  function handleClosePinModal() {
    setIsPinModalOpen(false)
    setPinErrorMessage('')
  }

  async function handleCreateMall(name) {
    const normalizedName = normalizeMallName(name)

    if (!normalizedName) {
      return { error: 'Mall name is required.' }
    }

    const { data, error } = await supabase
      .from('malls')
      .insert({ name: normalizedName })
      .select('id, name, created_on')
      .single()

    if (error) {
      return { error: error.message }
    }

    await loadMalls(data.id)
    return { error: '' }
  }

  async function handleRenameMall(mallId, name) {
    const normalizedName = normalizeMallName(name)

    if (!normalizedName) {
      return { error: 'Mall name is required.' }
    }

    const { error } = await supabase
      .from('malls')
      .update({ name: normalizedName })
      .eq('id', mallId)

    if (error) {
      return { error: error.message }
    }

    await loadMalls(mallId)
    return { error: '' }
  }

  async function handleDeleteMall(mallId) {
    const { error } = await supabase.from('malls').delete().eq('id', mallId)

    if (error) {
      return { error: error.message }
    }

    await loadMalls()
    return { error: '' }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,239,213,0.85),_rgba(249,250,251,0.96)_45%,_rgba(214,228,255,0.85)_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/75 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-orange-700">
                  Mall Food Wheelspin
                </p>
                <h1 className="font-['Trebuchet_MS','Avenir_Next',sans-serif] text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                  Spin once, settle lunch, move on.
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                  Wheel is public. Admin Mode unlocks mall management with a simple
                  frontend PIN stored in localStorage.
                </p>
              </div>
              <AdminToggle isAdmin={isAdmin} onChange={handleAdminToggle} />
            </div>

            <div className="flex flex-col gap-4 border-t border-slate-200/80 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <Navbar
                activePage={activePage}
                isAdmin={isAdmin}
                onNavigate={setActivePage}
              />
              <p className="text-sm text-slate-500">
                {isAdmin ? 'Admin mode unlocked' : 'Admin mode locked'}
              </p>
            </div>
          </div>
        </header>

        <main className="mt-6 flex-1">
          {activePage === PAGES.WHEEL ? (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
              <section className="space-y-6">
                <MallSelector
                  malls={malls}
                  activeMallId={activeMallId}
                  onSelect={setActiveMallId}
                />
                <Wheel
                  key={activeMall?.id ?? 'wheel'}
                  mallName={activeMall?.name ?? 'Select a mall'}
                  options={activeMall?.options ?? []}
                  lastResult={lastResult}
                  onSpinComplete={setLastResult}
                />
              </section>

              <aside className="space-y-6">
                <section className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                    Current Scope
                  </p>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                    Foods are not implemented yet
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Mall data is loaded from Supabase now. The Add Food flow, filters,
                    and spin history are intentionally not part of this first step, so
                    the wheel will stay disabled until food options are added later.
                  </p>
                  {mallErrorMessage ? (
                    <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {mallErrorMessage}
                    </p>
                  ) : null}
                  {!isLoadingMalls && !malls.length ? (
                    <p className="mt-4 rounded-2xl border border-dashed border-slate-300 px-4 py-4 text-sm text-slate-600">
                      No malls found. Unlock admin mode and add one from the Add Mall
                      tab.
                    </p>
                  ) : null}
                </section>
              </aside>
            </div>
          ) : null}

          {activePage === PAGES.ADD_MALL && isAdmin ? (
            <MallPage
              malls={malls}
              isLoading={isLoadingMalls}
              errorMessage={mallErrorMessage}
              onCreateMall={handleCreateMall}
              onRenameMall={handleRenameMall}
              onDeleteMall={handleDeleteMall}
            />
          ) : null}

          {activePage === PAGES.ADD_FOOD && isAdmin ? (
            <section className="rounded-[2rem] border border-slate-200/70 bg-white/80 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                Add Food
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                Coming next
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                This tab is gated behind admin mode now, but food CRUD is intentionally
                not implemented in this first part.
              </p>
            </section>
          ) : null}
        </main>
      </div>

      <PinModal
        isOpen={isPinModalOpen}
        errorMessage={pinErrorMessage}
        onClose={handleClosePinModal}
        onSubmit={handlePinSubmit}
      />
    </div>
  )
}

export default App
