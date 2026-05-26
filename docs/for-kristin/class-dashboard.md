# Your Class Dashboard — How It Will Work

**Prepared by:** Kevin Kane / 10xDev
**For:** Kristin Karlin
**Date:** May 21, 2026

---

## The short version

The new admin dashboard is the one place you'll manage your classes. You add a class once, set the dates and prices, mark it published, and that's it — the website shows it and your Google Calendar fills in by itself.

This document walks through how that flow feels day-to-day: creating a brand-new class, scheduling a multi-week course, scheduling a one-off workshop, editing, and publishing.

For the Google Calendar side specifically, see the [calendar integration doc](./class-calendar-integration.md). The two work together — this one is about the dashboard side.

---

## What you'll see when you log in

You'll go to your website's admin area, log in with your email and password, and land on a list of all your classes — published ones and drafts. Each one shows its name, category, and current status.

From there, you can:

- **Click any class** to open it and see or change its details.
- **Click "+ New class"** to add a brand-new class to your catalog.

That's the whole front door. Everything else flows from picking a class to work on.

---

## Creating a new class

Click **"+ New class"** and fill in the details:

- **Class name** — e.g., "Beginning Copper Foil"
- **Category** — Stained Glass, Mosaic, Fused Glass, or Other
- **Skill level** — Beginner, Intermediate, Advanced, or All Levels
- **Prerequisite** — anything students should have done first (leave blank if none)
- **Description** — what students will make or learn
- **Tuition** — the base price
- **Supply fee, kit fee** — if applicable, listed separately
- **Notes about fees** — for things like "+ glass at cost" or "materials extra"
- **Max students** — limit per session (leave blank if no limit)
- **Photo** — optional class image
- **Published or draft** — draft saves it without showing on the website yet

Save, and you'll be taken to the class's **detail page** — that's the home base for everything about this class going forward. The class itself is now in your catalog, but it doesn't have any dates scheduled yet, so it isn't on the website or your calendar.

---

## Adding dates: a multi-week course

Most of your classes run as a series — "Beginning Copper Foil" meeting every Tuesday for 5 weeks, for example. On the class detail page, click **"+ New cohort"** to set one up.

A **cohort** is just one specific run of a class. You can have more than one cohort at a time for the same class — say, a Tuesday-evening cohort and a Saturday-morning cohort of "Beginning Copper Foil" — and each has its own schedule.

In the cohort form, you'll enter:

- **Label** — a short name to tell it apart from other cohorts, like "Tuesday evenings" or "Spring 2026"
- **Recurring schedule** — set the first date, choose how often the class meets (e.g., every Tuesday), set the start and end time, and how many sessions. The dashboard does the math for you.

Once you set the recurring schedule, the form expands into a list of every individual session — one row per date — already filled in for you. From there:

- Need to skip a Thanksgiving week? **Delete that row.**
- One session running 30 minutes longer than the others? **Edit that row's end time.**
- Want to add a makeup session next month? **Add a row.**

The list of sessions is what actually saves. The recurring schedule is just a fast way to populate the list — once it's filled in, the individual rows are what count.

Save the cohort, and (if both the class and the cohort are published) the sessions appear on the website and on your Google Calendar.

---

## Adding dates: a one-off workshop

Some classes only run once — a Saturday workshop, a holiday session, a guest class. For those, on the class detail page, click **"+ New single session"** instead of "+ New cohort."

The form is simpler: just one date, one start time, one end time. No label, no recurring schedule, no list of rows. The dashboard handles the rest behind the scenes, and the class shows up on the website and your calendar with a layout that fits a one-day class.

---

## Editing

Editing works the same way as creating. Click into any class, cohort, or session, and the same form opens up — already filled in with what's there. Change what you need to change, save, and the website and your Google Calendar update to match.

---

## When does something show up on the website?

A class appears on the public website only when **all three** of these are true:

1. The **class itself** is set to **Published** (not draft).
2. At least one of its **cohorts** is also set to **Published**.
3. That cohort has at least one **upcoming session date**.

That third one is automatic. When the last session of a published cohort passes, the class quietly disappears from the website on its own — you don't have to remember to unpublish anything. Add new sessions or a new cohort, and it reappears.

The dashboard will make it clear, for each class, whether it's currently visible to the public — so you don't have to compute the rule in your head.

---

## A couple of things to know

- **Past cohorts stay in the dashboard.** Once a cohort's sessions have all passed, it doesn't get deleted automatically. You can look back at what you've run, copy an old cohort's structure when re-launching a course, or delete the history yourself if you want it cleaned up.
- **Class names create the website URL.** If you rename a class later, its web address changes too. Usually that's fine — but if a class is widely shared or linked, mention it to us before renaming.
- **The Google Calendar integration runs in the background.** You don't trigger it manually. Every save you make in the dashboard pushes the right updates to your calendar automatically. See the [calendar integration doc](./class-calendar-integration.md) for the details.

---

## Questions?

This is the proposed design. Before we build any of it, let us know if anything here doesn't match what you had in mind, or if there's anything about how you currently set up and schedule classes that we should account for.
