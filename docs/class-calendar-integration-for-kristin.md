# Your Class Schedule on Google Calendar — How It Will Work

**Prepared by:** Kevin Kane / 10xDev
**For:** Kristin Karlin
**Date:** May 21, 2026

---

## The short version

You wanted to keep your Google Calendar — the one your students already know how to look at and subscribe to. So we're going to keep it.

The new admin dashboard we're building for you will manage your classes in one place: when you add a new class, set the dates, or mark one sold out, the dashboard will **automatically update your Google Calendar in the background**. You don't have to enter anything twice.

That means: one place to manage everything, two places it shows up — the new website, and your Google Calendar.

---

## What changes for you

Today, when you schedule a class, you have to type it into Google Calendar by hand. Going forward, you'll only type it into the new admin dashboard. The dashboard does the Google Calendar part for you, every time, automatically.

**Things you do in the dashboard. Google Calendar updates by itself:**

- Add a new class — the dates appear on your Google Calendar.
- Change a session date — the event on your calendar moves to match.
- Cancel a session — the event disappears from your calendar.
- Mark a class as sold out — every session for that class gets a "[SOLD OUT]" tag on your calendar.
- Open a class back up (e.g., someone dropped) — the tag goes away.

No double entry. No risk of the website saying one thing and Google Calendar saying another.

---

## What students will see on your Google Calendar

Each session of each class becomes its own event on your calendar. Here's what one event will look like:

**Event title:**
> Beginning Copper Foil — Tuesdays — Session 3 of 5

For a one-off single-session class, the title is simpler:
> 3-D Beveled Star — Saturday March 14

If the cohort is sold out, the title gets a tag at the front:
> [SOLD OUT] Beginning Copper Foil — Tuesdays — Session 3 of 5

**Event description** (what students see when they click the event):

> Skill level: Beginner
> Category: Stained Glass
>
> A 5-week introduction to copper foil construction. Students learn glass cutting, foiling, and soldering techniques while completing their first project.
>
> Prerequisite: None
> Tuition: $150
> Supply fee: $15
> Notes: + glass at cost
> Class size: max 7 students
>
> Full details: https://allenkenoyerglass.com/classes/beginning-copper-foil/

**Event location:** your studio address (so students can tap "Get directions" on their phone).

**Event color:** each class category gets its own color, so the calendar is easy to scan at a glance:

- Stained glass classes — blue
- Mosaic classes — orange
- Fused glass classes — purple
- Other — gray

---

## What you need to do — one-time setup

Before we go live, we'll need you to do one quick thing in your Google Calendar settings (takes about 30 seconds). We're going to give the dashboard a small "permission slip" to write to your calendar.

Here's what that looks like:

1. Open Google Calendar in your web browser.
2. Find your class calendar in the list on the left.
3. Hover over it, click the three dots, and choose **Settings and sharing**.
4. Scroll down to **Share with specific people or groups**.
5. Click **Add people and groups**.
6. Paste in an email address we'll send you (it'll look something like `aks-calendar@<project-name>.iam.gserviceaccount.com` — don't worry about what it means, just paste it).
7. Set the permission to **Make changes to events**.
8. Click **Send**.

That's it. You'll never need to touch that setting again. From that point on, the dashboard can keep your calendar in sync automatically.

---

## What if something goes wrong?

The dashboard is the place where your class information actually lives. Your Google Calendar is a copy of it. So if something ever goes sideways — Google has a hiccup, the internet drops out, whatever — your dashboard data is still safe and correct.

When the dashboard tries to update your calendar and Google doesn't respond (it happens occasionally), you'll see a small notice on that class in the dashboard that says something like **"Calendar out of sync — Retry."** Click the button and it tries again. Usually that's all it takes.

For bigger situations — say, you want to start a fresh calendar, or you suspect things have drifted out of sync — there's also a **"Sync everything to Google Calendar"** button in the dashboard. Click it once, and the dashboard pushes every active class and session back to your calendar from scratch. It's the same button we'll use to populate your calendar the very first time, just before launch.

---

## A couple of things to know

- **Edits should happen in the dashboard, not directly in Google Calendar.** If you change a date in Google Calendar by hand, the next time you edit that class in the dashboard, the dashboard's version will win — and your Google-Calendar-side edit will be overwritten. Just always make the change in the dashboard, and you'll never run into this.
- **Past classes stay on your calendar.** Events that have already happened don't disappear automatically — they remain on your calendar as a history of what ran when. If you ever want to delete them, you can do that yourself directly in Google Calendar.
- **It's all the same calendar you have today.** We're not creating a new calendar, replacing yours, or asking your students to subscribe to anything different. The same calendar URL keeps working; the same subscribers keep seeing your classes.

---

## Questions?

This is the proposed design. Before we build any of it, let us know if anything here doesn't match what you had in mind, or if there's anything about how you currently use your calendar that we should account for.
