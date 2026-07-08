# POST /api/tasks

## Feature Overview

This endpoint creates a new annotation task and stores it in MongoDB.

It represents the **Create** operation of CRUD.

---

## Endpoint

POST /api/tasks

---

## Purpose

The purpose of this endpoint is to allow users or administrators to create a new annotation task.

---

## Request Flow

Client
    │
    ▼
Express Route
    │
    ▼
Task Controller
    │
    ▼
Task Service
    │
    ▼
Task Repository
    │
    ▼
MongoDB

---

## Request Body

```json
{
  "title": "Annotate MRI Scan",
  "type": "image",
  "priority": "high",
  "status": "pending",
  "annotationCount": 0,
  "meta": {
    "source": "Hospital A"
  }
}
```

---

## Success Response

HTTP Status

201 Created

Example Response

```json
{
  "_id": "...",
  "title": "Annotate MRI Scan",
  "type": "image",
  "priority": "high",
  "status": "pending",
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

## Files Modified

- backend/src/routes/task.routes.ts
- backend/src/controllers/task.controller.ts
- backend/src/services/task.service.ts
- backend/src/repositories/task.repository.ts
- backend/src/dtos/CreateTaskDto.ts

---

## Key Learning

During this feature, the following architecture was implemented:

- Route handles endpoint registration.
- Controller handles HTTP requests and responses.
- Service contains business logic.
- Repository communicates with MongoDB.
- DTO defines the expected request structure.

This separation of concerns makes the application easier to maintain and extend.