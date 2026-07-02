# Engineering Decisions & Bug Hunt Report

This document records the architectural choices, tradeoffs, and security measures applied to the Annotation Activity Console, followed by the bug hunt report for the `TaskTicker` component.

---

## Part 1: Architectural Choices & Tradeoffs

### 1. RTK Query vs. Redux Thunks
*   **Decision**: We chose **Redux Thunks** instead of RTK Query.
*   **Tradeoffs**:
    *   *RTK Query* is excellent for simple CRUD applications with standard API caching, but it is harder to integrate with complex, custom state merges.
    *   *Thunks* give us direct, manual control over the Redux state, which is crucial for:
        1.  Seamlessly merging real-time WebSocket events (`task.updated`, `task.assigned`, `annotation.created`) directly into the entity cache.
        2.  Implementing optimistic updates with simple rollback states inside the slice.
        3.  Explicitly orchestrating IndexedDB persistence (`localforage`) during action fulfillment without writing complex middleware hooks.

### 2. Normalization Strategy
*   **Decision**: We used Redux Toolkit's `createEntityAdapter` to store tasks in a flat dictionary keyed by `id` (`state.entities` and `state.ids`).
*   **Tradeoffs**:
    *   This prevents nested state duplication and simplifies lookups.
    *   When WebSocket events arrive, we can update tasks in \(O(1)\) time instead of scanning arrays.
    *   Derived operations (filtering, sorting, search, pagination, and statistics) are computed efficiently via memoized selectors, which prevents unnecessary component re-renders.

### 3. Typing Messy Data & Cleaning Pipeline
*   **Decision**: We implemented a rigorous mapping layer in `src/utils/normalize.ts`.
*   **Tradeoffs**:
    *   We mapped raw type fields into strict discriminated unions. For instance, any unknown types (like `"video"`) are assigned to `TaskType.Unknown` while preserving their original type in `rawType`, preventing data loss.
    *   Timestamps are normalized into epoch milliseconds (handling both ISO strings and seconds vs milliseconds epochs).
    *   Annotation counts are sanitized from string representations and rounded floats to positive integers.
    *   All anomalies are logged to an internal array without throwing errors, preserving application resilience.

### 4. Real-time WebSocket Merging
*   **Decision**: The WebSocket custom hook `useTaskFeed` handles state updates.
*   **Tradeoffs**:
    *   To prevent duplicate updates or missing information, when an event references an ID that is not yet loaded in Redux (e.g. from an unvisited page), we trigger a background API fetch for that task (`fetchSingleTask`) instead of ignoring it or showing incomplete data.
    *   This ensures the dashboard's data consistency even if the client hasn't loaded the full workspace.

---

## Part 2: Security & Markdown Sanitization

### Streamed Markdown Sanitization
*   **Mechanisms**:
    *   Markdown is parsed incrementally into HTML using `marked`.
    *   The HTML is sanitized using `isomorphic-dompurify` (a wrapper around `DOMPurify` that works seamlessly in both Node server-side and browser client-side environments).
*   **Sanitization Point**:
    *   Sanitization occurs on the client-side inside the `TaskSummaryStream` component immediately *after* parsing the accumulated markdown string into HTML and *before* injecting it using React's `dangerouslySetInnerHTML`.
*   **Why it is Safe**:
    *   `DOMPurify` removes active scripting elements (like `<script>alert('xss-script')</script>`) and strips malicious event handlers (like `<img src=x onerror="alert(...)">`) while preserving safe Markdown layout elements (headers, lists, and code blocks).

---

## Part 3: IndexedDB Caching Approach

### Caching Strategy
*   **Mechanism**:
    *   We cache the full list of visited tasks inside IndexedDB using `localforage`.
    *   **Startup**: The UI reads the cache immediately, populates the store, and renders tasks with a warning banner indicating that the data is cached/stale.
    *   **Revalidation**: The client immediately triggers a background API fetch to revalidate tasks. When the server response is received, the store updates and the stale flag is cleared.
*   **Stale Data Prevention**:
    *   Every time fresh tasks are loaded or a WebSocket change occurs, the flat adapter collection is synchronized back into IndexedDB in the background. Since IndexedDB writes are async, they do not block the main thread.

---

## Part 4: Messy Data & Future Refinements

### Handled vs. Unhandled Data
*   *Handled*: Mixed timestamp formats, misspelled statuses, float annotation counts, string numbers, partial assignee details, and missing values.
*   *Deliberately Ignored*: We do not write back clean data to the server (because the backend mock-server lacks a persistence API).
*   *AI Usage*: AI was used to draft initial boilerplate templates and write test cases, which were verified by running Jest suites and checking compiler assertions.
*   *Future Refinements*: If given more time, we would implement virtualized tables (`@tanstack/react-virtual`) to support rendering thousands of tasks smoothly, and add Web Workers to handle heavy sorting/filtering of larger datasets.

---

## Part 5: Bug Hunt - `buggy/TaskTicker.tsx`

We identified and resolved six critical defects in the teammate's component:

1.  **Stale Closure in running clock effect**:
    *   *Root Cause*: The `useEffect` has an empty dependency array `[]` but references the local state variable `tick` in `setTick(tick + 1)`. The callback captures the initial state `tick = 0` on mount, causing it to indefinitely set `tick` to `1` on every subsequent interval.
    *   *Fix*: Use the functional updater form `setTick((prev) => prev + 1)` which reads the latest state dynamically.
2.  **State Mutation in fetch callback**:
    *   *Root Cause*: The fetch success handler calls `prev.push(t)` which mutates the existing React state array in place. Because the reference to the array remains unchanged, React's identity check fails to detect the mutation, preventing component re-renders.
    *   *Fix*: Return a new copy of the array with the new element appended: `[...prev, t]`.
3.  **In-place sorting mutates state**:
    *   *Root Cause*: `Array.prototype.sort()` mutates the source array in place. Executing `tasks.sort(...)` directly alters the underlying React state array, violating immutability principles.
    *   *Fix*: Create a shallow copy before sorting: `[...tasks].sort(...)`.
4.  **Fetch on initial render with null selectedId**:
    *   *Root Cause*: On mount, `selectedId` is `null`, causing the effect to fetch `${apiBase}/api/tasks/null` which triggers a server 404 error. The dependency array also omitted `apiBase`, creating a potential stale dependency.
    *   *Fix*: Add a guard clause `if (!selectedId) return;` at the beginning of the effect, and include `apiBase` in the dependency list.
5.  **Race conditions in fetch request**:
    *   *Root Cause*: Rapid task switching can cause overlapping fetch requests to resolve in arbitrary order, leading to the wrong task being added or selected last (race condition).
    *   *Fix*: Use an `AbortController` inside the `useEffect` cleanup function to abort outstanding network requests when `selectedId` changes.
6.  **Unsorted Index as Key**:
    *   *Root Cause*: Using array index `key={i}` inside the `map` iterator leads to rendering issues when the array is dynamically sorted or filtered.
    *   *Fix*: Use the unique task ID `key={t.id}`.
