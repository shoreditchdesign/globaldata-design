import { Fragment } from "react"

import { FilterPill, OperatorWord } from "@/components/prototype/FilterPill"
import {
  workedFilters,
  type ResolvedFilter,
} from "@/flows/sprint-4/idea-1/data"

export function ResolvedFilters() {
  return (
    <div className="bg-surface-panel border-border mt-5 w-full overflow-hidden rounded-xl border">
      {workedFilters.map((filter, index) => (
        <FilterRow
          key={filter.label}
          filter={filter}
          bordered={index < workedFilters.length - 1}
        />
      ))}
    </div>
  )
}

function FilterRow({ filter, bordered }: { filter: ResolvedFilter; bordered: boolean }) {
  return (
    <div
      className={`grid min-h-14 grid-cols-[180px_1fr] items-center gap-4 px-4 py-3 ${
        bordered ? "border-hairline border-b" : ""
      }`}
    >
      <p className="text-muted-foreground text-[10px] font-medium tracking-[0.08em] uppercase">
        {filter.label}
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        <OperatorWord className={filter.excluded ? "text-negative-ink" : undefined}>
          {filter.excluded ? "is not" : "is"}
        </OperatorWord>
        {filter.values.map((value, index) => (
          <Fragment key={value}>
            {index > 0 ? <OperatorWord>or</OperatorWord> : null}
            <FilterPill
              variant={filter.excluded ? "excluded" : "applied"}
              removable={false}
            >
              {value}
            </FilterPill>
          </Fragment>
        ))}
      </div>
    </div>
  )
}
