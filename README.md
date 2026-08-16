# 🚀 TaskFlow — Full-Stack, AI-Assisted Task Management Platform

An enterprise-grade, full-stack operational management system tailored for dark store logistics and high-efficiency task execution. Built with a robust Python FastAPI backend and a high-performance modern vanilla JavaScript web interface, **TaskFlow** integrates automated natural language parsing, dynamic priority management, custom computer science sorting/searching algorithmic engines, and modular middleware processing.

---

## 📑 Table of Contents
1. [Core Architectural Features](#-core-architectural-features)
2. [Technology Stack](#️-technology-stack)
3. [Project Structure & File Breakdown](#-project-structure--file-breakdown)
4. [API Key Setup](#-api-key-setup)
5. [Installation & Local Setup Guide](#-installation--local-setup-guide)
6. [Running the App](#-running-the-app)

---

## 🌟 Core Architectural Features

* **🌓 Dynamic Dark Mode UI:** Engineered with a sleek, high-contrast operational control panel optimized for low-fatigue multi-tasking and rapid data entry.
* **⚡ Smart AI Quick-Add Engine:** Features a natural language processing parser (`parser.py`) that automatically translates raw textual descriptions into structured operational workflows, target execution dates, and priority levels.
* **🎯 Advanced Priority Matrix:** Automatically classifies tasks into granular priority tiers (*High, Medium, Low*) based on semantic importance, urgency keywords, and explicit user controls.
* **🧮 Algorithmic Control Engine (`algorithms.py`):**
  * **Insertion Sort Engine:** Programmatically organizes and prioritizes tasks sequentially based on priority weight and chronological deadlines.
  * **Binary & Linear Search Modules:** Implements core search algorithms to perform instantaneous lookups across task datasets by exact title matching.
* **📂 Project & Lifecycle Management:** Isolate tasks into dedicated operational groups, update statuses seamlessly, and manage end-to-end task lifecycles with complete CRUD support (`crud.py`).

---

## 🛠️ Technology Stack

* **Frontend Layer:** HTML5, CSS3, Modern Vanilla JavaScript (ES6+), Asynchronous DOM manipulation (`fetch` API), and responsive CSS grid layouts (`frontend/`).
* **Backend Layer:** Python (FastAPI framework), SQLAlchemy ORM, RESTful API architecture, modular routing, custom data processing middleware (`middleware.py`), and dedicated database operations (`crud.py`).
* **Algorithmic Logic:** Custom-built text parsing routines, algorithmic sorting wrappers, and structured data mapping.

---

## 📁 Project Structure & File Breakdown

```text
TaskFlow/
├── backend/
│   ├── __pycache__/
│   ├── __init__.py
│   ├── algorithms.py     # Custom Insertion Sort, Binary & Linear Search engines
│   ├── crud.py           # Database operations, queries, and state management helpers
│   ├── database.py       # Database engine configuration & session factory management
│   ├── main.py           # FastAPI application entry point & routing endpoints
│   ├── middleware.py     # Custom request/response middleware processing & logging
│   ├── models.py         # SQLAlchemy ORM models (User, Project, Task tables)
│   ├── parser.py         # Natural language AI quick-add expression parser
│   └── schemas.py        # Pydantic request/response validation schemas
├── frontend/
│   ├── app.js            # Client-side core logic, DOM rendering & event listeners
│   ├── index.html        # Semantic dashboard UI operational layout
│   └── style.css         # High-contrast styling, components & dark mode design
├── venv/                 # Python isolated virtual environment
├── database.json         # Fallback & local JSON mock dataset storage
├── requirements.txt      # Python package dependencies manifest
├── sql_app.db            # SQLite database persistence file
├── taskflow.db           # Main SQLite operational tracking database
└── README.md             # Comprehensive project documentation

🔑 API Key Setup
Code run karne ke liye agar aap AI features ya Google Gemini API ka use kar rahe hain, toh aapko apni Google Gemini API Key ki zaroorat padegi:

Main configuration file mein jahan YOUR API KEY likha hai, wahan apni key daal dein.

Agar aapke paas key nahi hai, toh aap Google AI Studio se free mein generate kar sakte hain.

⚙️ Installation & Local Setup Guide
Follow these steps to set up and run the project locally on your machine:

Clone the repository:

Bash
git clone [https://github.com/your-username/taskflow.git](https://github.com/your-username/taskflow.git)
cd taskflow
Set up the Virtual Environment & Dependencies:

Bash
python -m venv venv

# Windows PowerShell ke liye:
.\venv\Scripts\Activate.ps1

# Mac / Linux ke liye:
source venv/bin/activate

# Dependencies install karein:
pip install -r requirements.txt
