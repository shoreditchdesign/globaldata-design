import { type DrugRow } from "@/flows/sprint-4/idea-2b/data"

/**
 * The grid's columns, in the order it draws them.
 *
 * Held here rather than inside the grid because the head above the split needs
 * them too: the Columns menu lists them, and the export writes them out.
 */
export interface ResultColumn {
  key: string
  label: string
  value: (row: DrugRow) => string
}

/** `Antiinflammatory Therapy` in a cell is mostly the word Therapy. */
const shortDescriptor = (descriptor: string) => descriptor.replace(/ Therapy$/, "")

export const resultColumns: ResultColumn[] = [
  { key: "name", label: "Drug Name", value: (row) => row.name },
  { key: "company", label: "Company", value: (row) => row.company },
  { key: "indication", label: "Indication", value: (row) => row.indication },
  { key: "stage", label: "Development Stage", value: (row) => row.stage },
  { key: "country", label: "Drug Geography", value: (row) => row.country },
  { key: "moleculeType", label: "Molecule Type", value: (row) => row.moleculeType },
  { key: "route", label: "Route of Administration", value: (row) => row.route },
  { key: "descriptor", label: "Drug Descriptor", value: (row) => shortDescriptor(row.descriptor) },
]

/** The identity column stays: a table of everything but the drug name is a list of facts. */
export const lockedColumn = "name"

/**
 * The rows written out as a file, so Export hands over something real rather
 * than standing there as a button that does nothing. Only the columns on screen
 * are written, in the order they are shown.
 */
export function exportCsv(rows: DrugRow[], hidden: string[], order: string[]) {
  const shown = order
    .map((key) => resultColumns.find((column) => column.key === key))
    .filter((column): column is ResultColumn => Boolean(column))
    .filter((column) => !hidden.includes(column.key))
  const cell = (value: string) => `"${value.replace(/"/g, '""')}"`
  const lines = [
    shown.map((column) => cell(column.label)).join(","),
    ...rows.map((row) => shown.map((column) => cell(column.value(row))).join(",")),
  ]
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "globaldata-drugs.csv"
  link.click()
  URL.revokeObjectURL(url)
}
