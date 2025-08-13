# DevOps Roadmap Tracker

An interactive web app to track your DevOps learning journey, visualize progress, and manage backups. Includes gamification, mindmap, and PWA support.

## File Structure

```
devops-roadmap/
├── icons/                  # PWA icons for various device sizes
│   ├── icon-192.png
│   └── icon-512.png
├── index.html              # Main HTML file
├── js/                     # Modular JavaScript files
│   ├── backup.js           # Backup and import logic
│   ├── charts.js           # Chart rendering (progress donut, etc.)
│   ├── dataLoader.js       # Loads roadmap and user data
│   ├── gamification.js     # Gamification features (XP, achievements)
│   ├── main.js             # App initialization and core logic
│   ├── mindmap.js          # Mindmap visualization
│   ├── tracker.js          # Progress tracking logic
│   └── xpBar.js            # XP bar UI and logic
├── manifest.json           # PWA manifest
├── roadmap.json            # Roadmap data (topics, structure)
├── script.js               # Legacy or main script entry point
├── service-worker.js       # Service worker for offline/PWA support
└── style.css               # App styles
```

## Getting Started

1. **Clone or download** this repository.
2. **Open `index.html`** in your browser.
3. **Track your progress** and use features like backup, import, and PDF export.
4. **Install as a PWA** for offline access.

## Features

- Progress tracking and visualization
- Mindmap of DevOps topics
- Gamification (XP, achievements)
- Export progress as PDF
- Backup and import your data
- PWA install and offline support

## Development

- **HTML:** Edit `index.html` for structure and UI.
- **CSS:** Customize `style.css` for appearance.
- **JavaScript:** Modular scripts in `js/` for features and logic.
- **Roadmap Data:** Update `roadmap.json` to change topics or structure.
- **PWA:** Configure `manifest.json` and `service-worker.js` for installability and offline use.

## Requirements

- Modern web browser (Chrome, Firefox, Edge, etc.)
- Internet connection for CDN libraries (unless bundled locally)
