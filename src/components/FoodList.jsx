import FoodForm from './FoodForm.jsx'

function FoodBadges({ food }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
        {food.food_style}
      </span>
      <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
        {food.price_range}
      </span>
      {food.is_halal ? (
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          Halal
        </span>
      ) : null}
      {food.is_vegan ? (
        <span className="rounded-full bg-lime-100 px-3 py-1 text-xs font-semibold text-lime-700">
          Vegan
        </span>
      ) : null}
    </div>
  )
}

function FoodList({
  foods,
  editingFoodId,
  foodStyleOptions,
  priceRangeOptions,
  isSaving,
  onEditStart,
  onEditCancel,
  onUpdateFood,
  onDeleteFood,
}) {
  if (!foods.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-sm text-slate-500">
        No foods for this mall yet. Add the first one above.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {foods.map((food) => {
        const isEditing = editingFoodId === food.id

        return (
          <article
            key={food.id}
            className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4"
          >
            {isEditing ? (
              <FoodForm
                initialValues={food}
                foodStyleOptions={foodStyleOptions}
                priceRangeOptions={priceRangeOptions}
                submitLabel="Save Food"
                isSaving={isSaving}
                onSubmit={(values) => onUpdateFood(food.id, values)}
                onCancel={onEditCancel}
              />
            ) : (
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-950">{food.name}</p>
                  <FoodBadges food={food} />
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => onEditStart(food.id)}
                    className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteFood(food)}
                    className="rounded-2xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </article>
        )
      })}
    </div>
  )
}

export default FoodList
