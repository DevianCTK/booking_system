# SJGroup Assignment 2026

## Project Overview

This is a backend RESTful API built for SJGroup to manage physical location hierarchies (Building -> Floor -> Room) and bookable rooms. It incorporates strict business rules for validating bookings such as matching departments, respecting room capacities, and open-hour constraints.

## Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Validation**: `class-validator`, `class-transformer`
- **Documentation**: Swagger

---

## Prerequisites

Before running this project, ensure you have the following installed on your machine:

* **Node.js 20+**
* **npm** (comes with Node.js)
* **PostgreSQL 15+** (or compatible version)

> **Note**: A PostgreSQL instance must be installed and running locally before starting the application.

---

## Database Setup

The application will create and synchronize the tables automatically using TypeORM, but the PostgreSQL database itself must be created beforehand.

Open your PostgreSQL command line (or a GUI like pgAdmin/DBeaver) and run:

```sql
CREATE DATABASE sj_assignment;
```

---

## Environment Variables

The repository includes a `.env.example` file that can be copied and modified for local development. All of the variables listed below are required to connect to the database.

Below is an example configuration:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=sj_assignment
```

## Quick Start

You can use the following commands to get the application up and running quickly:

```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables (Update the .env file with your DB credentials)
cp .env.example .env

# 3. Start the application (This automatically synchronizes the DB schema)
npm run start:dev

# 4. In a separate terminal, seed the sample data (Building A & B)
npm run seed
```

*(If you are on Windows PowerShell, you can manually copy `.env.example` to `.env` instead of using `cp`)*.

---

## Swagger Documentation

All APIs are fully documented and can be tested interactively through the Swagger UI. 

Once the application is running, open your web browser and navigate to:

```text
http://localhost:3000/api/docs
```

---

## System Design

The system enforces a hierarchical Location tree. Bookings are associated with a Location, but only leaf nodes (Rooms) without children are bookable. 

### Booking Validation Flow
```
Create Booking Request
      |
Location Exists? (404 Not Found)
      |
Location Bookable? (Must have no sub-locations)
      |
Department Match? (400 Bad Request)
      |
Capacity Check? (400 Bad Request)
      |
Time Validation? (400 Bad Request)
      |
Booking Created (201 Created)
```

## Database Design

See `docs/database-design.md` for the Entity-Relationship Diagram.
