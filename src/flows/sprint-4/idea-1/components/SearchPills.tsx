import type { ProductArea } from "@/components/prototype/ProductChrome"
import {
  searchAttributeLabels,
  searchAttributeValues,
  searchCategories,
} from "@/flows/sprint-4/idea-1/data"
import { cn } from "@/lib/utils"

/**
 * The three-layer pill selector: search area, then attribute, then value.
 * Picking a value is what builds a filter. Centred under the landing search,
 * left-aligned in the results page's narrower search panel.
 */
export function SearchPills({
  layout,
  activeCategory,
  activeAttribute,
  onCategoryChange,
  onAttributeChange,
  onValuePick,
}: {
  layout: "centered" | "panel"
  activeCategory: ProductArea | null
  activeAttribute: string | null
  onCategoryChange: (category: ProductArea) => void
  onAttributeChange: (attribute: string) => void
  onValuePick: (value: string) => void
}) {
  const justify = layout === "centered" ? "justify-center" : "justify-start"

  return (
    <div className="w-full">
      <nav aria-label="Search categories" className={cn("flex flex-wrap gap-2", justify)}>
        {searchCategories.map((category) => {
          const active = activeCategory === category
          const inactive = activeCategory !== null && !active

          return (
            <button
              key={category}
              type="button"
              aria-expanded={active}
              aria-controls={`search-category-${slugify(category)}`}
              onClick={() => onCategoryChange(category)}
              className={cn(
                "bg-surface-panel border-border hover:bg-accent inline-flex h-8 items-center rounded-full border px-3.5 text-[13px] transition-[color,background-color,border-color,opacity]",
                active && "bg-foreground text-background border-foreground hover:bg-foreground/90",
                inactive && "opacity-35 hover:opacity-70",
              )}
            >
              {category}
            </button>
          )
        })}
      </nav>

      {/*
        On the landing page, one fixed well holds both layers so the centred
        search never moves; each layer cascades straight under the last.
      */}
      <div className={cn(layout === "centered" ? "mt-4 h-60" : activeCategory && "mt-4")}>
        {activeCategory ? (
          <nav
            key={activeCategory}
            id={`search-category-${slugify(activeCategory)}`}
            aria-label={`${activeCategory} filters`}
            className={cn(
              "animate-in fade-in slide-in-from-top-2 flex flex-wrap gap-2 duration-300",
              justify,
            )}
          >
            {searchAttributeLabels(activeCategory).map((child) => {
              const active = activeAttribute === child
              const inactive = activeAttribute !== null && !active

              return (
                <button
                  key={child}
                  type="button"
                  aria-expanded={active}
                  aria-controls={`search-attribute-${slugify(child)}`}
                  onClick={() => onAttributeChange(child)}
                  className={cn(
                    "bg-surface-sunken border-border text-foreground hover:bg-accent inline-flex min-h-8 items-center rounded-full border px-3.5 py-1.5 text-[13px] transition-[color,background-color,border-color,opacity]",
                    active && "bg-foreground text-background border-foreground hover:bg-foreground/90",
                    inactive && "opacity-35 hover:opacity-70",
                  )}
                >
                  {child}
                </button>
              )
            })}
          </nav>
        ) : null}

        {activeCategory && activeAttribute ? (
          <nav
            key={`${activeCategory}/${activeAttribute}`}
            id={`search-attribute-${slugify(activeAttribute)}`}
            aria-label={`${activeAttribute} values`}
            className={cn(
              "animate-in fade-in slide-in-from-top-2 mt-4 flex flex-wrap gap-2 duration-300",
              justify,
            )}
          >
            {searchAttributeValues(activeCategory, activeAttribute).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => onValuePick(value)}
                className="bg-surface-panel border-border text-foreground hover:bg-accent inline-flex min-h-8 items-center rounded-full border px-3.5 py-1.5 text-[13px] transition-colors"
              >
                {value}
              </button>
            ))}
          </nav>
        ) : null}
      </div>
    </div>
  )
}

function slugify(label: string) {
  return label.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-")
}
