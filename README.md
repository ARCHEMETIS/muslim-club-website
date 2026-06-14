# Muslim Community KKU — Club Website

A complete website for the **Muslim Student Club, Khon Kaen University** — with a twist:
the entire content-management system runs on **Google Sheets & Forms**, so non-technical
committee members can update documents, finances, announcements, and members **without ever touching code**.

🔗 **Live demo:** https://muslimclub-kku.netlify.app

> Built as a real, in-production project for a student club. No frameworks, no backend server, no monthly cost.

---

## The problem

A student club needed a public website that:
- Shows prayer times, activities, a document archive, and **transparent finances**.
- Can be **maintained by rotating, non-technical volunteers** every year.
- Costs **nothing** to host and run.

Hiring a CMS or standing up a server was overkill. So the "backend" became **Google Sheets**.

## The approach — Google Sheets as a no-code CMS

```
Committee fills a Google Form  ─▶  responses land in a Google Sheet
        (on mobile)                          │  (published as CSV)
                                             ▼
            Static site fetches the CSV  ─▶  renders charts / tables / calendars
                                             │
                                  Hosted on Netlify (static, free, HTTPS)
```

- **Frontend:** plain HTML + Tailwind CSS + **vanilla JavaScript** (small, self-contained modules — no build framework).
- **"Backend":** Google Sheets published to CSV; Google Forms for data entry; Google Drive for files/receipts.
- **Live data:** the site reads the sheets on every load, so content updates appear **without redeploying**.
- **Graceful by design:** every module falls back to sample data when a sheet isn't connected or the network drops.

## Features

| Page | Highlights |
|------|-----------|
| 🕌 **Home / Prayer times** | Live daily times for the club's location via the [Aladhan API](https://aladhan.com/), localStorage caching, next-prayer countdown, Hijri date |
| 📂 **Documents** | Grouped by project / academic year / term, search + filter, file-type icons, Google Drive preview & download |
| 💰 **Finance** | Income/expense summary, monthly bar chart, expense donut, **clickable daily calendar** (great for Ramadan iftar), per-project breakdown, per-year selector, CSV export, **formatted printable report** with signature lines, receipt links per transaction |
| 📣 **Announcements** | News cards on the home page with images (auto-handles Google Drive image links) |
| 👥 **Committee** | Auto-sorted by role (president → vice → … → members), click-to-copy phone/email, Facebook links |
| ✉️ **Contact** | Editable info + embedded membership Google Form |
| 🔐 **Team page** | A private, unlisted page collecting all the input forms for committee use |

## Tech stack

- **HTML5**, **Tailwind CSS** (compiled to a local file — no CDN dependency at runtime)
- **Vanilla JavaScript** — module-per-feature pattern, no framework, ~10 small files
- **Google Sheets** (published CSV) + **Google Forms** + **Google Drive** as the data layer
- **Aladhan API** for prayer times
- **Netlify** for static hosting (drag-and-drop deploy)

## Project structure

```
├── index.html              # main single-page app (4 sections)
├── team.html               # private form hub for the committee
├── css/
│   ├── style.css           # custom styles + print styles
│   ├── tailwind.css        # compiled Tailwind (generated)
│   └── tailwind-input.css   # Tailwind entry file
├── js/
│   ├── config.example.js   # ⭐ configuration template (copy to config.js)
│   ├── sheets.js           # CSV fetch + parser
│   ├── main.js             # SPA navigation
│   ├── content.js          # home-page text from config
│   ├── prayer.js           # prayer times (Aladhan API)
│   ├── documents.js        # document archive
│   ├── finance.js          # finance dashboard + reports
│   ├── announcements.js    # news cards
│   ├── committee.js        # committee directory
│   └── contact.js          # contact info + membership form
├── assets/img/             # logo + artwork
├── google-sheets-templates/# CSV templates + setup guides (Thai)
├── tailwind.config.js      # Tailwind theme + content sources
└── คู่มือ-README.md         # maintainer's guide (Thai)
```

## Getting started

This is a static site — no install required.

```bash
# 1. clone
git clone https://github.com/<your-username>/muslim-club-kku.git
cd muslim-club-kku

# 2. add your config (or leave it to see the sample-data demo)
cp js/config.example.js js/config.js

# 3. serve locally (any static server works)
python -m http.server 8000
# open http://localhost:8000
```

Connect your own Google Sheets/Forms by pasting their links into `js/config.js`.
Full setup guide (Thai) is in `คู่มือ-README.md` and `google-sheets-templates/`.

### Rebuilding Tailwind (only if you change classes)

```bash
npx tailwindcss@3 -c tailwind.config.js -i css/tailwind-input.css -o css/tailwind.css --minify
```

## License

[MIT](LICENSE) — free to use and learn from.

---

*Made with care for the Muslim Community, Khon Kaen University. 🕌*
