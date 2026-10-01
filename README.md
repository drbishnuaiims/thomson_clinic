# Thomson Clinic — Phase 1

This repository contains the first frontend pass for the Thomson Clinic public doctor profile and appointment booking experience.

## Included

- Minimal public homepage at `index.html`
- Doctor profile page at `doctors/dr-thitta-mohanty.html`
- Shared styling in `assets/css/main.css`
- Doctor page styling in `assets/css/doctor-profile.css`
- Frontend validation and demo submission logic in `assets/js/doctor-profile.js`
- Local placeholder illustration in `assets/images/doctor-portrait.svg`

## Design notes

- Lightweight static HTML, CSS, and JavaScript only
- No Node.js build step required
- Intended for GitHub Pages deployment
- Demo-only appointment submission with a clear structure for future backend integration

## Local preview

From the project root, run:

```bash
python3 -m http.server 8000
```

Then open:

- http://localhost:8000/
- http://localhost:8000/doctors/dr-thitta-mohanty.html

## Implementation intent

The front end is intentionally simple and ready for a later Phase 2 connection to Google Apps Script or a backend API. The appointment form reads the doctor ID from the page via `data-doctor-id`, validates the input on the client side, and shows a success state without pretending a remote save occurs.
