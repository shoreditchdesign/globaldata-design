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
| 1 | Nobody found Advanced search | An "Advanced filter" switch inside the search field | 4 (judged from "Talk us through how you went about it") |
| 2 | A tester didn't know which mode they were in | One on/off switch instead of two tabs | 4 |
| 3 | Tapping a value added it instead of replacing it | Tick boxes: the row picks only that value, the box adds it | 2 |
| 4 | No way to remove a value once it was added | Untick a value, or remove a filter with its × | 2, 5 |
| 5 | The builder crowded out the results as the query grew | The filter row is capped at three lines, with the rest folded into a count | 3, 4 |
| 6 | The system didn't show it was working | The table shows a loading state after every search or change | All (it comes up in the reasons) |
| 7 | Target vs. Mechanism of action was ambiguous | **No fix yet**, so this is a check | 1, 4 (it comes up in the reasons) |
| 8 | Add filter was a bare + icon (Neil, on the call) | "+ Add filter", which opens the full field list | 6 |
| 9 | Whether people expect to filter from the columns (Neil, on the call) | Column filters that write into the filter row | 6 |
| 10 | A search that finds nothing (added for coverage, not a round 1 finding) | An empty state that names the filter to step back from | 7 |
| 11 | Overall usability | — | SUS |

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
- **What's the reason for your answer?** `long text`. Task 4 is the exception: its prompt is **"Talk us through how you went about it."**

**1.** Find every Phase III drug available in Europe that works on Janus Kinase.

> **Why:** this is last round's Task 1, word for word, and it tests G1, Quick search. It returns 50 drugs. The phrase "works on Janus Kinase" fills both Target and Mechanism of action, so if that ambiguity still bothers people, this is where they'll say so.

**2.** Using the search you just built, swap Europe for the United States.

> **Why:** this is last round's Task 2, word for word, and it tests G2, Refine. It returns 33 drugs. It scored worst last round, because tapping a value added it instead of replacing it, and there was no way to take a value out. Last round's score can't be compared directly because its scale was flipped, so the target is an average of 4 or more, with no reasons describing a value being added instead of replaced.

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

> **Why:** this replaces last round's Task 4, which named "the advanced search" and "the file explorer" and so gave away where to go. It drops last round's extra "which was easier" box too. It's the discoverability test Neil asked for ("challenge people… to at least do an advanced search using the search builder"). The task can only be done in the builder, but it doesn't name Advanced filter. Neil's "contrast the ease" is this score set against Task 3's. Picking Mechanism of action by hand is also where Target vs. Mechanism of action will trip people up, if it still does.
>
> Instead of "What's the reason for your answer?", this task's long-text prompt is **"Talk us through how you went about it."** It's neutral and doesn't name anything, but whether someone describes turning on Advanced filter, typing, or getting stuck tells us whether they found the builder on their own. That's how discoverability gets judged.

**5.** Now take route of administration out of your search, so drugs given any way are included.

> **Why:** this is new. It tests removing something you've added, which last round's testers couldn't do ("no way to remove a value once added"). Starting from Task 4's 12 drugs, it goes to 28. Choosing more than one value in a field isn't a task of its own now: Task 2's swap already covers last round's tick-versus-replace confusion.

**6.** You now only want the drugs from one company in your list. Choose any company you can see, and narrow the list down to it.

> **Why:** this is new, and it's Neil's narrow-it-further task. On the call it was "narrow down the 123 drugs further, how would you do this?", with "company is a great one" because company is in the results but not in the search. There are 16 companies in the 28 results, each with between 1 and 4 drugs, and every one is in the Manufacturer field, so it can be done by typing, from Add filter, from the builder or from a column. The task doesn't say how, so the reasons show where people reach first, and whether the column filters earn their place.

**7.** Start a new search for Phase I gene therapies for dermatology in Brazil. If it finds nothing, change the search until it does.

> **Why:** this is new. It tests a search that comes back empty, and recovering from it. The full query matches nothing in either sample. Dropping "gene therapies" gives 8 drugs, and dropping "dermatology" gives 1. 1c's empty state names the filter to step back from, so the reasons show whether that's enough to get people moving again.

**Not given a task of their own:**
- **Knowing a search has run.** Every task above runs a search, so if the loading state isn't working, it will come up in the reasons.
- **Brackets in the Boolean logic.** Neil expects testers to ask about them, but the call agreed not to put design time into them.

---

## System Usability Scale (SUS)

Second-last, directly before the NPS. Lyssna heading: **System Usability Scale**, with the line "Rate how much you agree with each statement." Each statement is rated 1–5, where 1 = Strongly disagree and 5 = Strongly agree. The wording is Austin's, from his SUS sheet:

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

> **Why:** SUS is a standard benchmark with a published average, so it gives a score that means something without a control group. It can also be compared across future rounds of this one. It comes after the tasks, so it rates the whole experience, and before NPS, so the recommendation question stays last as it was in round 1.

---

**8.** How likely are you to recommend this way of searching to a colleague? `0–10`, where 0 = Not at all likely and 10 = Extremely likely
- What's the reason for your score?

> **Why:** this is kept from last round. It runs 0–10 rather than 1–10 because that's the standard NPS scale, and the NPS calculation (promoters 9–10 minus detractors 0–6) relies on the 0. Last round's version ran 1–10 with "Very Likely" on the left, so some testers read it backwards. Both ends are labelled the right way round now.

---

**Notes for setting it up in Lyssna**

- The test is a duplicate of last round's "Globaldata: Advanced Search 2" and keeps its Live website test format: one task per screen, with its two questions straight after it. SUS has its own screen just before the NPS, which sits on the final screen as it did last round.
- The control test ("GlobalData Sprint 5 user testing control", on Idea 1b) stays in Lyssna but won't be run.
- Don't mention the `$$` shortcut anywhere.
- The 1–5 scores can't be compared number for number with last round's flipped 1–10 scale. Last round is compared through the tasks and the reasons. With no control, this round's scores are absolute: ease against a 4-out-of-5 target, SUS against 68 and NPS against zero. They become the baseline from here on.
