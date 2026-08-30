# Rawafid Life OS — Product Roadmap

## Product direction
Rawafid should evolve from a collection of useful tools into a coherent daily-life operating layer: it understands what matters today, helps the user capture anything quickly, remembers it, surfaces the next useful action, and connects health, safety, family, planning, memory and accessibility without forcing the user to choose the correct tool first.

Core principle: **the next leap is not adding dozens of isolated tools; it is making the existing tools behave like one system.**

## P0 — Core Life OS layer
1. **Rawafid Assistant (action-oriented, not just chat)**
   - Natural-language and voice input.
   - Converts requests into real app actions with confirmation.
   - Examples: create reminder, add appointment, record symptom, start routine, add Circle person, find saved item, open emergency flow.

2. **Life Inbox / Universal Capture**
   - One persistent `+` entry point.
   - Capture note, task, reminder, appointment, medication, item location, person, file, image, list or voice memo.
   - Classify and route the captured item automatically.

3. **Today Command Center**
   - Show Now / Next / Today / Needs attention.
   - Aggregate medication, appointments, routines, family tasks, safety check-ins and reminders.
   - Reduce duplicate cards and show the most relevant next action.

4. **Unified Calendar**
   - Day / week / month.
   - Aggregate appointments, medication schedules, routines, care tasks, women calendar, Safe Arrival, Future Notes and dated tasks.
   - Optional Android Calendar integration with explicit permission.

5. **Universal Search**
   - Search notes, medications, appointments, Circle people, vault metadata, saved item locations, health timeline, routines, tasks and Rawafid knowledge.
   - Entity-centered results, e.g. search a family member and see all related items.

6. **Smart Notification Orchestrator**
   - Consolidated morning/period summaries instead of notification spam.
   - Actions: done, snooze, open, skip today.
   - Quiet hours and per-category controls.

## P1 — Daily assistant depth
7. **Context / Life Modes**
   - Home, work, travel, caregiving, sick day, low energy, focus mode.
   - Adapt Today screen and priorities to the active context.

8. **Routines 2.0**
   - Step-by-step execution, one task at a time.
   - Morning, sleep, study, caregiving and medication routines.
   - Pause/resume and adaptive timing.

9. **Encrypted Sync & Backup**
   - Optional cross-device sync for user-owned data.
   - Export/restore and clear data ownership controls.

10. **Voice-first interaction**
    - Quick capture by voice.
    - Read-back mode for accessibility.
    - Confirm before sensitive actions.

11. **Family shared layer**
    - Shared lists, delegated care tasks, shared appointments and check-ins.
    - Role-based permissions through Rawafid Circle.

12. **Weekly review**
    - A concise personal recap: completed items, missed items, upcoming appointments, medication adherence summary, routines and trends.

## P2 — High-value extensions
13. **Location-based reminders**
    - Remind when arriving/leaving a chosen place, with explicit geofence consent.

14. **Documents & expiry tracker**
    - IDs, insurance, prescriptions, vehicle/house documents, warranties.
    - Local encrypted scan/storage and expiry reminders.

15. **Home & vehicle maintenance**
    - Recurring maintenance schedules, filters, inspections, service dates and warranties.

16. **Shopping and household lists**
    - Fast shared lists with family, reusable templates and completion states.

17. **Travel preparation mode**
    - Packing, documents, medications, emergency info, itinerary and offline phrases in one flow.

18. **Emergency readiness plan**
    - Trusted people, emergency card, medications, offline pack and family check-in plan.

19. **Decision helper**
    - Lightweight structured decisions: options, pros/cons, deadline, next action.

20. **Android integration**
    - Share-to-Rawafid from other apps.
    - Home-screen widgets, Quick Settings tile, lock-screen shortcuts where supported.

## UX/navigation direction
Keep the five primary destinations:
- Today
- Health
- Safety
- Life
- Account

Add a persistent assistant/capture affordance rather than a sixth tab.

Account/Circle behavior should be state-aware:
- Before sign-up: prominent onboarding card.
- After sign-in: compact identity/Circle summary.
- Pending request: surface only when actionable.

## Product constraints
- Avoid feature bloat and social-feed mechanics.
- Privacy-first and explicit permissions for sensitive data/location.
- Offline-first for critical safety and daily functions where possible.
- No medical diagnosis or autonomous medication dosing.
- Assistant actions that change data or share sensitive information require clear confirmation.

## Success definition
The user should stop thinking in terms of separate tools and instead think: **"Open Rawafid; it knows what I need to do today."**
