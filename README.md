# TaskFlow — A Full-Stack, AI-Assisted Task Management Platform

TaskFlow is a complete full-stack task and project management application built for dark-store engineering pods. It features a relational FastAPI backend, a vanilla JavaScript frontend dashboard, custom hand-rolled sorting/searching algorithms, and a zero-key rule-based AI quick-add parser.

---

## 🛠️ Tech Stack & Architecture
- **Backend:** Python, FastAPI, SQLAlchemy ORM, Pydantic
- **Database:** SQLite (`sql_app.db` / `taskflow.db`)
- **Frontend:** HTML5, CSS3 (with responsive media queries), Vanilla JavaScript (Fetch API & localStorage caching)
- **Algorithms Engine:** Custom `insertion_sort`, `binary_search`, and `linear_search` implemented from scratch.
- **AI Quick-Add Engine:** Rule-based deterministic prompt parser simulating role-based LLM behavior with zero API keys.

---

## ⚙️ Environment Setup & Installation

Follow these steps to set up and run the project locally from a clean checkout:

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/shaileshkumar362/TaskFlow.git](https://github.com/shaileshkumar362/TaskFlow.git)
   cd TaskFlow