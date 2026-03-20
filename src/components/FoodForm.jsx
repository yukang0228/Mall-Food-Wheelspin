import { useEffect, useState } from 'react'

const EMPTY_FORM = {
  name: '',
  is_halal: false,
  is_vegan: false,
  food_style: '',
  price_range: '',
}

function FoodForm({
  initialValues,
  foodStyleOptions,
  priceRangeOptions,
  submitLabel,
  isSaving,
  onSubmit,
  onCancel,
}) {
  const [formValues, setFormValues] = useState(EMPTY_FORM)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    setFormValues({
      ...EMPTY_FORM,
      ...initialValues,
    })
    setErrorMessage('')
  }, [initialValues])

  function handleChange(event) {
    const { checked, name, type, value } = event.target

    setFormValues((currentValues) => ({
      ...currentValues,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')

    const { error } = await onSubmit(formValues)

    if (error) {
      setErrorMessage(error)
      return
    }

    if (!onCancel) {
      setFormValues(EMPTY_FORM)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Food name
          <input
            type="text"
            name="name"
            value={formValues.name}
            onChange={handleChange}
            placeholder="Nasi lemak"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Food style
          <select
            name="food_style"
            value={formValues.food_style}
            onChange={handleChange}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
          >
            <option value="">Select food style</option>
            {foodStyleOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
          Price range
          <select
            name="price_range"
            value={formValues.price_range}
            onChange={handleChange}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
          >
            <option value="">Select price range</option>
            {priceRangeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-5">
        <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            name="is_halal"
            checked={formValues.is_halal}
            onChange={handleChange}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          Halal
        </label>
        <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            name="is_vegan"
            checked={formValues.is_vegan}
            onChange={handleChange}
            className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
          />
          Vegan
        </label>
      </div>

      {errorMessage ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {submitLabel}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  )
}

export default FoodForm
