import { StageBadge } from "@/components/prototype/StageBadge"
import type { ResultRow } from "@/flows/sprint-3/idea-3/data"

const columns = [
  { key: "name", label: "Drug Name" },
  { key: "generic", label: "Generic Name" },
  { key: "company", label: "Company" },
  { key: "descriptor", label: "Drug Descriptor" },
  { key: "target", label: "Target" },
  { key: "stage", label: "Development Stage" },
  { key: "route", label: "Route of Administration" },
  { key: "geography", label: "Drug Geography" },
] as const

/**
 * `Antineoplastic Therapy` in a cell is mostly the word Therapy. The column
 * carries the part that varies; the dropdown and the filter view still name the
 * value in full.
 */
const shortDescriptor = (descriptor: string) => descriptor.replace(/ Therapy$/, "")

/**
 * Two columns carry values long enough to set the width of the whole table —
 * `Human Epidermal Growth Factor Receptor 2` is forty characters. Capping them
 * keeps eight columns inside a 1440px window without a horizontal scrollbar,
 * which is the incumbent's failing and not one worth repeating. The full value
 * is on the cell's title, and in the pill dropdown that filters on it.
 */
function Clipped({ children, width }: { children: string; width: string }) {
  return (
    <span className={`block truncate ${width}`} title={children}>
      {children}
    </span>
  )
}

/**
 * Results sit under the sentence on the same screen — the query and its answer
 * are never on separate pages. The header row is sticky so the columns stay
 * readable as the set is scrolled.
 *
 * No sort arrows. They did nothing, and a dead control is a poor thing to put
 * in the direction whose whole argument is that what the screen says can be
 * trusted — the sortable grid is Idea 4's argument to make. Dropping them also
 * buys back the width the Drug Descriptor column costs, so eight columns fit a
 * 1440px window without the horizontal scroll the incumbent is criticised for.
 *
 * The rows are the sample filtered against the sentence, not a fixed page: an
 * edit that moves the count moves the table with it. When the sentence rules
 * out every row the table says so and the count above reads zero — the two can
 * never disagree, which is what `screenDrugs` is for.
 */
export function ResultsGrid({ rows, total }: { rows: ResultRow[]; total: number }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="text-muted-foreground flex shrink-0 items-center justify-between px-6 py-2.5 text-xs">
        <span className="tabular-nums">
          {rows.length === 0
            ? "No drugs match this query"
            : `Showing 1–${rows.length} of ${total.toLocaleString()}`}
        </span>
        <span>Sorted by relevance</span>
      </div>
      <div className="min-h-0 flex-1 overflow-auto border-t">
        <table className="w-full border-collapse text-[13px] [&_td:first-child]:pl-6 [&_td:last-child]:pr-6 [&_th:first-child]:pl-6 [&_th:last-child]:pr-6">
          <thead className="sticky top-0 z-10">
            <tr className="bg-muted/70 backdrop-blur">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="text-muted-foreground border-b px-3 py-2.5 text-left text-[10px] font-medium tracking-[0.08em] whitespace-nowrap uppercase"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-10 text-center">
                  <p className="text-[13px] font-medium">No drugs match the sentence</p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Widen a condition, or undo the last edit.
                  </p>
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={`${row.name}-${i}`} className="hover:bg-muted/40 border-b last:border-0">
                  <td className="px-3 py-2.5 font-medium whitespace-nowrap">{row.name}</td>
                  <td className="text-muted-foreground px-3 py-2.5 whitespace-nowrap">{row.generic}</td>
                  <td className="text-muted-foreground px-3 py-2.5 whitespace-nowrap">{row.company}</td>
                  <td className="text-muted-foreground px-3 py-2.5 whitespace-nowrap">
                    {shortDescriptor(row.descriptor)}
                  </td>
                  <td className="text-muted-foreground px-3 py-2.5">
                    <Clipped width="max-w-[230px]">{row.target}</Clipped>
                  </td>
                  <td className="px-3 py-2.5">
                    <StageBadge stage={row.stage} />
                  </td>
                  <td className="text-muted-foreground px-3 py-2.5 whitespace-nowrap">{row.route}</td>
                  <td className="text-muted-foreground px-3 py-2.5">
                    <Clipped width="max-w-[180px]">{row.geographies.join(", ")}</Clipped>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
