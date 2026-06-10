# SJGroup Assignment 2026 Checklist

## Project Information

**Tech Stack (Required)**

* [x] NestJS
* [x] TypeScript
* [x] TypeORM
* [x] PostgreSQL

---

# Phase 1 - Project Setup

## Repository

* [x] Create GitHub repository
* [x] Create `.gitignore`
* [x] Create `.env`
* [x] Create `.env.example`
* [x] Configure PostgreSQL connection
* [x] Configure TypeORM

## Dependencies

* [x] @nestjs/typeorm
* [x] typeorm
* [x] pg
* [x] @nestjs/config
* [x] class-validator
* [x] class-transformer
* [x] @nestjs/swagger
* [x] swagger-ui-express

---

# Phase 2 - Database Design

## Location Entity

* [x] Create Location entity
* [x] UUID primary key
* [x] name
* [x] locationNumber
* [x] department
* [x] capacity
* [x] openDays
* [x] openFrom
* [x] openTo
* [x] parentId
* [x] createdAt
* [x] updatedAt

## Self-Referencing Relationship

* [x] parent relation
* [x] children relation
* [x] Building → Floor → Room hierarchy

## Booking Entity

* [x] Create Booking entity
* [x] UUID primary key
* [x] locationId
* [x] department
* [x] attendees
* [x] startTime
* [x] endTime
* [x] createdAt
* [x] updatedAt

## Entity Relationship

* [x] Booking belongs to Location
* [x] Foreign key configured

---

# Phase 3 - Location Management

## Module Structure

* [x] LocationsModule
* [x] LocationsController
* [x] LocationsService

## DTOs

* [x] CreateLocationDto
* [x] UpdateLocationDto

## CRUD Endpoints

### Create

* [x] POST /locations

### Read

* [x] GET /locations
* [x] GET /locations/:id

### Update

* [x] PATCH /locations/:id

### Delete

* [x] DELETE /locations/:id

## Validation

* [x] Parent exists before creation
* [x] locationNumber unique
* [x] Parent-child hierarchy valid

## Tree Retrieval

* [x] Return hierarchical structure
* [x] Return children correctly

---

# Phase 4 - Booking Management

## Module Structure

* [x] BookingsModule
* [x] BookingsController
* [x] BookingsService

## DTOs

* [x] CreateBookingDto
* [x] UpdateBookingDto

## CRUD Endpoints

### Create

* [x] POST /bookings

### Read

* [x] GET /bookings
* [x] GET /bookings/:id

### Update

* [x] PATCH /bookings/:id

### Delete

* [x] DELETE /bookings/:id

---

# Phase 5 - Booking Validation Rules

## Rule 1 - Location Validation

* [x] Location exists
* [x] Location is bookable

Example:

* Building ❌
* Floor ❌
* Room ✅

---

## Rule 2 - Department Matching

Required by assignment.

* [x] Booking department matches room department

Example:

```text
Room Department = EFM
Booking Department = EFM
```

Valid.

Example:

```text
Room Department = EFM
Booking Department = FSS
```

Reject.

---

## Rule 3 - Capacity Check

Required by assignment.

* [x] attendees <= capacity

Example:

```text
Capacity = 10
Attendees = 5
```

Valid.

Example:

```text
Capacity = 10
Attendees = 20
```

Reject.

---

## Rule 4 - Time Validation

Required by assignment.

* [x] Validate booking day
* [x] Validate booking start time
* [x] Validate booking end time

Example:

```text
Mon-Fri
09:00-18:00
```

Booking:

```text
Tuesday 10:00
```

Valid.

Booking:

```text
Saturday 10:00
```

Reject.

Booking:

```text
Monday 20:00
```

Reject.

---

# Phase 6 - Exception Handling

Required by assignment.

## Global Exception Filter

* [x] Create HttpExceptionFilter
* [x] Register globally

## Response Format

```json
{
  "statusCode": 400,
  "message": "Department mismatch",
  "timestamp": "...",
  "path": "/bookings"
}
```

---

# Phase 7 - Logging

Required by assignment.

## Service Logging

* [x] Use NestJS Logger

## Request Logging

* [x] Logging Interceptor

Log:

* [x] HTTP method
* [x] Request path
* [x] Response time

## Error Logging

* [x] Validation failures
* [x] Unexpected exceptions

---

# Phase 8 - Validation Pipe

Recommended

## Global Validation

* [x] ValidationPipe configured globally

```ts
whitelist: true
forbidNonWhitelisted: true
transform: true
```

---

# Phase 9 - Swagger

Recommended

## Swagger Setup

* [x] Swagger module configured
* [x] Swagger UI available

Example:

```text
/api/docs
```

## Documentation

* [x] DTOs documented
* [x] Endpoints documented
* [x] Responses documented

---

# Phase 10 - Seed Data

Recommended

## Building A

* [x] Floor 1
* [x] Lobby
* [x] Meeting Room 1
* [x] Meeting Room 2
* [x] Corridor

## Building B

* [x] Floor 5
* [x] Utility Room
* [x] Sanitary Room
* [x] Meeting Toilet
* [x] Genset Room
* [x] Pantry
* [x] Corridor

---

# Phase 11 - Documentation

Required by assignment.

## README

### Project Overview

* [x] Added

### Tech Stack

* [x] Added

### System Design

* [x] Added

### Database Design

* [x] Added

### Setup Guide

* [x] Added

### Environment Variables

* [x] Added

### API Documentation

* [x] Added

---

# System Design Diagram

* [x] Location hierarchy diagram added
* [x] Booking validation flow diagram added

Example:

```text
Create Booking
      |
Location Exists
      |
Department Match
      |
Capacity Check
      |
Time Validation
      |
Booking Created
```

---

# Database Design

## ERD

* [x] ERD created
* [x] ERD added to README

---

# Final Submission Checklist

## Functional Requirements

* [x] Location CRUD works
* [x] Booking CRUD works
* [x] Department validation works
* [x] Capacity validation works
* [x] Time validation works

## Technical Requirements

* [x] NestJS
* [x] TypeORM
* [x] PostgreSQL
* [x] Exception handling
* [x] Logging
* [x] Documentation

## Code Quality

* [x] No hardcoded secrets
* [x] No .env committed
* [x] No unused files
* [x] No TODOs left behind
* [x] Application starts successfully

## Verification

* [x] Fresh install works
* [x] Database migration works
* [x] Swagger works
* [x] README complete

## Submission

* [x] Final review completed
