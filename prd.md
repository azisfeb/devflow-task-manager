# Project DevFlow: Developer Task Manager

## 1. Executive Summary

DevFlow is a high-performance, real-time task management application tailored for software developers. Unlike generic to-do lists, DevFlow categorizes tasks by active development projects, allowing for better context management and focus during daily coding sessions.

---

## 2. User Stories

- **Project Context:** As a developer, I want to toggle between different project workspaces so I only see tasks relevant to the code I'm currently writing.
- **Frictionless Auth:** As a user, I want to sign in quickly using my GitHub or Google account via Clerk.
- **Live Updates:** As a multi-device user, I want my task status to sync instantly across all devices without manual refreshing.
- **Efficiency:** As a power user, I want a clean UI that doesn't get in the way of my IDE.

---

## 3. Tech Stack

| Layer | Technology | Description |
| --- | --- | --- |
| Frontend | Next.js 14+ (App Router) | Framework for SSR and optimized routing. |
| Auth | Clerk | Managed authentication (GitHub/Google SSO). |
| Styling | Tailwind CSS | Utility-first CSS for rapid UI development. |
| UI Components | shadcn/ui | Accessible, customizable components (Context7 style). |
| Backend/DB | Convex | Real-time cloud database and serverless functions. |
| Environment | Docker | Containerized local development environment. |
| Deployment | Vercel | Production hosting and CI/CD. |

---

## 4. Functional Requirements

### 4.1 Authentication & Profile

- **Secure Login:** Integration with Clerk for GitHub-based authentication.
- **User Session:** Persistent login state managed via Clerk middleware.

### 4.2 Project Management

- **Workspaces:** Create, Rename, and Delete project containers.
- **Project Metadata:** Assign icons or colors to projects for quick visual identification.

### 4.3 Task Management (CRUD)

- **Real-time Tasks:** Add tasks to specific projects with instant database persistence.
- **Status Toggling:** Mark tasks as `Pending`, `In Progress`, or `Completed`.
- **Priority Tagging:** Assign `High`, `Medium`, or `Low` priority levels.
- **Context Filtering:** View "All Tasks" or filter by a specific project.

### 4.4 Technical Requirements

- **Dockerization:** A `Dockerfile` and `docker-compose.yml` to mirror the development environment.
- **Type Safety:** Full TypeScript implementation across frontend and Convex functions.

---

## 5. Data Model (Convex Schema)

### `users` *(Managed by Clerk/Convex Sync)*

| Field | Type |
| --- | --- |
| `tokenIdentifier` | `string` (unique Clerk ID) |
| `name` | `string` |
| `email` | `string` |

### `projects`

| Field | Type |
| --- | --- |
| `userId` | `id` (owner) |
| `name` | `string` |
| `color` | `string` |

### `tasks`

| Field | Type |
| --- | --- |
| `projectId` | `id` |
| `userId` | `id` |
| `text` | `string` |
| `isCompleted` | `boolean` |
| `priority` | `"low"` \| `"med"` \| `"high"` |

---

## 6. UI/UX Design (Context7 Guidelines)

- **Theme:** "Deep Space" Dark Mode (Slate/Zinc palette).
- **Navigation:** Collapsible Sidebar (Left) for Project list; Main Content (Right) for Task list.
- **Interactions:** Use shadcn Command Palette (`Cmd + K`) for quick task creation.
- **Responsiveness:** Mobile-friendly for checking tasks on the go.

---

## 7. Deployment & DevOps

- **Local Dev:** `docker-compose up` to start the Next.js environment.
- **Backend:** Convex dev server handles automatic schema migrations.
- **Production:**
  - *Frontend:* Vercel (Auto-deploy on `git push`).
  - *Backend:* Convex Production deployment.
  - *Auth:* Clerk Production environment.
