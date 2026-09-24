#  TaskNest

> A modern full-stack task management application built with FastAPI, PostgreSQL, SQLAlchemy and Vanilla JavaScript.

TaskNest is a full-stack productivity application that allows users to create, view, update, delete, search and filter tasks through a clean and responsive dashboard.

The project was built to understand and demonstrate how a modern frontend communicates with a REST API and persists data in a relational database.

---

## ✨ Features

### 📋 Task Management

- Create new tasks
- View all tasks
- View individual tasks
- Edit existing tasks
- Delete tasks
- Update task status
- Set task priority

### 🔎 Search & Filtering

- Search tasks by title and description
- Filter tasks by priority
- Filter tasks by status
- View all, pending and completed tasks

### 📊 Dashboard

- Total task count
- Pending task count
- Completed task count
- Automatic completion percentage
- Dynamic progress bar

### 🎨 Modern UI

- Responsive dashboard
- Clean SaaS-style interface
- Interactive task cards
- Modal-based task creation and editing
- Toast notifications
- Loading and error states
- Mobile-friendly layout

### 🗄️ Persistent Database

Tasks are stored permanently in PostgreSQL instead of temporary in-memory storage.

---

# 🛠️ Tech Stack

## Frontend

- HTML5
- CSS3
- Vanilla JavaScript
- Fetch API
- Responsive Design

## Backend

- Python
- FastAPI
- Pydantic
- SQLAlchemy
- REST API

## Database

- PostgreSQL
- Psycopg

## Development Tools

- VS Code
- Git
- GitHub
- Postman
- pgAdmin

---

# 🏗️ Architecture

```text
                    ┌─────────────────────┐
                    │      Browser        │
                    │                     │
                    │  HTML / CSS / JS    │
                    └──────────┬──────────┘
                               │
                         HTTP / JSON
                               │
                               ▼
                    ┌─────────────────────┐
                    │       FastAPI       │
                    │                     │
                    │    REST API Layer   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     Pydantic        │
                    │      Validation     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     SQLAlchemy      │
                    │       ORM           │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      Psycopg        │
                    │ PostgreSQL Driver   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │     PostgreSQL      │
                    │                     │
                    │     tasks table     │
                    └─────────────────────┘