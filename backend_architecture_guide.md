# Backend Architecture & Database Design: Child Investigation System

This document outlines the scalable backend blueprint for the **Child Investigation System (CIS)**. The system is engineered using a modern Node.js + Express framework paired with a MongoDB database, strictly adhering to the MVC (Model-View-Controller) design pattern.

---

## 🏗️ 1. Backend Architecture

**Architecture Style:** Modular RESTful API
**Stack:** Node.js, Express.js, MongoDB (Mongoose), JWT, Multer

**Separation of Concerns (Layers):**
*   **Routes (`/routes`):** Defines API endpoints and maps them to controllers.
*   **Controllers (`/controllers`):** Handles incoming HTTP requests, extracts parameters, and formulates responses (Status Codes, JSON).
*   **Services (`/services`):** Heart of the system. Contains all reusable core business logic (e.g., auto-priority calculations, assignment algorithms).
*   **Models (`/models`):** Mongoose schemas defining MongoDB collections.
*   **Middleware (`/middleware`):** Interceptors for JWT verification, Role-Based Access Control (RBAC), and File Upload (Multer) handling.

### Clean Folder Structure (Node.js)

```text
child-investigation-backend/
├── config/             # Database connection, env variables
│   └── db.js
├── controllers/        # Request handlers
│   ├── authController.js
│   ├── caseController.js
│   ├── noteController.js
│   └── adminController.js
├── middleware/         # Custom interceptors
│   ├── auth.js         # JWT verification & RBAC check
│   ├── upload.js       # Multer configuration
│   └── errorHandler.js 
├── models/             # Mongoose schemas
│   ├── User.js
│   ├── Case.js
│   ├── Evidence.js
│   ├── Note.js
│   └── AuditLog.js
├── routes/             # API Endpoints
│   ├── authRoutes.js
│   ├── caseRoutes.js
│   ├── evidenceRoutes.js
│   └── adminRoutes.js
├── services/           # Reusable core logic
│   ├── priorityService.js  # Calculates High/Med/Low
│   └── assignService.js    # Load balancing logic
├── uploads/            # Local storage for evidence files
├── .env                # Environment variables (JWT_SECRET, MONGO_URI)
└── server.js           # Express app entry point
```

---

## 🔒 2. Authentication & Authorization

The system utilizes **Stateless JWT (JSON Web Tokens)**.

**Flow:**
1. User logs in via `/api/auth/login`.
2. Server verifies hashed password (bcrypt) and generates a JWT payload enclosing the user's `id` and `role` (Admin/Investigator/Public).
3. The token is sent to the client and stored (e.g., HTTP-only cookies or local storage).
4. For protected routes, the client sends the token in the `Authorization: Bearer <token>` header.
5. The `auth.js` middleware parses the token and asserts role permissions.

---

## 🗄️ 3. Database Design (MongoDB Collections)

### A. Users (`users`)
```javascript
{
  _id: ObjectId,
  name: { type: String, required: true },
  email: { type: String, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true }, // Hashed
  role: { type: String, enum: ['admin', 'investigator', 'public'], default: 'public' },
  activeCasesCount: { type: Number, default: 0 }, // For load balancing
  createdAt: Date
}
```

### B. Cases (`cases`)
```javascript
{
  _id: ObjectId,
  caseId: { type: String, unique: true }, // e.g., CIS-2026-0031
  childDetails: {
    name: String,
    age: Number,
    gender: String
  },
  location: String,
  incidentDescription: String,
  priority: { type: String, enum: ['High', 'Medium', 'Low'] },
  status: { type: String, enum: ['Submitted', 'Evidence Verified', 'In Progress', 'Closed'], default: 'Submitted' },
  assignedInvestigator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: Date,
  updatedAt: Date
}
```

### C. Evidence (`evidence`)
```javascript
{
  _id: ObjectId,
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  fileUrl: String,   // Local /uploads path or S3 bucket URL
  fileType: String,  // 'image', 'video', 'document'
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now }
}
```

### D. Notes (`notes`)
```javascript
{
  _id: ObjectId,
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text: { type: String, required: true },
  visibility: { type: String, enum: ['private', 'public'], default: 'private' },
  timestamp: { type: Date, default: Date.now }
}
```

### E. Logs (`audit_logs`)
```javascript
{
  _id: ObjectId,
  caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Case' },
  action: { type: String, required: true }, // e.g., 'Status Updated to Closed'
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now }
}
```

---

## ⚙️ 4. Core Business Logic Definitions

*   **Case ID Generation:** Auto-increment logic combined with the current year (e.g., `CIS-2026-0001`). Managed inside a Mongoose `pre('save')` hook.
*   **Auto Priority Detection (`priorityService.js`):**
    *   If `age < 12` OR `description` contains `["abuse", "trafficking", "labor"]` → **High**.
    *   If `age < 16` and keywords match `["missing", "lost"]` → **Medium**.
    *   Else → **Low**.
*   **Investigator Load Balancer (`assignService.js`):**
    *   Queries `Users` where `role=investigator`.
    *   Sorts by `activeCasesCount` ASC to find the investigator with the lightest workload.
*   **Legal Compliance Check:**
    *   When PUT `/api/cases/:id/status` has payload `status: Closed`:
    *   Query `Evidence` count for `caseId`. Query `Notes` count for `caseId` where `author=investigator`.
    *   If either is `0`, throw `400 Bad Request: Missing mandatory evidence or closing notes.`

---

## 🌐 5. API Endpoint Structure

### Auth Routes
*   `POST /api/auth/login` - Authenticate and return JWT.
*   `POST /api/auth/register` - Register a new Public User.

### Case Routes
*   `POST /api/cases` - Submit a new complaint (Auto-generates Priority & ID).
*   `GET /api/cases` - Fetch cases (Filters applied via query params).
*   `GET /api/cases/:id` - Fetch singular case details (Populates Evidence/Notes).
*   `PUT /api/cases/:id/status` - Update status (Runs compliance check).

### Notes Routes
*   `POST /api/notes` - Add a note to a case.
*   `GET /api/notes/:caseId` - Retrieve notes for a case (Hides 'private' notes if user is Public).

### Evidence Routes
*   `POST /api/evidence/upload` - Upload file via `multipart/form-data`.
*   `GET /api/evidence/:caseId` - Retrieve metadata for uploaded evidence.

### Admin Routes (Protected: Admin Only)
*   `POST /api/admin/assign` - Assign an investigator to a case ID (Updates active counts).
*   `GET /api/admin/dashboard` - Retrieve system-wide stats (Total, Open, Closed).
*   `GET /api/admin/audit-logs` - Retrieve master activity trail.

---

## 💾 6. File Upload Strategy
*   Utilize **Multer** initialized in `/middleware/upload.js`.
*   **Constraints:** Reject files > `5MB`. Accepted MIME types: `image/png`, `image/jpeg`, `application/pdf`, `video/mp4`.
*   Store binaries locally in the `/uploads/` root folder.
*   Save the relative path `/uploads/16284...-evidence.jpg` inside the `Evidence` collection.

---

## 🛡️ 7. Security & Scalability

1.  **Input Validation:** Use `Joi` or `express-validator` to ensure all incoming data types match expectations before hitting controllers.
2.  **NoSQL Injection:** Mongoose automatically sanitizes inputs by strictly enforcing defined schema types.
3.  **Error Handling:** Implement a global `errorHandler.js` middleware at the end of the Express stack to catch and format API errors cleanly `{"error": "Message"}`.
4.  **Microservices Readiness:** The Service Layer logic (`priorityService.js`) can easily be detached into a separate container or replaced with a Python AI model endpoint in the future without touching the core routing structure.
