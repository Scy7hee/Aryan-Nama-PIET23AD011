# AVGear — College AV Room Equipment Manager

AVGear is a web-based equipment lending management system designed for a college AV room.

It replaces the traditional paper-register approach with a centralized system for managing equipment, borrowing, availability, returns, deposits, late fees, and active loan transfers.

## Features

* Equipment inventory management
* Multiple units for each equipment type
* Equipment availability checking for a selected date range
* Borrowing and loan tracking
* Prevention of borrowing unavailable equipment
* Maximum 5 active units per borrower
* Security deposit tracking
* Automatic late-fee calculation
* Refund calculation after deducting late fees
* Return processing
* Due-soon and overdue dashboard information
* Transfer of an active loan to another borrower
* Original due date is preserved during loan transfer
* Persistent data storage using Supabase PostgreSQL

## Equipment Supported

The initial inventory contains:

* DSLR Camera
* Projector
* Microphone
* Tripod

Each equipment type can have multiple physical units.

## Tech Stack

### Frontend

* React
* Vite
* JavaScript
* CSS

### Backend / Database

* Supabase
* PostgreSQL

### Development

* ESLint
* Git
* GitHub Codespaces

## Application Structure

```text
src/
├── components/
│   ├── Header.jsx
│   ├── Sidebar.jsx
│   └── StatCard.jsx
│
├── context/
│   └── AppContext.jsx
│
├── lib/
│   └── supabase.js
│
├── pages/
│   ├── Dashboard.jsx
│   ├── Equipment.jsx
│   ├── Borrow.jsx
│   ├── Availability.jsx
│   └── Returns.jsx
│
├── App.jsx
├── main.jsx
└── index.css
```

## Database Structure

The application uses two main PostgreSQL tables.

### `equipment`

Stores information about available equipment.

| Column             | Description                    |
| ------------------ | ------------------------------ |
| `id`               | Unique equipment ID            |
| `name`             | Equipment name                 |
| `total_units`      | Total number of physical units |
| `late_fee_per_day` | Late fee charged per day       |

### `loans`

Stores borrowing and return information.

| Column         | Description              |
| -------------- | ------------------------ |
| `id`           | Unique loan ID           |
| `borrower`     | Current borrower         |
| `equipment_id` | Borrowed equipment       |
| `quantity`     | Number of units borrowed |
| `borrow_date`  | Borrowing date           |
| `due_date`     | Expected return date     |
| `return_date`  | Actual return date       |
| `deposit`      | Security deposit         |
| `late_days`    | Number of late days      |
| `late_fee`     | Calculated late fee      |
| `refund`       | Final refundable amount  |
| `status`       | `active` or `returned`   |

## Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd <project-folder>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Do not commit the `.env` file to GitHub.

### 4. Start the development server

```bash
npm run dev
```

The application will be available at the local Vite development URL.

## Build for Production

To create a production build:

```bash
npm run build
```

## Debugging

If the application does not load data:

1. Check that the Supabase URL is correct.
2. Check that the publishable key is correctly configured.
3. Verify that the required tables exist in Supabase.
4. Check the browser console for database errors.
5. Verify that the required Supabase Row Level Security policies are configured.

If dependencies are missing, run:

```bash
npm install
```

## Core Business Rules

### Availability

Available units are calculated as:

```text
Available Units = Total Units - Currently Borrowed Units
```

The availability checker also considers overlapping loan periods.

### Borrowing Limit

A borrower can have a maximum of **5 active units** at one time.

### Late Fee

The late fee is calculated using:

```text
Late Fee = Late Days × Equipment Late Fee Per Day
```

### Deposit Refund

The refundable amount is:

```text
Refund = max(0, Deposit - Late Fee)
```

### Loan Transfer

An active loan can be transferred to another borrower.

During a transfer:

* Equipment remains unchanged
* Quantity remains unchanged
* Due date remains unchanged
* Deposit remains unchanged
* Loan remains active
* Equipment availability is unaffected

The new borrower must also remain within the 5-unit active borrowing limit.

## Design Goal

The system prioritizes the main problems identified in the paper-register workflow:

1. Reliable borrowing records
2. Clear equipment availability
3. Proper return processing
4. Deposit and late-fee handling
5. Borrowing limits
6. Loan transfer support

The goal is to provide a simple interface that can realistically be used by a college AV lending desk.

## License

This project was developed as part of an academic programming assessment.
