# Database Design

## Entity-Relationship Diagram (ERD)

```mermaid
erDiagram
    Location {
        uuid id PK
        string name
        string locationNumber "UNIQUE"
        enum type "Building | Floor | Room"
        string department "nullable"
        int capacity "nullable"
        string[] openDays "nullable"
        time openFrom "nullable"
        time openTo "nullable"
        uuid parentId FK "nullable"
        timestamp createdAt
        timestamp updatedAt
    }

    Booking {
        uuid id PK
        uuid locationId FK
        string department
        int attendees
        timestamp startTime
        timestamp endTime
        timestamp createdAt
        timestamp updatedAt
    }

    Location ||--o{ Location : "parent/children"
    Location ||--o{ Booking : "has"
```

## Description

- **Location**: Represents the hierarchical structure of physical spaces (Building -> Floor -> Room). It uses a standard self-referencing relationship `parentId` to form the tree structure. Only 'Rooms' (Locations without children) are typically considered "bookable".
- **Booking**: Represents a reservation made for a specific `Location`. It enforces business rules validating the department, capacity, and time.
