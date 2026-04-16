import { useState } from 'react'
import FoodForm from './FoodForm.jsx'
import FoodList from './FoodList.jsx'

function FoodPage({
  malls,
  activeMallId,
  foods,
  isDark,
  isLoading,
  errorMessage,
  foodStyleOptions,
  priceRangeOptions,
  onSelectMall,
  onCreateFood,
  onUpdateFood,
  onDeleteFood,
}) {
  const [editingFoodId, setEditingFoodId] = useState('')
  const [actionError, setActionError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function handleCreateFood(values) {
    setActionError('')
    setIsSaving(true)
    const result = await onCreateFood(values)
    setIsSaving(false)

    if (result.error) {
      return result
    }

    setEditingFoodId('')
    return result
  }

  async function handleUpdateFood(foodId, values) {
    setActionError('')
    setIsSaving(true)
    const result = await onUpdateFood(foodId, values)
    setIsSaving(false)

    if (result.error) {
      return result
    }

    setEditingFoodId('')
    return result
  }

  async function handleDeleteFood(food) {
    const shouldDelete = window.confirm(`Delete "${food.name}"?`)

    if (!shouldDelete) {
      return
    }

    setActionError('')
    setIsSaving(true)
    const { error } = await onDeleteFood(food.id)
    setIsSaving(false)

    if (error) {
      setActionError(error)
      return
    }

    if (editingFoodId === food.id) {
      setEditingFoodId('')
    }
  }

  return (
    <section className="space-y-6">
      <div
        className={`rounded-[2rem] border p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur ${
          isDark
            ? 'border-slate-700/80 bg-slate-900/80'
            : 'border-slate-200/70 bg-white/80'
        }`}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <label
            className={`flex min-w-0 flex-col gap-2 text-sm font-medium lg:w-80 ${
              isDark ? 'text-slate-200' : 'text-slate-700'
            }`}
          >
            Active mall
            <select
              value={activeMallId}
              onChange={(event) => onSelectMall(event.target.value)}
              className={`rounded-2xl border px-4 py-3 text-base outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100 ${
                isDark
                  ? 'border-slate-700 bg-slate-800 text-slate-100 focus:bg-slate-800'
                  : 'border-slate-200 bg-slate-50 text-slate-900 focus:bg-white'
              }`}
            >
              {malls.map((mall) => (
                <option key={mall.id} value={mall.id}>
                  {mall.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div
        className={`rounded-[2rem] border p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur ${
          isDark
            ? 'border-slate-700/80 bg-slate-900/80'
            : 'border-slate-200/70 bg-white/80'
        }`}
      >
        <div>
          <FoodForm
            initialValues={null}
            foodStyleOptions={foodStyleOptions}
            priceRangeOptions={priceRangeOptions}
            submitLabel="Add Food"
            isSaving={isSaving || !activeMallId}
            onSubmit={handleCreateFood}
          />
        </div>

        {actionError || errorMessage ? (
          <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {actionError || errorMessage}
          </p>
        ) : null}
      </div>

      <div
        className={`rounded-[2rem] border p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur ${
          isDark
            ? 'border-slate-700/80 bg-slate-900/80'
            : 'border-slate-200/70 bg-white/80'
        }`}
      >
        <div className="flex items-start justify-between gap-4">
          <div
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {foods.length} items
          </div>
        </div>

        <div className="mt-5">
          {isLoading ? (
            <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Loading foods...
            </p>
          ) : (
            <FoodList
              foods={foods}
              editingFoodId={editingFoodId}
              foodStyleOptions={foodStyleOptions}
              priceRangeOptions={priceRangeOptions}
              isSaving={isSaving}
              onEditStart={setEditingFoodId}
              onEditCancel={() => setEditingFoodId('')}
              onUpdateFood={handleUpdateFood}
              onDeleteFood={handleDeleteFood}
            />
          )}
        </div>
      </div>
    </section>
  )
}

export default FoodPage
