/**
 * One inset for the whole screen, so the sentence, the grid and the canvas all
 * start their content on the same line.
 *
 * The box sits `--box-gutter` in from the edge of the screen, draws a 1px border
 * and pads its content by `--box-pad`. `--text-inset` is the sum of the three,
 * and it is the padding the grid's outer columns, the results toolbar and the
 * logic canvas take, rather than a padding of their own. Change the box and
 * the rest follow.
 *
 * Set once on the screen's root; everything underneath reads the variables.
 * The 1px is the box's `border`, which Tailwind draws at 1px.
 */
export const insetVars =
  "[--box-gutter:--spacing(6)] [--box-pad:--spacing(5)] [--text-inset:calc(var(--box-gutter)+var(--box-pad)+1px)]"
