# Boudica

Boudica is a mobile-first personal accountability, fitness and mental wellbeing PWA.

## Included in this build

- Today screen with one clear next action
- Morning sequence: stay off social media, 30-minute reading timer, 30-minute planning flow
- Three daily goals plus one main goal and brain dump
- Focus timers and a persistent "I'm stuck" tool
- Automatic home/away-day rhythm (Tue–Thu evenings are deliberately lighter)
- 12-week walking/running progression
- Full-body Workout A and Workout B using two 13 kg dumbbells
- One-exercise-at-a-time workout flow with reps logging and previous performance
- Consistent START → FINISH exercise illustrations
- 10-minute/minimum versions for movement and reading; short-version strength option
- Health tracking for weight and waist
- Proof/milestones and personal pride notes
- Evening reset
- Configurable in-app reminder preferences
- Light/dark mode
- Local-only data storage and JSON export
- Installable PWA with offline caching

## Running locally

Serve the folder over HTTP (service workers do not run from a plain file URL):

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploying

This is a static site and can be hosted directly on GitHub Pages, Netlify, Cloudflare Pages or similar static hosting.

## Reminder limitation

The first app-open each day deliberately surfaces the morning no-social-media routine. True scheduled lock-screen notifications while the PWA is fully closed require push-notification infrastructure or a native wrapper, and are not simulated in this build.

## Privacy

All tracking data in this MVP is stored in the browser's local storage on the user's device. There is no account, analytics service or external AI/API dependency.
