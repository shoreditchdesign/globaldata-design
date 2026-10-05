# Sprint 5 user testing — hypotheses

## Overall hypothesis

The fixes in Idea 1c make building a result set easy. There's one session, on 1c only, so the hypothesis is judged against fixed targets and against what last round's testers reported, not against a control group.

- **Confirmed if** most tasks average 4 or more on the 1–5 ease scale, the SUS score reaches at least 68 (the commonly cited average), and the NPS is positive, meaning more promoters (9–10) than detractors (0–6).
- **Refuted if** most tasks average below 3, the SUS score is under 68, or the NPS is negative.
- **What we can't measure any more:** whether 1c is easier than 1b. With the control dropped, there's no side-by-side score, and last round's numbers can't stand in for one because its scales were read backwards. A comparison with last round only works on what testers *said*, so each hypothesis below sets an absolute target and, where last round reported a problem, checks whether that problem comes up again.

## One hypothesis per change

| # | Hypothesis | Task | Confirmed if | Refuted if |
|---|---|---|---|---|
| 1 | Putting Advanced filter in the search field as a switch makes the builder findable without being told where it is | 4 | Most answers to "Talk us through how you went about it" describe turning on Advanced filter without hunting for it. Last round, testers weren't finding Advanced search at all | Most answers describe searching around, typing instead, or giving up, which is the same problem last round reported |
| 2 | One on/off switch makes it clear which mode you're in | 4 | No Task 4 answers mention being unsure which mode they were in. Last round, one tester finished the by-hand task not knowing | Answers still mention mode confusion |
| 3 | Tick boxes make it clear whether a value is replaced or added | 2 | Task 2 averages 4 or more, ranks among the easiest tasks, and no reasons describe a value being added when they meant to replace it. Last round, this task was rated the hardest and the add-instead-of-replace problem was reported | Task 2 averages below 3, or reasons still describe the add-instead-of-replace problem. (Last round's score can't be compared directly because its scale was flipped) |
| 4 | Testers can take out something they've added | 2, 5 | Tasks 2 and 5 average 4 or more, and no reasons say they couldn't remove something. Last round reported "no way to remove a value once added" | Reasons still say there's no way to remove a value or a filter |
| 5 | Capping the filter row at three lines stops it crowding out the results | 3, 4 | No reasons mention the filters pushing the results away. Last round reported that the builder crowded the results | Reasons still mention it, or mention the folded count being hard to find |
| 6 | A loading state shows that a search has run | All | No reasons say they weren't sure whether the search had worked. Last round reported that the system didn't show it was working | Reasons still say it |
| 7 | Target vs. Mechanism of action is still ambiguous. There's no fix yet, so this is a check | 1, 4 | Reasons mention mixing up Target and Mechanism of action, as they did last round, which means it needs fixing next sprint | Nobody mentions it, which means the ambiguity is smaller than last round suggested |
| 8 | A labelled "+ Add filter" and its full field list give people an obvious way to narrow down further | 6 | Task 6 averages 4 or more, and its reasons mention Add filter or the filter row. Neil raised the bare + icon on the call, and it wasn't a tested finding, so there's no earlier result to compare with | Task 6 averages below 3, or nobody mentions Add filter |
| 9 | People narrow by company from the filter row at the top, not from the table's columns (Neil's question about column filters) | 6 | Most reasons describe the filter row, typing or Add filter | Many people reach for the column headers first, which means column filtering is expected and should stay |
| 10 | When a search finds nothing, the empty state helps people recover | 7 | Task 7 averages 4 or more, and reasons show people knew what to change. This is new, so there's no earlier result to compare with | Task 7 averages below 3, or reasons say they didn't know what to change |
| 11 | Overall usability is at least average for a web product | SUS | SUS score of 68 or more | SUS score under 68 |

## Setup

- **One Lyssna test,** "GlobalData Sprint 5 user testing", run on Idea 1c. The control test built earlier ("GlobalData Sprint 5 user testing control", on Idea 1b) stays in Lyssna but won't be used.
- **Seven tasks, then SUS, then NPS.** Tasks 1–3 are last round's Lyssna tasks, word for word. Task 4 is last round's by-hand task, with the wording that named the builder removed. Tasks 5–7 are new.
- **The same follow-up after every task:** an ease score from 1 to 5 (1 = Very difficult, 5 = Very easy), then "What's the reason for your answer?". Task 4 asks "Talk us through how you went about it." instead, so whether people found Advanced filter can be judged from their own account without naming it.
- **SUS** is the ten standard statements, each rated 1–5 (1 = Strongly disagree, 5 = Strongly agree) and scored 0–100 the standard way. **NPS** runs 0–10 (0 = Not at all likely, 10 = Extremely likely). Every scale runs from negative on the left to positive on the right.
- **Last round's caveat.** Round 1 asked for a difficulty score where 1 = very easy, and its NPS ran 1–10 with "Very Likely" on the left. About half the testers read those scales backwards, so round 1's numbers can't be trusted or compared with this round's. Comparisons with round 1 use what testers said, not their scores. This round's numbers, and its SUS score in particular, become the baseline from here on.
