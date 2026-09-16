# AVGear — Solution Reasoning

## 1. Understanding the Problem

The college AV room currently relies on a paper register to track equipment. This creates several problems:

* Staff cannot reliably know what equipment is currently borrowed.
* Multiple people may request the same equipment for overlapping periods.
* Borrowers may keep equipment longer than expected.
* There is no systematic way to calculate late fees.
* Security deposits are difficult to track.
* A borrower can potentially take too many items at once.
* There is no simple way to transfer an active loan to another borrower.

The solution therefore focuses first on reliable borrowing, availability, and returns, and then adds deposits, borrowing limits, and loan transfers.

---

## 2. Solution Approach

I designed AVGear as a small web application with a React frontend and a Supabase PostgreSQL database.

The application is divided into five main areas:

1. Dashboard
2. Equipment
3. Borrow
4. Availability
5. Returns

React Context is used to keep the application state accessible across pages.

Supabase provides persistent database storage so that borrowing records are not lost when the browser is refreshed.

---

## 3. Data Model

Two main tables are used.

### Equipment

The `equipment` table stores each equipment category and the number of physical units available.

For example:

```text
DSLR Camera → 5 units
Projector   → 4 units
Microphone  → 10 units
Tripod      → 8 units
```

Each equipment item also has a configurable late fee per day.

### Loans

The `loans` table stores individual borrowing records.

A loan contains:

* Borrower
* Equipment
* Quantity
* Borrow date
* Due date
* Return date
* Security deposit
* Late days
* Late fee
* Refund amount
* Loan status

The equipment and loan tables are connected using `equipment_id`.

---

## 4. Borrowing Logic

When a borrower requests equipment, the application performs several validations.

### Equipment availability

The application calculates:

```text
Available Units = Total Units - Active Borrowed Units
```

If the requested quantity is greater than the available quantity, the borrowing request is rejected.

### Date validation

The due date must be after the borrowing date.

### Borrowing limit

A borrower can have at most 5 active units.

Before creating a loan, the application checks the borrower's current active quantity:

```text
Current Active Units + Requested Quantity <= 5
```

If this condition is not satisfied, the borrowing request is rejected.

### Database storage

After validation, the new loan is stored in the Supabase `loans` table with an `active` status.

---

## 5. Availability Logic

The availability page allows the user to select equipment and a date range.

The application looks for active loans for the selected equipment whose date ranges overlap with the requested period.

The overlap condition is:

```text
Loan Start <= Requested End
AND
Loan End >= Requested Start
```

All overlapping loan quantities are added together.

The resulting availability is:

```text
Available =
Total Equipment Units - Overlapping Booked Units
```

This prevents the system from incorrectly showing equipment as available when all physical units are already committed during the requested period.

---

## 6. Return Processing

When a loan is returned, the user enters the actual return date.

The system compares the return date with the original due date.

If the equipment is returned late:

```text
Late Days = Return Date - Due Date
```

The late fee is then calculated using the equipment's configured daily rate:

```text
Late Fee =
Late Days × Late Fee Per Day
```

The loan is then changed from:

```text
active
```

to:

```text
returned
```

The actual return date, late days, late fee, and refund are stored in the database.

---

## 7. Deposit and Refund Logic

The security deposit is refundable.

After calculating the late fee, the final refund is:

```text
Refund = max(0, Deposit - Late Fee)
```

Using `max(0, ...)` ensures that the refund never becomes negative.

For example:

```text
Deposit = ₹1000
Late Days = 2
Late Fee = ₹50/day

Late Fee = 2 × ₹50
         = ₹100

Refund = ₹1000 - ₹100
       = ₹900
```

---

## 8. Loan Transfer

The assessment requires an active loan to be transferable between borrowers.

For example:

```text
Before:
Borrower: Rahul
Equipment: DSLR Camera
Quantity: 1
Due Date: 20 September

After:
Borrower: Aman
Equipment: DSLR Camera
Quantity: 1
Due Date: 20 September
```

Only the borrower field changes.

The following remain unchanged:

* Equipment
* Quantity
* Due date
* Deposit
* Loan status

Because the same loan record is updated instead of creating a new loan, equipment availability is unaffected by the transfer.

The new borrower is also checked against the 5-unit borrowing limit.

---

## 9. Dashboard and Return Nudges

The dashboard provides a quick overview of the lending desk.

It displays:

* Total equipment units
* Available units
* Currently borrowed units
* Overdue loans

It also shows upcoming returns and overdue items.

This addresses the requirement to "nudge people to return it" by making approaching and overdue returns visible to the AV room staff.

---

## 10. Why React?

React was used because the application contains several interactive views and forms.

For example:

* Borrowing forms update availability information.
* Return forms dynamically calculate late fees and refunds.
* Transfer forms update active loans.
* Dashboard values change when loan data changes.

React state and Context allow these changes to be reflected throughout the application without manually refreshing every page.

---

## 11. Why Supabase?

A paper register is unreliable mainly because the data is difficult to maintain and share.

Using Supabase provides persistent PostgreSQL storage.

This means:

* Data survives browser refreshes.
* Loan records are stored centrally.
* Equipment and loan data are separated into structured tables.
* The application can be extended later with authentication and multiple staff users.

Supabase was chosen to keep the backend implementation relatively simple while still using a real relational database.

---

## 12. Error Handling and Validation

The application validates user input before creating or modifying loans.

Examples include:

* Empty borrower name
* Equipment not selected
* Invalid quantity
* Insufficient availability
* Invalid dates
* Negative deposits
* Borrowing-limit violations
* Returning an item before it was borrowed
* Transferring a loan to the same borrower
* Transferring a loan to a borrower who would exceed the limit

These checks prevent common data-entry errors.

---

## 13. Overall Flow

The main application flow is:

```text
                 ┌──────────────┐
                 │   Equipment  │
                 └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │   Borrowing  │
                 └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │ Active Loan  │
                 └──────┬───────┘
                        │
              ┌─────────┴─────────┐
              │                   │
              ▼                   ▼
        ┌───────────┐       ┌────────────┐
        │ Transfer  │       │   Return   │
        └─────┬─────┘       └──────┬─────┘
              │                    │
              │                    ▼
              │             ┌────────────┐
              │             │ Late Fee + │
              │             │   Refund   │
              │             └──────┬─────┘
              │                    │
              └──────────┬─────────┘
                         ▼
                  ┌──────────────┐
                  │ Loan Updated │
                  └──────────────┘
```

---

## 14. Future Improvements

The current solution focuses on the core requirements of the assessment.

A production version could additionally include:

* Staff authentication and role-based access
* Student ID or college email integration
* Email/SMS return reminders
* Equipment maintenance tracking
* Equipment condition reports
* Audit logs
* Reservation approval workflow
* More detailed reporting
* Transaction-safe database operations

These features were intentionally not prioritized because the core requirement was to make borrowing, availability, and returns reliable first.

---

## 15. Final Design Principle

The main design principle was to keep the application simple enough for an AV room staff member to use quickly while making the underlying borrowing data structured and reliable.

The system replaces the paper register with a centralized workflow:

```text
Borrow → Track → Check Availability → Nudge → Return
                         ↓
                   Transfer Loan
```

This directly addresses the operational problems described in the assessment while leaving the system open for future expansion.
