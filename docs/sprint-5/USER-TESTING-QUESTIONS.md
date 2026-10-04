# Sprint 5 user testing — questions

The same question list runs as two Lyssna tests, so the two prototypes can be compared directly:

- **GlobalData Sprint 5 user testing** — Idea 1c, with this sprint's fixes: https://globaldata-design.vercel.app/sprint-4/idea-1c/start
- **GlobalData Sprint 5 user testing control** — Idea 1b, last round's Prototype 1: https://globaldata-design.vercel.app/sprint-4/idea-1b

Every task below can be completed in both prototypes. I checked them against both resolvers and both samples, and the drug counts in the notes match in each. The "Why" notes are for our team briefing only and don't go into Lyssna.

---

## Hypotheses

The full set, with what would confirm or refute each one, is in `sprints/sprint-5/USER-TESTING-HYPOTHESIS.md`.

**Overall.** The fixes in Idea 1c make building a result set easier than in the Idea 1b control. 1c should average a higher ease score across the eight tasks, and a higher NPS.

**One per change.** If a fix works, its task scores higher in 1c than in the control, and the reasons people give stop mentioning the problem.

| # | Change or finding | Fix in Idea 1c | Task |
|---|---|---|---|
| 1 | Nobody found Advanced search | An "Advanced filter" switch inside the search field | 4 |
| 2 | A tester didn't know which mode they were in | One on/off switch instead of two tabs | 4 |
| 3 | Tapping a value added it instead of replacing it | Tick boxes: the row picks only that value, the box adds it | 2, 5 |
| 4 | No way to remove a value once it was added | Untick a value, or remove a filter with its × | 2, 6 |
| 5 | The builder crowded out the results as the query grew | The filter row is capped at three lines, with the rest folded into a count | 3, 4, 5 |
| 6 | The system didn't show it was working | The table shows a loading state after every search or change | All (it comes up in the reasons) |
| 7 | Target vs. Mechanism of action was ambiguous | **No fix yet**, so this is a check | 1, 4 (it comes up in the reasons) |
| 8 | Add filter was a bare + icon (Neil, on the call) | "+ Add filter", which opens the full field list | 5, 7 |
| 9 | Whether people expect to filter from the columns (Neil, on the call) | Column filters that write into the filter row, in 1c only | 7 |
| 10 | A search that finds nothing (added for coverage, not a round 1 finding) | An empty state that names the filter to step back from | 8 |

---

## Testers' guide (shown before the tasks)

As edited in Lyssna:

We're working on a new way to search the Drugs database for GlobalData Healthcare. You start with a sentence in your own words, and it turns into filters you can see and change.

We're testing how you build a set of results. That's writing a search, checking and changing the filters it picks, and picking filters yourself.

- There are no wrong answers. We're testing the design, not you. If something is confusing or annoying, that's the most useful thing you can tell us.
- This is a prototype. The drug data is a sample and only some paths are built. If something doesn't respond, tell us what you expected and carry on.
- Please answer each question straight after its task.

---

## Usability questions

Every task is followed by the same two questions:
- **How easy or difficult was this?** `1–5`, where 1 = Very difficult and 5 = Very easy
- **What's the reason for your answer?** `long text`

**1.** Find every Phase III drug available in Europe that works on Janus Kinase.

> **Why:** this is last round's Task 1, word for word, and it tests G1, Quick search. It returns 50 drugs. The phrase "works on Janus Kinase" fills both Target and Mechanism of action, so if that ambiguity still bothers people, this is where they'll say so.

**2.** Using the search you just built, swap Europe for the United States.

> **Why:** this is last round's Task 2, word for word, and it tests G2, Refine. It returns 33 drugs. It scored worst last round, because tapping a value added it instead of replacing it, and there was no way to take a value out. If the fixes work, 1c should score clearly better than 1b here.

**3.** Get results for this set of filters, using plain language

- Development Stage = Marketed
- Route of Administration = Oral
- Molecule Type = Small Molecule
- Drug Geography = United States
- Mechanism of Action = any receptor-based one.

> **Why:** this is the Task 3 that actually went out in Lyssna last round, word for word. (The old `USER-TESTING-QUESTIONS.md` says "write a search in your own words", but that isn't what was sent.) It tests G3, Power search, through typing: five filters, with an OR inside Mechanism of action. A plain sentence resolves all five and returns 12 drugs. Five filters is also enough to test whether the filter row still crowds out the results.

**4.** Now get that same set of results again by choosing each filter yourself, without typing a sentence.

- Development Stage = Marketed
- Route of Administration = Oral
- Molecule Type = Small Molecule
- Drug Geography = United States
- Mechanism of Action = any receptor-based one.

> **Why:** this replaces last round's Task 4, which named "the advanced search" and "the file explorer" and so gave away where to go. It drops last round's extra "which was easier" box too. It's the discoverability test Neil asked for ("challenge people… to at least do an advanced search using the search builder"). The task can only be done in the builder, Advanced filter in 1c and the Advanced tab in 1b, but it doesn't name either one. Neil's "contrast the ease" is this score set against Task 3's. Picking Mechanism of action by hand is also where Target vs. Mechanism of action will trip people up, if it still does.

**5.** Change your search so it also includes drugs at Pre-registration, as well as Marketed ones.

> **Why:** this is new. It tests choosing more than one value inside a single field, which is where last round's tick-versus-replace confusion lived. It goes from 12 drugs to 17. It also adds a sixth value to a long filter row, which tests the three-line cap.

**6.** Now take route of administration out of your search, so drugs given any way are included.

> **Why:** this is new. It tests removing something you've added, which last round's testers couldn't do ("no way to remove a value once added"). It goes from 17 drugs to 37.

**7.** You now only want the drugs from one company in your list. Choose any company you can see, and narrow the list down to it.

> **Why:** this is new, and it's Neil's narrow-it-further task. On the call it was "narrow down the 123 drugs further, how would you do this?", with "company is a great one" because company is in the results but not in the search. Every company in the 37 results is in the Manufacturer field, so this works in both prototypes, by typing, from Add filter or from the builder. In 1c it can also be done from a column. The task doesn't say how, so the reasons show where people reach first, and whether 1c's column filters earn their place.

**8.** Start a new search for Phase I gene therapies for dermatology in Brazil. If it finds nothing, change the search until it does.

> **Why:** this is new. It tests a search that comes back empty, and recovering from it. The full query matches nothing in either sample. Dropping "gene therapies" gives 8 drugs, and dropping "dermatology" gives 1. 1c's empty state names the filter to step back from, while 1b only says "No drug matches these filters", so this compares the two.

**Not given a task of their own:**
- **Knowing a search has run.** Every task above runs a search, so if the loading state isn't working, it will come up in the reasons.
- **Brackets in the Boolean logic.** Neil expects testers to ask about them, but the call agreed not to put design time into them.

---

**9.** How likely are you to recommend this way of searching to a colleague? `0–10`, where 0 = Not at all likely and 10 = Extremely likely
- What's the reason for your score?

> **Why:** this is kept from last round. It runs 0–10 rather than 1–10 because that's the standard NPS scale, and the NPS calculation (promoters 9–10 minus detractors 0–6) relies on the 0. Last round's version ran 1–10 with "Very Likely" on the left, so some testers read it backwards. Both ends are labelled the right way round now.

---

**Notes for setting it up in Lyssna**

- Both tests are duplicates of last round's "Globaldata: Advanced Search 2" and keep its Live website test format: one task per screen, with its two questions straight after it. The NPS sits in its own final task screen, the same as last round.
- The control was duplicated from the finished 1c test, so the questions are identical. Only the prototype link differs.
- Don't mention the `$$` shortcut anywhere.
- The 1–5 scores can't be compared number for number with last round's flipped 1–10 scale. Last round is compared through the tasks and the reasons. This round's 1c-versus-1b scores are the real comparison, and the baseline from here on.
