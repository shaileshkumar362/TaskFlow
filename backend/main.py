from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import json
import os
from google import genai

app = FastAPI(title="TaskFlow Dark Store Ops API", version="1.0.0")

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini AI Client (Yahan apni Gemini API Key daalein)
ai_client = genai.Client(api_key="YOUR_API_KEY")

# --- IN-MEMORY / JSON DATABASE MOCK ---
DB_FILE = "database.json"

def init_db():
    if not os.path.exists(DB_FILE):
        initial_data = {
            "projects": [
                {"id": 1, "name": "Dark Store Ops", "owner_id": 1}
            ],
            "tasks": [
                {
                    "id": 1718000000000,
                    "title": "Restock inventory shelves",
                    "description": "Check aisle 4 and restock items",
                    "priority": "high",
                    "due_date": "Next Friday",
                    "project_id": 1,
                    "completed": False
                }
            ]
        }
        with open(DB_FILE, "w") as f:
            json.dump(initial_data, f, indent=4)

init_db()

def read_db():
    with open(DB_FILE, "r") as f:
        return json.load(f)

def write_db(data):
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=4)

# --- PYDANTIC SCHEMAS ---
class ProjectCreate(BaseModel):
    name: str
    owner_id: int = 1

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = "" 
    priority: str = "medium"
    due_date: Optional[str] = None
    project_id: int

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None 
    priority: Optional[str] = None
    due_date: Optional[str] = None
    project_id: Optional[int] = None
    completed: Optional[bool] = None

class QuickAddRequest(BaseModel):
    description: str
    project_id: int

# --- PROJECT ENDPOINTS ---
@app.get("/projects", response_model=List[dict])
def get_projects():
    db = read_db()
    return db["projects"]

@app.post("/projects", status_code=201)
def create_project(project: ProjectCreate):
    db = read_db()
    new_id = max([p["id"] for p in db["projects"]], default=0) + 1
    new_proj = {"id": new_id, "name": project.name, "owner_id": project.owner_id}
    db["projects"].append(new_proj)
    write_db(db)
    return new_proj

# --- TASK ENDPOINTS ---
@app.get("/tasks", response_model=List[dict])
def get_tasks(sort: Optional[str] = Query(None)):
    db = read_db()
    tasks = db["tasks"]
    
    if sort == "priority":
        weight = {"high": 1, "medium": 2, "low": 3}
        arr = list(tasks)
        for i in range(1, len(arr)):
            key = arr[i]
            j = i - 1
            while j >= 0 and weight.get(arr[j].get("priority", "medium"), 2) > weight.get(key.get("priority", "medium"), 2):
                arr[j + 1] = arr[j]
                j -= 1
            arr[j + 1] = key
        return arr

    return tasks

@app.post("/tasks", status_code=201)
def create_task(task: TaskCreate):
    db = read_db()
    new_task = {
        "id": int(os.urandom(4).hex(), 16),
        "title": task.title,
        "description": task.description, 
        "priority": task.priority.lower(),
        "due_date": task.due_date,
        "project_id": task.project_id,
        "completed": False
    }
    db["tasks"].append(new_task)
    write_db(db)
    return new_task

@app.put("/tasks/{task_id}")
def update_task(task_id: int, task_update: TaskUpdate):
    db = read_db()
    task_found = False
    for t in db["tasks"]:
        if t["id"] == task_id:
            task_found = True
            if task_update.title is not None:
                t["title"] = task_update.title
            if task_update.description is not None: 
                t["description"] = task_update.description
            if task_update.priority is not None:
                t["priority"] = task_update.priority.lower()
            if task_update.due_date is not None:
                t["due_date"] = task_update.due_date
            if task_update.project_id is not None:
                t["project_id"] = task_update.project_id
            if task_update.completed is not None:
                t["completed"] = task_update.completed
            updated_task = t
            break
            
    if not task_found:
        raise HTTPException(status_code=404, detail="Task not found")
        
    write_db(db)
    return updated_task

@app.delete("/tasks/{task_id}", status_code=204)
def delete_task(task_id: int):
    db = read_db()
    initial_len = len(db["tasks"])
    db["tasks"] = [t for t in db["tasks"] if t["id"] != task_id]
    
    if len(db["tasks"]) == initial_len:
        raise HTTPException(status_code=404, detail="Task not found")
        
    write_db(db)
    return {"ok": True}

# --- ALGORITHM ENGINE: SEARCH ENDPOINT ---
@app.get("/tasks/search")
def search_task(title: str = Query(...), algo: str = Query("binary")):
    db = read_db()
    tasks = db["tasks"]
    query = title.strip().lower()

    if algo == "linear":
        for t in tasks:
            if t["title"].lower() == query:
                return t
    else:
        sorted_tasks = sorted(tasks, key=lambda x: x["title"].lower())
        left = 0
        right = len(sorted_tasks) - 1
        
        while left <= right:
            mid = (left + right) // 2
            mid_title = sorted_tasks[mid]["title"].lower()
            
            if mid_title == query:
                return sorted_tasks[mid]
            elif mid_title < query:
                left = mid + 1
            else:
                right = mid - 1

    raise HTTPException(status_code=404, detail=f"Task with title '{title}' not found using {algo} search.")

# --- AI QUICK-ADD PARSING ENDPOINT (GEMINI POWERED) ---
@app.post("/tasks/quick-add", status_code=201)
def ai_quick_add(payload: QuickAddRequest):
    user_input = payload.description.strip()
    
    prompt = f"""
    Analyze the following task request and return a JSON object with keys: 
    - "title": a short clear title for the task (max 5 words)
    - "description": a detailed description or elaboration about this task (expand nicely on what user wrote)
    - "priority": either "high", "medium", or "low"
    - "due_date": estimated timeframe (e.g. "Tomorrow", "Next Friday", "Soon")

    Task request: "{user_input}"
    
    Return ONLY a valid JSON object without any extra text or markdown formatting.
    """
    
    try:
        response = ai_client.models.generate_content(
            model='gemini-3.5-flash',
            contents=prompt,
        )
        
        res_text = response.text.strip()
        if res_text.startswith("```json"):
            res_text = res_text[7:-3].strip()
        elif res_text.startswith("```"):
            res_text = res_text[3:-3].strip()
            
        ai_data = json.loads(res_text)
        
        task_title = ai_data.get("title", user_input)
        task_desc = ai_data.get("description", user_input)
        task_priority = ai_data.get("priority", "medium").lower()
        task_due_date = ai_data.get("due_date", "Soon")
        
    except Exception as e:
        print("Gemini AI Error (Fallback used):", e)
        # Fallback agar AI call fail ho jaye
        task_title = user_input
        task_desc = user_input
        task_priority = "medium"
        task_due_date = "Soon"

    db = read_db()
    new_task = {
        "id": int(os.urandom(4).hex(), 16),
        "title": task_title,
        "description": task_desc,
        "priority": task_priority,
        "due_date": task_due_date,
        "project_id": payload.project_id,
        "completed": False
    }
    
    db["tasks"].append(new_task)
    write_db(db)
    return new_task