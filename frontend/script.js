// =========================================================
// TASKNEST — FRONTEND JAVASCRIPT
// =========================================================

const API_BASE = "";


// =========================================================
// STATE
// =========================================================

let allTasks = [];

let currentView = "all";

let editingTaskId = null;


// =========================================================
// DOM ELEMENTS
// =========================================================

const taskGrid = document.getElementById("taskGrid");

const loadingState = document.getElementById("loadingState");
const errorState = document.getElementById("errorState");
const emptyState = document.getElementById("emptyState");

const errorMessage = document.getElementById("errorMessage");

const searchInput = document.getElementById("searchInput");
const priorityFilter = document.getElementById("priorityFilter");

const refreshBtn = document.getElementById("refreshBtn");
const retryBtn = document.getElementById("retryBtn");

const openAddModal = document.getElementById("openAddModal");
const emptyAddBtn = document.getElementById("emptyAddBtn");

const modalOverlay = document.getElementById("modalOverlay");
const closeModal = document.getElementById("closeModal");
const cancelModal = document.getElementById("cancelModal");

const taskForm = document.getElementById("taskForm");

const modalTitle = document.getElementById("modalTitle");
const submitTaskBtn = document.getElementById("submitTaskBtn");

const taskTitle = document.getElementById("taskTitle");
const taskDescription = document.getElementById("taskDescription");
const taskPriority = document.getElementById("taskPriority");
const taskStatus = document.getElementById("taskStatus");

const toast = document.getElementById("toast");
const toastTitle = document.getElementById("toastTitle");
const toastMessage = document.getElementById("toastMessage");

const totalTasks = document.getElementById("totalTasks");
const pendingTasks = document.getElementById("pendingTasks");
const completedTasks = document.getElementById("completedTasks");

const progressPercent = document.getElementById("progressPercent");
const progressBar = document.getElementById("progressBar");

const allCount = document.getElementById("allCount");
const pendingCount = document.getElementById("pendingCount");
const completedCount = document.getElementById("completedCount");

const pageTitle = document.getElementById("pageTitle");
const sectionTitle = document.getElementById("sectionTitle");
const taskSubtitle = document.getElementById("taskSubtitle");


// =========================================================
// API HELPER
// =========================================================

async function api(endpoint, options = {}) {

    const response = await fetch(
        `${API_BASE}${endpoint}`,
        {
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            },
            ...options
        }
    );


    if (!response.ok) {

        let errorMessage = "Something went wrong.";

        try {

            const errorData = await response.json();

            errorMessage =
                errorData.detail ||
                errorMessage;

        } catch {

            // Ignore JSON parsing error

        }

        throw new Error(errorMessage);
    }


    return response.json();
}


// =========================================================
// LOAD TASKS
// =========================================================

async function loadTasks() {

    showLoading();

    try {

        const tasks = await api("/tasks");

        allTasks = tasks;

        updateStats();

        renderTasks();

        hideError();

    } catch (error) {

        console.error(error);

        showError(
            "Unable to connect to the TaskNest API. Make sure FastAPI is running."
        );

    }
}


// =========================================================
// UPDATE STATISTICS
// =========================================================

function updateStats() {

    const total = allTasks.length;

    const pending = allTasks.filter(
        task => task.status.toLowerCase() === "pending"
    ).length;

    const completed = allTasks.filter(
        task => task.status.toLowerCase() === "completed"
    ).length;


    let progress = 0;

    if (total > 0) {

        progress = Math.round(
            (completed / total) * 100
        );

    }


    totalTasks.textContent = total;

    pendingTasks.textContent = pending;

    completedTasks.textContent = completed;

    progressPercent.textContent = progress;

    progressBar.style.width = `${progress}%`;


    allCount.textContent = total;

    pendingCount.textContent = pending;

    completedCount.textContent = completed;
}


// =========================================================
// GET FILTERED TASKS
// =========================================================

function getFilteredTasks() {

    let tasks = [...allTasks];


    // -------------------------
    // SIDEBAR VIEW
    // -------------------------

    if (currentView === "pending") {

        tasks = tasks.filter(
            task =>
                task.status.toLowerCase() === "pending"
        );

    }


    if (currentView === "completed") {

        tasks = tasks.filter(
            task =>
                task.status.toLowerCase() === "completed"
        );

    }


    // -------------------------
    // SEARCH
    // -------------------------

    const searchTerm =
        searchInput.value
            .trim()
            .toLowerCase();


    if (searchTerm) {

        tasks = tasks.filter(task => {

            const title =
                task.title.toLowerCase();

            const description =
                task.description.toLowerCase();

            return (
                title.includes(searchTerm) ||
                description.includes(searchTerm)
            );

        });

    }


    // -------------------------
    // PRIORITY
    // -------------------------

    const selectedPriority =
        priorityFilter.value;


    if (selectedPriority) {

        tasks = tasks.filter(
            task =>
                task.priority.toLowerCase() ===
                selectedPriority.toLowerCase()
        );

    }


    return tasks;
}


// =========================================================
// RENDER TASKS
// =========================================================

function renderTasks() {

    const tasks = getFilteredTasks();


    taskGrid.innerHTML = "";


    if (tasks.length === 0) {

        taskGrid.classList.add("hidden");

        emptyState.classList.remove("hidden");

        return;
    }


    emptyState.classList.add("hidden");

    taskGrid.classList.remove("hidden");


    tasks.forEach(
        (task, index) => {

            const card =
                createTaskCard(task);

            card.style.animationDelay =
                `${index * 0.04}s`;

            taskGrid.appendChild(card);

        }
    );
}


// =========================================================
// CREATE TASK CARD
// =========================================================

function createTaskCard(task) {

    const card =
        document.createElement("article");


    const isCompleted =
        task.status.toLowerCase() ===
        "completed";


    card.className =
        `task-card ${isCompleted ? "completed" : ""}`;


    const priorityClass =
        task.priority.toLowerCase();


    const statusText =
        isCompleted
            ? "Completed"
            : "Pending";


    card.innerHTML = `

        <div class="task-top">

            <span class="priority-badge priority-${priorityClass}">
                ${escapeHTML(task.priority)}
            </span>

            <span class="status-badge ${isCompleted ? "completed" : ""}">

                ${isCompleted ? "✓" : "◷"}

                ${statusText}

            </span>

        </div>


        <h3 class="task-title">
            ${escapeHTML(task.title)}
        </h3>


        <p class="task-description">
            ${escapeHTML(task.description)}
        </p>


        <div class="task-footer">

            <span class="task-id">
                TASK #${task.id}
            </span>


            <div class="task-actions">

                <button
                    class="task-action"
                    title="Edit task"
                    data-action="edit"
                    data-id="${task.id}"
                >
                    ✎
                </button>


                <button
                    class="task-action delete"
                    title="Delete task"
                    data-action="delete"
                    data-id="${task.id}"
                >
                    ♢
                </button>

            </div>

        </div>
    `;


    return card;
}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent = value;

    return div.innerHTML;
}


// =========================================================
// OPEN ADD MODAL
// =========================================================

function openCreateModal() {

    editingTaskId = null;


    modalTitle.textContent =
        "Create a new task";


    submitTaskBtn.textContent =
        "Create Task";


    taskForm.reset();


    taskPriority.value =
        "Medium";


    taskStatus.value =
        "Pending";


    modalOverlay.classList.remove(
        "hidden"
    );


    setTimeout(() => {

        taskTitle.focus();

    }, 100);
}


// =========================================================
// OPEN EDIT MODAL
// =========================================================

function openEditModal(taskId) {

    const task =
        allTasks.find(
            task => task.id === taskId
        );


    if (!task) {

        return;

    }


    editingTaskId = taskId;


    modalTitle.textContent =
        "Edit your task";


    submitTaskBtn.textContent =
        "Save Changes";


    taskTitle.value =
        task.title;


    taskDescription.value =
        task.description;


    taskPriority.value =
        task.priority;


    taskStatus.value =
        task.status;


    modalOverlay.classList.remove(
        "hidden"
    );


    setTimeout(() => {

        taskTitle.focus();

    }, 100);
}


// =========================================================
// CLOSE MODAL
// =========================================================

function closeTaskModal() {

    modalOverlay.classList.add(
        "hidden"
    );

    editingTaskId = null;

    taskForm.reset();
}


// =========================================================
// CREATE / UPDATE TASK
// =========================================================

async function saveTask(event) {

    event.preventDefault();


    const title =
        taskTitle.value.trim();

    const description =
        taskDescription.value.trim();

    const priority =
        taskPriority.value;

    const status =
        taskStatus.value;


    if (!title || !description) {

        showToast(
            "Validation",
            "Please fill in all required fields."
        );

        return;
    }


    const taskData = {

        title,
        description,
        priority,
        status

    };


    submitTaskBtn.disabled = true;

    submitTaskBtn.textContent =
        editingTaskId
            ? "Saving..."
            : "Creating...";


    try {

        if (editingTaskId) {

            // -------------------------
            // UPDATE
            // -------------------------

            await api(
                `/tasks/${editingTaskId}`,
                {
                    method: "PATCH",
                    body: JSON.stringify(taskData)
                }
            );


            showToast(
                "Task updated",
                "Your changes have been saved."
            );

        } else {

            // -------------------------
            // CREATE
            // -------------------------

            await api(
                "/tasks",
                {
                    method: "POST",
                    body: JSON.stringify(taskData)
                }
            );


            showToast(
                "Task created",
                "Your new task has been added."
            );
        }


        closeTaskModal();

        await loadTasks();


    } catch (error) {

        console.error(error);

        showToast(
            "Error",
            error.message
        );

    } finally {

        submitTaskBtn.disabled = false;

        submitTaskBtn.textContent =
            editingTaskId
                ? "Save Changes"
                : "Create Task";
    }
}


// =========================================================
// DELETE TASK
// =========================================================

async function deleteTask(taskId) {

    const task =
        allTasks.find(
            task => task.id === taskId
        );


    if (!task) {

        return;

    }


    const confirmed =
        confirm(
            `Delete "${task.title}"?`
        );


    if (!confirmed) {

        return;

    }


    try {

        await api(
            `/tasks/${taskId}`,
            {
                method: "DELETE"
            }
        );


        showToast(
            "Task deleted",
            "The task has been removed."
        );


        await loadTasks();


    } catch (error) {

        console.error(error);

        showToast(
            "Error",
            error.message
        );
    }
}


// =========================================================
// TASK CARD ACTIONS
// =========================================================

taskGrid.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                "[data-action]"
            );


        if (!button) {

            return;

        }


        const action =
            button.dataset.action;


        const taskId =
            Number(button.dataset.id);


        if (action === "edit") {

            openEditModal(taskId);

        }


        if (action === "delete") {

            deleteTask(taskId);

        }

    }
);


// =========================================================
// SIDEBAR NAVIGATION
// =========================================================

document
    .querySelectorAll(".nav-item")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".nav-item")
                    .forEach(item =>
                        item.classList.remove(
                            "active"
                        )
                    );


                button.classList.add(
                    "active"
                );


                currentView =
                    button.dataset.view;


                updateViewText();

                renderTasks();

            }
        );

    });


// =========================================================
// UPDATE PAGE TEXT
// =========================================================

function updateViewText() {

    if (currentView === "all") {

        pageTitle.textContent =
            "Good to see you.";

        sectionTitle.textContent =
            "All Tasks";

        taskSubtitle.textContent =
            "Keep everything organized in one place.";

    }


    if (currentView === "pending") {

        pageTitle.textContent =
            "Things to get done.";

        sectionTitle.textContent =
            "Pending Tasks";

        taskSubtitle.textContent =
            "Focus on what still needs your attention.";

    }


    if (currentView === "completed") {

        pageTitle.textContent =
            "Nice work.";

        sectionTitle.textContent =
            "Completed Tasks";

        taskSubtitle.textContent =
            "Everything you've successfully finished.";

    }

}


// =========================================================
// SEARCH
// =========================================================

searchInput.addEventListener(
    "input",
    () => {

        renderTasks();

    }
);


// =========================================================
// PRIORITY FILTER
// =========================================================

priorityFilter.addEventListener(
    "change",
    () => {

        renderTasks();

    }
);


// =========================================================
// MODAL EVENTS
// =========================================================

openAddModal.addEventListener(
    "click",
    openCreateModal
);


emptyAddBtn.addEventListener(
    "click",
    openCreateModal
);


closeModal.addEventListener(
    "click",
    closeTaskModal
);


cancelModal.addEventListener(
    "click",
    closeTaskModal
);


taskForm.addEventListener(
    "submit",
    saveTask
);


// Close modal by clicking outside

modalOverlay.addEventListener(
    "click",
    event => {

        if (
            event.target ===
            modalOverlay
        ) {

            closeTaskModal();

        }

    }
);


// Close modal with Escape

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            !modalOverlay.classList.contains(
                "hidden"
            )
        ) {

            closeTaskModal();

        }

    }
);


// =========================================================
// REFRESH
// =========================================================

refreshBtn.addEventListener(
    "click",
    async () => {

        refreshBtn.style.pointerEvents =
            "none";


        await loadTasks();


        setTimeout(() => {

            refreshBtn.style.pointerEvents =
                "auto";

        }, 300);

    }
);


// =========================================================
// RETRY
// =========================================================

retryBtn.addEventListener(
    "click",
    loadTasks
);


// =========================================================
// LOADING / ERROR STATES
// =========================================================

function showLoading() {

    loadingState.classList.remove(
        "hidden"
    );

    errorState.classList.add(
        "hidden"
    );

    emptyState.classList.add(
        "hidden"
    );

    taskGrid.classList.add(
        "hidden"
    );
}


function hideLoading() {

    loadingState.classList.add(
        "hidden"
    );
}


function showError(message) {

    hideLoading();

    taskGrid.classList.add(
        "hidden"
    );

    emptyState.classList.add(
        "hidden"
    );

    errorState.classList.remove(
        "hidden"
    );

    errorMessage.textContent =
        message;
}


function hideError() {

    hideLoading();

    errorState.classList.add(
        "hidden"
    );
}


// =========================================================
// TOAST
// =========================================================

let toastTimeout;


function showToast(title, message) {

    toastTitle.textContent =
        title;

    toastMessage.textContent =
        message;


    toast.classList.remove(
        "hidden"
    );


    clearTimeout(toastTimeout);


    toastTimeout =
        setTimeout(
            () => {

                toast.classList.add(
                    "hidden"
                );

            },
            3000
        );
}


// =========================================================
// INITIAL LOAD
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateViewText();

        loadTasks();

    }
);