## ADDED Requirements

### Requirement: Database initialisation
The system SHALL open an IndexedDB database named `"yoga-dashboard"` at version 1 with a single object store `"trainings"` keyed by the `date` field. The open operation SHALL be exposed as a lazy-initialised cached Promise via `src/lib/db.ts`.

#### Scenario: First open creates the object store
- **WHEN** the database does not yet exist in the browser
- **THEN** IndexedDB creates the database at version 1 with a `"trainings"` object store keyed by `date`

#### Scenario: Subsequent opens reuse the cached connection
- **WHEN** `getDb()` is called more than once
- **THEN** the same `IDBPDatabase` instance is returned without reopening the database

---

### Requirement: Save training record
`saveTraining` SHALL persist a `Training` record to the `"trainings"` IndexedDB object store, upserting by `date` key. It SHALL return `Promise<Result<void, Error>>`.

#### Scenario: Successful save of a new training
- **WHEN** `saveTraining` is called with a `Training` whose `date` does not exist in the store
- **THEN** the record is inserted and the function resolves `{ ok: true, value: undefined }`

#### Scenario: Upsert replaces existing training for the same date
- **WHEN** `saveTraining` is called with a `Training` whose `date` already exists in the store
- **THEN** the existing record is replaced and the function resolves `{ ok: true, value: undefined }`

#### Scenario: Save fails when IndexedDB is unavailable
- **WHEN** the IndexedDB database cannot be opened (e.g., private-browsing restriction)
- **THEN** `saveTraining` resolves `{ ok: false, error: <Error> }` without throwing

---

### Requirement: Retrieve training by date
`getTrainings` SHALL query the `"trainings"` object store for a record matching the given date string. It SHALL return `Promise<Result<Training | undefined, Error>>`.

#### Scenario: Training found for requested date
- **WHEN** `getTrainings` is called with a date that exists in the store
- **THEN** the function resolves `{ ok: true, value: <Training> }`

#### Scenario: No training found for requested date
- **WHEN** `getTrainings` is called with a date that does not exist in the store
- **THEN** the function resolves `{ ok: true, value: undefined }`

#### Scenario: Read fails when IndexedDB is unavailable
- **WHEN** the IndexedDB database cannot be opened
- **THEN** `getTrainings` resolves `{ ok: false, error: <Error> }` without throwing

---

### Requirement: Legacy localStorage migration
On the first successful database open, the system SHALL migrate any training records stored under the `"trainings"` key in `localStorage` into the IndexedDB store, then remove the `localStorage` key.

#### Scenario: Migration runs when localStorage data is present
- **WHEN** the database is opened for the first time and `localStorage.getItem("trainings")` returns a non-empty JSON array
- **THEN** each record is upserted into the IndexedDB `"trainings"` store and `localStorage.removeItem("trainings")` is called

#### Scenario: Migration is skipped when no legacy data exists
- **WHEN** the database is opened and `localStorage.getItem("trainings")` returns `null`
- **THEN** no writes are made to IndexedDB and localStorage is not modified

#### Scenario: Migration failure does not crash the application
- **WHEN** an error occurs during migration (e.g., malformed JSON in localStorage)
- **THEN** the error is caught, the application continues to function, and the localStorage key is left intact
