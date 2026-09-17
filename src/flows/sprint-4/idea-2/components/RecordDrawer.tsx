"use client"

import * as React from "react"

import { StageBadge } from "@/components/prototype/StageBadge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { DrugRow } from "@/flows/sprint-4/idea-2/data"

/**
 * Every field of the record, in the order the taxonomy lists them. The grid
 * carries eight of them; the drawer is where the rest live.
 */
const fields: { label: string; value: (row: DrugRow) => string | undefined }[] = [
  { label: "Company", value: (row) => row.company },
  { label: "Development stage", value: (row) => row.stage },
  { label: "Therapy area", value: (row) => row.therapyArea },
  { label: "Indication", value: (row) => row.indication },
  { label: "Region", value: (row) => row.region },
  { label: "Country", value: (row) => row.country },
  { label: "Route of administration", value: (row) => row.route },
  { label: "Molecule type", value: (row) => row.moleculeType },
  { label: "Target", value: (row) => row.target },
  { label: "Mechanism of action", value: (row) => row.moa },
  { label: "ATC classification", value: (row) => row.atc },
  { label: "Drug type", value: (row) => row.drugType },
  { label: "Mono/combination", value: (row) => row.regimen },
  { label: "Drug descriptor", value: (row) => row.descriptor },
  { label: "Gene therapy vector", value: (row) => row.vector },
  { label: "Application type", value: (row) => row.applicationType },
]

/**
 * The whole record, opened from `Open` on a drug name. Ported from Sprint 3
 * Idea 2: modal, over a scrim, and dismissed by the scrim, Escape or the close
 * button — all three from the shadcn `Sheet`, which is Radix's dialog, so focus
 * return comes with it.
 *
 * `row` is looked up by the screen in the filtered set, never the sample, so
 * the drawer cannot show a drug the current query has excluded.
 */
export function RecordDrawer({ row, onClose }: { row: DrugRow | null; onClose: () => void }) {
  // The lookup goes null the moment the record is dismissed, so the last row is
  // kept and the panel has something to slide out with rather than emptying
  // first. Adjusted during render, so nothing paints the empty state on the way.
  const [lastRow, setLastRow] = React.useState<DrugRow | null>(null)
  if (row && row !== lastRow) setLastRow(row)
  const shown = row ?? lastRow

  return (
    <Sheet
      open={row !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      {/*
        The width carries `data-[side=right]:` to match the prefix on
        `SheetContent`'s own `w-3/4` and `sm:max-w-sm`; unprefixed, it loses to
        them. 440px keeps `Route of administration` and its value on one line.
      */}
      <SheetContent
        side="right"
        className="bg-surface-raised border-edge shadow-raised gap-0 p-0 motion-reduce:animate-none data-[side=right]:w-[440px] data-[side=right]:sm:max-w-[440px]"
      >
        <SheetHeader className="border-edge shrink-0 gap-1 border-b p-5 pr-12">
          <SheetTitle className="truncate text-[17px]">{shown?.name}</SheetTitle>
          <SheetDescription className="truncate text-[13px]">{shown?.generic}</SheetDescription>
          {shown ? (
            <div className="mt-1 flex">
              <StageBadge stage={shown.stage} />
            </div>
          ) : null}
        </SheetHeader>

        <dl className="min-h-0 flex-1 overflow-auto px-5 py-3 text-[13px]">
          {shown
            ? fields.map((field) => {
                const value = field.value(shown)
                if (!value) return null
                return (
                  <div key={field.label} className="border-hairline flex gap-3 border-b py-2.5 last:border-0">
                    <dt className="text-muted-foreground w-[160px] shrink-0">{field.label}</dt>
                    <dd className="min-w-0 flex-1 break-words">{value}</dd>
                  </div>
                )
              })
            : null}
        </dl>
      </SheetContent>
    </Sheet>
  )
}
