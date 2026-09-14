"use client"

import { useState } from "react"

import { StageBadge } from "@/components/prototype/StageBadge"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { DrugRow } from "@/flows/sprint-3/idea-2/data"
import type { Screener } from "@/flows/sprint-3/idea-2/use-screener"

/**
 * Every field of the record, in the order the taxonomy lists them, with the
 * three the table no longer carries — therapy area, indication and geography —
 * back in place beside the ones it never carried.
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
 * The whole record, opened from the `Open` control on a drug name.
 *
 * Modal on the client's instruction: it carries a scrim, the scrim takes the
 * click that closes it, and Escape closes it too. All three come from the
 * shadcn `Sheet`, which is Radix's dialog — hand-rolling the aside would mean
 * hand-rolling focus return and dismissal with it.
 *
 * The row is looked up in the filtered set, not the sample, so the drawer can
 * never show a drug the current query has excluded.
 */
export function RecordDrawer({ screener }: { screener: Screener }) {
  const { selectedRow, closeRecord } = screener

  // The lookup goes null the moment the record is dismissed, so the last one is
  // kept alongside it and the panel has something to slide out with rather than
  // emptying first. Adjusted during render, the way `useStagedSequence` does
  // it, so nothing paints the empty state on the way past.
  const [lastRow, setLastRow] = useState<DrugRow | null>(null)
  if (selectedRow && selectedRow !== lastRow) setLastRow(selectedRow)
  const row = selectedRow ?? lastRow

  return (
    <Sheet
      open={selectedRow !== null}
      onOpenChange={(open) => {
        if (!open) closeRecord()
      }}
    >
      {/*
        The width carries `data-[side=right]:` because that is the prefix
        `SheetContent`'s own `w-3/4` and `sm:max-w-sm` carry: an unprefixed
        `w-[440px]` loses to them on specificity and tailwind-merge has no
        reason to drop them, so the panel would open at three quarters of the
        window. Matched prefixes, and the merge does its job.

        440px rather than 400: at 16px the longest field name — `Route of
        administration` — is 175px, so the label lane has to be 184px, and the
        extra 40px of panel is what keeps the values beside it on one line
        instead of wrapping every second field.
      */}
      <SheetContent
        side="right"
        className="bg-surface-raised border-edge shadow-raised gap-0 p-0 data-[side=right]:w-[440px] data-[side=right]:sm:max-w-[440px]"
      >
        <SheetHeader className="border-edge shrink-0 gap-1 border-b p-4 pr-12">
          <SheetTitle className="truncate text-[17px]">{row?.name}</SheetTitle>
          <SheetDescription className="truncate text-[16px]">{row?.generic}</SheetDescription>
          {row ? (
            <div className="mt-1 flex">
              <StageBadge stage={row.stage} />
            </div>
          ) : null}
        </SheetHeader>

        <dl className="min-h-0 flex-1 overflow-auto px-4 py-3 text-[16px]">
          {row
            ? fields.map((field) => {
                const value = field.value(row)
                if (!value) return null
                return (
                  <div
                    key={field.label}
                    className="border-hairline flex gap-3 border-b py-2 last:border-0"
                  >
                    <dt className="text-muted-foreground w-[184px] shrink-0">{field.label}</dt>
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
