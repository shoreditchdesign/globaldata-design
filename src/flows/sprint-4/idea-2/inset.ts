/**
 * One inset for the whole screen, so the sentence, the grid and the canvas all
 * start their content on the same line.
 *
 * Every plane on the screen — the box, the explorer and the results — is a card
 * sitting `--box-gutter` in from the edge of the page, and each pads its own
 * content by `--box-pad`. `--text-inset` is that padding plus the card's 1px
 * border, and it is what the grid's outer columns, the results toolbar and the
 * tree take, rather than a padding of their own. Change the box and the rest
 * follow, and because every card starts at the same x, so does their content.
 *
 * Set once on the screen's root; everything underneath reads the variables.
 * The 1px is the box's `border`, which Tailwind draws at 1px.
 */
/**
 * The negation family, pitched warm for this idea only.
 *
 * Rose at hue 22 sat next to the brand's violet-leaning blue and the two
 * argued; a vermilion carries the same meaning without competing, and blue
 * against orange is a pairing the eye reads as opposition rather than noise.
 * Scoped to this screen's root rather than changed in `globals.css`, so the
 * Sprint 3 directions keep the family they were reviewed with.
 */
export const negationVars =
  "[--negative:oklch(0.955_0.032_42)] [--negative-ink:oklch(0.505_0.16_42)] [--negative-border:oklch(0.875_0.07_42)]"

export const insetVars =
  "[--box-gutter:--spacing(6)] [--box-pad:--spacing(5)] [--text-inset:calc(var(--box-pad)+1px)]"
