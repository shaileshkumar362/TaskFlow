// --- Global Fetch Override to Auto-Hide Loader on Error ---
const originalFetch = window.fetch;
window.fetch = async function(...args) {
    try {
        const response = await originalFetch(...args);
        return response;
    } catch (error) {
        hideLoader();
        throw error;
    }
};

const API_BASE = "http://127.0.0.1:8000";

document.addEventListener("DOMContentLoaded", () => {
    // LocalStorage Cache First Rendering
    const cachedTasks = localStorage.getItem("taskflow_cache");
    if (cachedTasks) {
        renderTasks(JSON.parse(cachedTasks));
    }

    loadProjects();
    loadTasks();

    // Event Listeners
    document.getElementById("createProjectBtn").addEventListener("click", handleCreateProject);
    document.getElementById("addTaskBtn").addEventListener("click", handleAddOrUpdateTask);
    document.getElementById("cancelEditBtn").addEventListener("click", resetTaskForm);
    document.getElementById("addWithAiBtn").addEventListener("click", handleQuickAddAI);
    document.getElementById("applySortBtn").addEventListener("click", handleApplySort);
    document.getElementById("searchBtn").addEventListener("click", handleRunSearch);
    document.getElementById("resetViewBtn").addEventListener("click", () => loadTasks());
    document.getElementById("themeToggleBtn").addEventListener("click", toggleTheme);

    // Bulk / Selected Delete Event Listener
    const bulkDeleteBtn = document.getElementById("bulk-delete-btn");
    if (bulkDeleteBtn) {
        bulkDeleteBtn.addEventListener("click", handleBulkDelete);
    }
});

// --- LOADER HELPER FUNCTIONS ---
function showLoader() {
    const spinner = document.getElementById("loadingSpinner");
    if (spinner) spinner.style.display = "block";
}

function hideLoader() {
    const spinner = document.getElementById("loadingSpinner");
    if (spinner) spinner.style.display = "none";
}

// --- FETCH & LOAD DATA ---
async function loadProjects() {
    showLoader();
    try {
        let res = await fetch(`${API_BASE}/projects`);
        let projects = await res.json();
        
        if (projects.length === 0) {
            await autoBootstrapDefaultProject();
            res = await fetch(`${API_BASE}/projects`);
            projects = await res.json();
        }

        const projectSelects = [document.getElementById("taskProjectSelect"), document.getElementById("aiProjectSelect")];
        projectSelects.forEach(select => {
            if (!select) return;
            select.innerHTML = '<option value="">Select...</option>';
            projects.forEach(p => {
                const opt = document.createElement("option");
                opt.value = p.id;
                opt.textContent = p.name;
                select.appendChild(opt);
            });
        });
    } catch (err) {
        console.error("Error loading projects:", err);
    } finally {
        hideLoader();
    }
}

async function autoBootstrapDefaultProject() {
    try {
        let userRes = await fetch(`${API_BASE}/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "ops@blinkit.com", name: "Blinkit Ops" })
        });
        let user = await userRes.json();
        let userId = user.id || 1;

        await fetch(`${API_BASE}/projects`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: "Dark Store Ops", owner_id: userId })
        });
    } catch (e) {
        console.log("Bootstrap notice:", e);
    }
}

async function loadTasks(endpoint = `${API_BASE}/tasks`) {
    showLoader();
    try {
        const res = await fetch(endpoint);
        const tasks = await res.json();
        localStorage.setItem("taskflow_cache", JSON.stringify(tasks));
        renderTasks(tasks);
    } catch (err) {
        console.error("Error loading tasks:", err);
    } finally {
        hideLoader();
    }
}

// --- PROFESSIONAL TASK RENDERING ---
function renderTasks(tasks) {
    const container = document.getElementById("tasksContainer");
    if (!container) return;
    container.innerHTML = "";

    if (!tasks || tasks.length === 0) {
        const p = document.createElement("p");
        p.className = "no-tasks";
        p.style.color = "var(--text-muted)";
        p.textContent = "No tasks created yet.";
        container.appendChild(p);
        updateSelectionBar();
        return;
    }

    tasks.forEach(task => {
        const item = document.createElement("div");
        item.className = "task-item";
        
        if (task.completed) {
            item.classList.add("completed-task");
            item.style.backgroundColor = "#1e3d2f";
        }

        const leftWrapper = document.createElement("div");
        leftWrapper.style.display = "flex";
        leftWrapper.style.alignItems = "center";
        leftWrapper.style.gap = "12px";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "task-checkbox";          
        checkbox.dataset.id = task.id;          
        checkbox.checked = false; 
        checkbox.style.width = "18px";
        checkbox.style.height = "18px";
        checkbox.style.cursor = "pointer";

        checkbox.addEventListener("change", () => {
            updateSelectionBar();
        });

        const infoDiv = document.createElement("div");
        infoDiv.className = "task-info";

        const h4 = document.createElement("h4");
        h4.textContent = task.title;

        let descP = null;
        if (task.description) {
            descP = document.createElement("p");
            descP.textContent = task.description;
            descP.style.fontSize = "0.85rem";
            descP.style.color = "var(--text-muted)";
            descP.style.marginTop = "3px";
            descP.style.marginBottom = "3px";
        }

        const metaDiv = document.createElement("div");
        metaDiv.className = "task-meta";
        
        const prioritySpan = document.createElement("span");
        prioritySpan.textContent = `Priority: ${task.priority}`;
        
        const dateSpan = document.createElement("span");
        dateSpan.textContent = `Date: ${task.due_date || 'None'}`;

        metaDiv.appendChild(prioritySpan);
        metaDiv.appendChild(dateSpan);
        
        infoDiv.appendChild(h4);
        if (descP) infoDiv.appendChild(descP);
        infoDiv.appendChild(metaDiv);

        leftWrapper.appendChild(checkbox);
        leftWrapper.appendChild(infoDiv);

        const actionsDiv = document.createElement("div");
        actionsDiv.className = "task-actions";
        actionsDiv.style.display = "flex";
        actionsDiv.style.gap = "8px";
        actionsDiv.style.alignItems = "center";

        const completeBtn = document.createElement("button");
        completeBtn.textContent = task.completed ? "Completed" : "Complete";
        completeBtn.style.backgroundColor = task.completed ? "#555" : "#06d417";
        completeBtn.style.color = "#ffffff";
        completeBtn.style.border = "none";
        completeBtn.style.padding = "6px 12px";
        completeBtn.style.borderRadius = "4px";
        completeBtn.style.cursor = task.completed ? "default" : "pointer";
        completeBtn.style.fontSize = "0.8rem";
        completeBtn.style.fontWeight = "600";
        if (task.completed) {
            completeBtn.disabled = true;
        }
        
        completeBtn.addEventListener("click", async () => {
            showLoader();
            try {
                const res = await fetch(`${API_BASE}/tasks/${task.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: task.title,
                        description: task.description || "",
                        priority: task.priority,
                        due_date: task.due_date,
                        project_id: task.project_id,
                        completed: true
                    })
                });

                if (res.ok) {
                    task.completed = true;
                    loadTasks(); 
                }
            } catch (err) {
                console.error("Error completing task:", err);
            } finally {
                hideLoader();
            }
        });

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.style.backgroundColor = "#3b82f6";
        editBtn.style.color = "#ffffff";
        editBtn.style.border = "none";
        editBtn.style.padding = "6px 12px";
        editBtn.style.borderRadius = "4px";
        editBtn.style.cursor = "pointer";
        editBtn.style.fontSize = "0.8rem";
        editBtn.style.fontWeight = "600";
        
        editBtn.addEventListener("click", async () => {
            try {
                if (task.completed) {
                    task.completed = false;
                    showLoader();
                    await fetch(`${API_BASE}/tasks/${task.id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            title: task.title,
                            description: task.description || "",
                            priority: task.priority,
                            due_date: task.due_date,
                            project_id: task.project_id,
                            completed: false
                        })
                    });
                    hideLoader();
                    loadTasks();
                }
                populateEditForm(task);
            } catch (err) {
                console.error("Error on edit click:", err);
                hideLoader();
                populateEditForm(task);
            }
        });

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.style.backgroundColor = "#ef4444";
        deleteBtn.style.color = "#ffffff";
        deleteBtn.style.border = "none";
        deleteBtn.style.padding = "6px 12px";
        deleteBtn.style.borderRadius = "4px";
        deleteBtn.style.cursor = "pointer";
        deleteBtn.style.fontSize = "0.8rem";
        deleteBtn.style.fontWeight = "600";
        deleteBtn.addEventListener("click", () => deleteTask(task.id));

        actionsDiv.appendChild(completeBtn);
        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);

        item.appendChild(leftWrapper);
        item.appendChild(actionsDiv);
        container.appendChild(item);
    });

    updateSelectionBar();
}

function updateSelectionBar() {
    const checkedBoxes = document.querySelectorAll(".task-checkbox:checked");
    const allDeleteButtons = document.querySelectorAll(".task-item button:last-child"); 
    const actionBar = document.getElementById("selection-action-bar");
    const countSpan = document.getElementById("selected-count");

    if (checkedBoxes.length > 0) {
        if (actionBar) actionBar.style.display = "flex";
        if (countSpan) {
            countSpan.textContent = `${checkedBoxes.length} item${checkedBoxes.length > 1 ? 's' : ''} selected`;
        }

        allDeleteButtons.forEach(btn => {
            if (btn.textContent === "Delete") {
                btn.disabled = true;
                btn.style.opacity = "0.3";
                btn.style.cursor = "not-allowed";
            }
        });
    } else {
        if (actionBar) actionBar.style.display = "none";

        allDeleteButtons.forEach(btn => {
            if (btn.textContent === "Delete") {
                btn.disabled = false;
                btn.style.opacity = "1";
                btn.style.cursor = "pointer";
            }
        });
    }
}

async function handleBulkDelete() {
    const checkedBoxes = document.querySelectorAll(".task-checkbox:checked");
    
    if (checkedBoxes.length === 0) {
        alert("Please select at least one task using the checkbox.");
        return;
    }

    if (!confirm(`Are you sure you want to delete ${checkedBoxes.length} selected task(s)?`)) return;

    showLoader();
    try {
        const deletePromises = Array.from(checkedBoxes).map(cb => {
            const taskId = cb.dataset.id;
            return fetch(`${API_BASE}/tasks/${taskId}`, { method: "DELETE" });
        });

        await Promise.all(deletePromises);
        loadTasks(); 
    } catch (err) {
        console.error("Error during bulk delete:", err);
        alert("Failed to delete some tasks.");
        hideLoader();
    }
}

async function handleCreateProject() {
    const nameInput = document.getElementById("projectName");
    const name = nameInput.value.trim();
    if (!name) return alert("Please enter a project name.");

    showLoader();
    try {
        const userRes = await fetch(`${API_BASE}/users`);
        const users = await userRes.json();
        const userId = users.length > 0 ? users[0].id : 1;

        const res = await fetch(`${API_BASE}/projects`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: name, owner_id: userId })
        });

        if (res.ok) {
            nameInput.value = "";
            loadProjects();
            alert("Project created successfully!");
        } else {
            alert("Failed to create project.");
            hideLoader();
        }
    } catch (err) {
        console.error(err);
        hideLoader();
    }
}

async function handleAddOrUpdateTask(e) {
    e.preventDefault();
    const titleInput = document.getElementById("taskTitle");
    const descInput = document.getElementById("taskDescription");
    const dateInput = document.getElementById("taskDate");
    const prioritySelect = document.getElementById("taskPriority");
    const projectSelect = document.getElementById("taskProjectSelect");
    const editingIdInput = document.getElementById("editingTaskId");

    const title = titleInput.value.trim();
    if (!title) {
        alert("Title cannot be empty!");
        return;
    }

    const editingId = editingIdInput.value;

    const taskData = {
        title: title,
        description: descInput ? descInput.value.trim() : "",
        priority: prioritySelect.value,
        due_date: dateInput.value || null,
        project_id: parseInt(projectSelect.value),
        completed: false
    };

    if (!taskData.project_id) {
        alert("Please select a project.");
        return;
    }

    let url = `${API_BASE}/tasks`;
    let method = "POST";

    if (editingId) {
        url = `${API_BASE}/tasks/${editingId}`;
        method = "PUT";
    }

    showLoader();
    try {
        const res = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(taskData)
        });

        if (res.ok) {
            resetTaskForm();
            loadTasks();
        } else {
            const errData = await res.json();
            alert(`Error: ${JSON.stringify(errData.detail || errData)}`);
            hideLoader();
        }
    } catch (err) {
        console.error(err);
        hideLoader();
    }
}

function populateEditForm(task) {
    document.getElementById("editingTaskId").value = task.id;
    document.getElementById("taskTitle").value = task.title;
    const descField = document.getElementById("taskDescription");
    if (descField) descField.value = task.description || "";
    document.getElementById("taskDate").value = task.due_date || "";
    document.getElementById("taskPriority").value = task.priority;
    document.getElementById("taskProjectSelect").value = task.project_id;
    document.getElementById("formTitleHeading").textContent = "EDIT TASK";
    document.getElementById("addTaskBtn").textContent = "Update Task";
    document.getElementById("cancelEditBtn").style.display = "inline-block";
}

function resetTaskForm() {
    document.getElementById("editingTaskId").value = "";
    document.getElementById("taskTitle").value = "";
    const descField = document.getElementById("taskDescription");
    if (descField) descField.value = "";
    document.getElementById("taskDate").value = "";
    document.getElementById("taskPriority").value = "medium";
    document.getElementById("formTitleHeading").textContent = "ADD TASK MANUALLY";
    document.getElementById("addTaskBtn").textContent = "Add Task";
    document.getElementById("cancelEditBtn").style.display = "none";
}

async function deleteTask(id) {
    if (!confirm("Are you sure you want to delete this task?")) return;
    showLoader();
    try {
        const res = await fetch(`${API_BASE}/tasks/${id}`, { method: "DELETE" });
        if (res.ok) {
            loadTasks();
        } else {
            hideLoader();
        }
    } catch (err) {
        console.error(err);
        hideLoader();
    }
}

async function handleQuickAddAI() {
    const descInput = document.getElementById("aiTaskDesc");
    const projectSelect = document.getElementById("aiProjectSelect");

    const description = descInput.value.trim();
    const project_id = parseInt(projectSelect.value);

    if (!description) return alert("Please enter a task description for AI Quick Add.");
    if (!project_id) return alert("Please select a project.");

    showLoader();
    try {
        const res = await fetch(`${API_BASE}/tasks/quick-add`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ description, project_id })
        });

        if (res.ok) {
            descInput.value = "";
            loadTasks();
            alert("Task successfully added via AI Quick-Add!");
        } else {
            const err = await res.json();
            alert(`Quick-Add failed: ${JSON.stringify(err.detail)}`);
            hideLoader();
        }
    } catch (err) {
        console.error(err);
        hideLoader();
    }
}

function handleApplySort() {
    const sortVal = document.getElementById("sortSelect").value;
    if (sortVal === "priority") {
        loadTasks(`${API_BASE}/tasks?sort=priority`);
    } else {
        loadTasks();
    }
}

async function handleRunSearch() {
    const title = document.getElementById("searchTitleInput").value.trim();
    const algo = document.getElementById("searchAlgoSelect").value;

    if (!title) return alert("Please enter exact title to search.");

    showLoader();
    try {
        const res = await fetch(`${API_BASE}/tasks/search?title=${encodeURIComponent(title)}&algo=${algo}`);
        if (res.ok) {
            const task = await res.json();
            renderTasks([task]);
        } else {
            alert("Task not found with exact title.");
            renderTasks([]);
        }
    } catch (err) {
        console.error(err);
    } finally {
        hideLoader();
    }
}

function toggleTheme() {
    const body = document.body;
    body.classList.toggle("dark-mode");
    const btn = document.getElementById("themeToggleBtn");
    if (body.classList.contains("dark-mode")) {
        btn.textContent = "☀️ Light";
    } else {
        btn.textContent = "🌙 Dark";
    }
}