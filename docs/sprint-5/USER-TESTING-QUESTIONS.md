# Sprint 5 user testing — questions

One session on Idea 1c, in the Lyssna test **GlobalData Sprint 5 user testing**: https://globaldata-design.vercel.app/sprint-4/idea-1c/start

The control on Idea 1b has been dropped. Its Lyssna test still exists but won't be used. The "Why" notes are for our team briefing only and don't go into Lyssna.

---

## Hypotheses

The full set, with what would confirm or refute each one, is in `sprints/sprint-5/USER-TESTING-HYPOTHESIS.md`.

**Overall.** The fixes in Idea 1c make building a result set easy: most tasks average 4 or more out of 5, the SUS score reaches at least 68, and the NPS is positive. With no control, we can no longer say whether 1c beats 1b. Comparisons with last round use what testers said, because last round's scores were read backwards.

**One per change.** If a fix works, its task meets the target and the problem last round reported doesn't come up in the reasons again.

| # | Change or finding | Fix in Idea 1c | Task |
|---|---|---|---|
| 1 | Nobody found Advanced search | Quick search and Advanced search tabs; the results page opens on Advanced search | 1, 4 (judged from "Talk us through how you went about it") |
| 2 | A tester didn't know which mode they were in | Two named tabs, Quick search and Advanced search | 4 |
| 3 | Tapping a value added it instead of replacing it | Tick boxes: the row picks only that value, the box adds it | 3 |
| 4 | No way to remove a value once it was added | Untick a value, or remove a filter with its × | 3, 5 |
| 5 | The builder crowded out the results as the query grew | The filter row is capped at three lines, with the rest folded into a count | 2, 4 |
| 6 | The system didn't show it was working | The table shows a loading state after every search or change | All (it comes up in the reasons) |
| 7 | Target vs. Mechanism of action was ambiguous | **No fix yet**, so this is a check | 2, 4 (it comes up in the reasons) |
| 8 | Add filter was a bare + icon (Neil, on the call) | "+ Add filter", which opens the full field list | 6 |
| 9 | Whether people expect to filter from the columns (Neil, on the call) | Column filters that write into the filter row | 6 |
| 10 | A search that finds nothing (added for coverage, not a round 1 finding) | An empty state that names the filter to step back from | 7 |
| 11 | Overall usability | — | SUS |

---

## Testers' guide (shown before the tasks)

As edited in Lyssna:

We're working on a new way to search the Drugs database for GlobalData Healthcare. You start with a sentence in your own words, and it turns into filters you can see and change.

We're testing how Quick search and Advanced search work, and how searching in your own words sits alongside them. It isn't the full set of fields and filters.

- The results table, grouping and AI assistant features such as pivots, exports and deliverables aren't part of this test.
- There are no wrong answers. We're testing the design, not you. If something is confusing or annoying, that's the most useful thing you can tell us.
- This is a prototype. The drug data is a sample and only some paths are built. If something doesn't respond, tell us what you expected and carry on.
- Please answer each question straight after its task.

---

## Usability questions

Revised by Emma on 7 Oct. Seven tasks, each followed by the same two questions:
- **How easy or difficult was this?** `1–5`, where 1 = Very difficult and 5 = Very easy
- **What's the reason for your answer?** `long text`. Task 4 is the exception: its prompt is **"Talk us through how you went about it."**

**1.** You need to find all Phase I drugs. Show me how you would start.

> **Why:** discoverability. Where people reach first, typing or the builder, with nothing to steer them.

**2.** Find oral Phase III drugs in Europe that act on Janus Kinase.

> **Why:** building a complex search, G1. Returns 12 drugs. "Oral" is in so that Task 5 has a route to take out. "Act on Janus Kinase" fills both Target and Mechanism of action, so the ambiguity shows here if it still bothers people.

**3.** Your research is now focused on the United States. Update your search.

> **Why:** modifying a search, G2, last round's worst task. Swapping Europe for the United States gives 8.

**4.** Now find the same results using a different approach.

> **Why:** we watch whether they switch between plain language and the filters by hand. The long-text prompt is neutral, and what they describe tells us whether they found Advanced search.

**5.** You no longer need to restrict the search by route of administration. Update your search.

> **Why:** removing something you added, which last round's testers couldn't do. Taking out Oral goes from 8 to 33.

**6.** Now show only drugs from Sandoz.

> **Why:** Neil's narrow-it-further task. Sandoz is in the results but not in the search: 3 of the 33. It can be done by typing, from Add filter, the builder or a column.

**7.** Find Phase I gene therapies for dermatology in Brazil.

> **Why:** zero results and recovery. The full query matches nothing; we watch what they do next. Dropping "gene therapies" gives 8 drugs, dropping "dermatology" gives 1.

**Not given a task of their own:**
- **Knowing a search has run.** Every task above runs a search, so if the loading state isn't working, it will come up in the reasons.
- **Brackets in the Boolean logic.** Neil expects testers to ask about them, but the call agreed not to put design time into them.

---

## System Usability Scale (SUS)

Straight after the seven tasks, on its own screen, before the wrap-up. Lyssna heading: **System Usability Scale**, with the line "Rate how much you agree with each statement." Each statement is rated 1–5, where 1 = Strongly disagree and 5 = Strongly agree. The wording is Austin's, from his SUS sheet:

1. I think that I would like to use this product frequently.
2. I found the product unnecessarily complex.
3. I thought the product was easy to use.
4. I think that I would need the support of a technical person to be able to use this product.
5. I found the various functions in the product were well integrated.
6. I thought there was too much inconsistency in this product.
7. I imagine that most people would learn to use this product very quickly.
8. I found the product very awkward to use.
9. I felt very confident using the product.
10. I needed to learn a lot of things before I could get going with this product.

In Lyssna this is its own screen, with the ten statements as ten consecutive 1–5 scale questions. Lyssna's matrix question caps out at seven rows, so it can't hold all ten statements in one block.

**Scoring:** standard SUS scoring. Odd-numbered statements score their rating minus 1, and even-numbered statements score 5 minus their rating. Add the ten scores and multiply by 2.5 to get 0–100. 68 is the commonly cited average.

> **Why:** SUS is a standard benchmark with a published average, so it gives a score that means something without a control group. It can also be compared across future rounds of this one. It comes straight after the tasks, so it rates the whole experience while it's fresh.

---

## Wrap-up

The last screen, after SUS. Lyssna intro: "Based on your experience of the last 8 tasks, answer the following (click on Task complete to proceed)". It needs updating to 7 tasks.

1. Looking at these results, what do you think you've searched for? `long text`
2. How confident are you that these are the results you were looking for? `1–5`, where 1 = Not at all confident and 5 = Very confident
3. What's the reason for your answer? `long text`
4. When would you use Advanced Search rather than Quick Search? `long text`
5. How likely are you to recommend this search experience to a colleague? `0–10`, where 0 = Not at all likely and 10 = Extremely likely
6. Why did you give it that score? `long text`
7. Was there anything you expected to be able to do but couldn't? `long text`

> **Why:** questions 1–4 check whether people understood what they built and when they'd reach for each mode. The NPS stays 0–10, the standard scale; last round's 1–10 with "Very Likely" on the left was read backwards. The open question at the end catches what the tasks didn't cover.

---

**Notes for setting it up in Lyssna**

- The test is a duplicate of last round's "Globaldata: Advanced Search 2" and keeps its Live website test format: one task per screen, with its two questions straight after it. SUS has its own screen after the tasks, and the wrap-up questions, NPS included, share the final screen.
- The control test ("GlobalData Sprint 5 user testing control", on Idea 1b) stays in Lyssna but won't be run.
- Don't mention the `$$` shortcut anywhere.
- The 1–5 scores can't be compared number for number with last round's flipped 1–10 scale. Last round is compared through the tasks and the reasons. With no control, this round's scores are absolute: ease against a 4-out-of-5 target, SUS against 68 and NPS against zero. They become the baseline from here on.
