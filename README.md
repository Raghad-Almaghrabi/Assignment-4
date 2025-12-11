# 🎨 Personal Portfolio Website – Assignment 4

This repository contains my **Assignment 4 – Personal Web Application**, which is a fully functional **personal portfolio website** built with **HTML, CSS, and JavaScript**.

The website is designed to be:

- A **professional portfolio** to showcase my work as a Software Engineering student.
- An interactive, **DOM-driven web app** demonstrating course concepts.
- A small playground for **API integration**, state handling, and user experience design.

---

## 🌐 Live Demo

The site is deployed and accessible here:

👉 **Live Deployment:** https://portfoliowebsite-rosy-ten.vercel.app  

---

## ✨ Main Features

- **Fixed header & navigation** – Quick access to About, Projects, Skills, and Connect sections.
- **Hero section** – Introduction, role, and location with a hero image.
- **Theme toggle (Light/Dark)** – Uses `localStorage` to remember the user’s preference.
- **Greeting popup** – Asks the user for their name and greets them based on time of day, stored in `localStorage`.
- **Experience level selector** – Adjusts messaging and influences which projects are highlighted (Beginner / Advanced / Just browsing).
- **Projects section with controls:**
  - **Search** by title, tags, or description.
  - **Filter** by tag (`web`, `ai`, `design`).
  - **Sort** by title or date.
  - **Show/Hide** projects grid with persisted preference.
- **Skills section** – Expandable / collapsible skill cards (click or keyboard).
- **Weather integration** – Fetches current weather in Dhahran using the **Open-Meteo API**.
- **Contact form with validation** – Required fields, email validation, and user feedback messages.
- **Footer with live clock & session timer** – Shows current time (GMT+3) and how long the user has been on the page.

---

## 📁 Project Structure



```txt
assignment-4/
├── README.md
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── script.js
├── assets/
│   └── images/
├── docs/
│   ├── ai-usage-report.md
│   └── technical-documentation.md
├── presentation/
│   ├── slides.pdf
│   └── demo-video.mp4
└── .gitignore

```
---
## 🛠️ How to Run the Project Locally

You can run this project locally in two simple ways.

### Option 1 – Open `index.html` directly

Clone the repository:

```bash
git clone [https://github.com/Raghad-Almaghrabi/Assignment-4.git](https://github.com/Raghad-Almaghrabi/Assignment-4.git)
cd Assignment-4
```
Open index.html in your browser:


```Bash
open index.html
```
Or just double-click index.html in Finder.

---

### 🤖 AI Tools Usage (Summary)

I used AI tools as assistants, not as replacements, to speed up development and improve quality. In particular, AI was used for:

* **Brainstorming** UI/UX ideas and project structure.
* Generating and refining parts of the **HTML/CSS/JS**, especially:
    * Project filtering/sorting logic.
    * `localStorage` handling (theme, login state, greeting).
    * Weather API integration using `fetch`.
    * Form validation and user feedback messages.
* **Debugging** issues with DOM manipulation and event handling.
* Improving **text content** and descriptions in the interface.

All AI usage is documented in detail in:

* `docs/ai-usage-report.md` – full log of prompts and how generated code was adapted.

The final code was reviewed, understood, and modified by me to match the assignment requirements and my own style.

---

### 📄 Additional Documentation

* `docs/technical-documentation.md` – Technical explanation of the architecture, key functions, and design decisions.
* `docs/ai-usage-report.md` – Detailed log of AI interactions and how they were used.
