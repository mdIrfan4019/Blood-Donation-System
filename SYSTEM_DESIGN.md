# System Design Documentation - Drop4Life 🩸

This document outlines the technical architecture, data models, and interaction patterns of the Drop4Life Blood Donation Management System.

---

## 🏗️ 1. High-Level System Architecture

Drop4Life follows a **distributed microservice-inspired architecture** with a centralized data store.

### Component Diagram
```mermaid
graph TD
    subgraph Client_Layer [Frontend: React 19]
        SPA[Single Page Application]
        Redux[Redux Toolkit State]
        Axios[API Client]
    end

    subgraph Service_Layer [Backend Services]
        NodeAPI[Express.js Server]
        AuthSvc[JWT Auth Middleware]
        AIPredict[Python Flask AI Service]
    end

    subgraph Data_Layer [Database: MongoDB Atlas]
        Users[(User Collection)]
        MedData[(Medical Collections)]
        Logistics[(Inventory & Camps)]
    end

    subgraph External_Layer [Infrastructure]
        Mail[Nodemailer / SMTP]
        Cloud[Render/Vercel Hosting]
    end

    SPA <--> Redux
    Redux <--> Axios
    Axios <--> AuthSvc
    AuthSvc <--> NodeAPI
    NodeAPI <--> AIPredict
    NodeAPI <--> Data_Layer
    NodeAPI --> Mail
```

---

## 📊 2. Entity-Relationship (ER) Diagram

The system uses a NoSQL approach (MongoDB) but maintains strong relational integrity through Mongoose `ObjectId` references.

```mermaid
erDiagram
    USER ||--o| DONOR-PROFILE : "is a"
    USER ||--o| HOSPITAL-PROFILE : "is a"
    USER ||--o{ USER : "manages (staff)"
    
    USER ||--o{ DONATION : "donates"
    HOSPITAL-PROFILE ||--o{ DONATION : "collects"
    
    DONATION ||--|| BLOOD-TEST : "undergoes"
    USER ||--o{ BLOOD-TEST : "performs (tester)"
    
    HOSPITAL-PROFILE ||--o{ INVENTORY : "stores"
    
    HOSPITAL-PROFILE ||--o{ CAMP : "organizes"
    
    USER ||--o{ PATIENT : "registers (receptionist/doctor)"
    PATIENT ||--o{ BLOOD-REQUEST : "needs"
    USER ||--o{ BLOOD-REQUEST : "initiates (doctor)"
    HOSPITAL-PROFILE ||--o{ BLOOD-REQUEST : "fulfills"

    USER {
        string name
        string email
        string password
        enum role
        objectId hospitalId
        boolean isBlocked
    }

    DONOR-PROFILE {
        string bloodGroup
        int age
        string district
        object location
    }

    HOSPITAL-PROFILE {
        string licenseNumber
        string hospitalType
        int totalBeds
        object location
    }

    DONATION {
        string bloodGroup
        int units
        enum status
        enum donationType
        object eligibility
    }

    BLOOD-TEST {
        object results
        enum status
        date testedAt
    }

    INVENTORY {
        string bloodGroup
        enum component
        int unitsAvailable
        date expiryDate
    }

    PATIENT {
        string name
        string bloodGroup
        boolean isAssignedBlood
    }

    BLOOD-REQUEST {
        string bloodGroup
        int units
        enum status
    }
```

---

## 🎭 3. Use Case Diagram

This diagram illustrates the primary interactions between different system actors and the platform's core functionalities.

```mermaid
graph TD
    %% Actors
    Donor((Donor))
    HAdmin((Hospital Admin))
    Doctor((Doctor))
    Tester((Lab Tester))
    GAdmin((Global Admin))

    %% Use Cases
    subgraph Core_Functionalities
        UC1(Register / Login)
        UC2(Eligibility Check)
        UC3(Donate Blood)
        UC4(Manage Inventory)
        UC5(Forecast Demand)
        UC6(Organize Camps)
        UC7(Register Patient)
        UC8(Request Blood)
        UC9(Test Blood Safety)
        UC10(Audit Logs)
        UC11(User Moderation)
    end

    %% Relationships
    Donor --> UC1
    Donor --> UC2
    Donor --> UC3
    
    HAdmin --> UC1
    HAdmin --> UC4
    HAdmin --> UC5
    HAdmin --> UC6
    
    Doctor --> UC7
    Doctor --> UC8
    Doctor --> UC4
    
    Tester --> UC9
    
    GAdmin --> UC10
    GAdmin --> UC11
```

---

## 🔄 4. Core Workflow: Blood Lifecycle

1.  **Donation Phase**: A **Donor** registers for a donation at a **Hospital** or **Camp**.
2.  **Screening Phase**: The **Lab Tester** claims the blood bag and performs a series of safety tests (HIV, Hep-B, etc.).
3.  **Inventory Phase**: If results are `safe`, the system atomically updates the **Inventory** for that hospital, increasing the units for the specific blood group.
4.  **Request Phase**: A **Doctor** registers a **Patient** and submits a **Blood Request**.
5.  **Allocation Phase**: If inventory is available, the request is `approved`, units are deducted from inventory, and the patient is marked as `Assigned`.

---

## 🛡️ 5. Security & Access Design

### Authentication
- **Mechanism**: JSON Web Tokens (JWT) stored in secure HttpOnly cookies (client-side) or local storage with standard headers.
- **Session**: Expiring tokens to minimize hijack risk.

### Authorization (RBAC)
- **Donor**: Read-only access to camps, impact stories. Write access to own profile/donations.
- **Hospital Admin**: Full control over hospital workspace, inventory, and staff onboarding.
- **Doctor/Tester**: Restricted access to specific clinical modules (Patient management / Lab testing).
- **Global Admin**: System-wide bypass for moderation and maintenance.

---
© 2026 Drop4Life | Technical Design Specification
