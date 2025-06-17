# PRD: Client-Side Authentication Refactor

**Document Status:** DRAFT

## 1. Overview

This document outlines the requirements for refactoring the application's authentication mechanism. The goal is to move from the current hybrid server-side and client-side model to a **purely client-side authentication model**.

This change is motivated by the need to resolve persistent, difficult-to-diagnose bugs, simplify the overall architecture, and reduce code complexity. As an internal tool, reliability and maintainability are prioritized over seamless UI transitions.

## 2. Goals

- **Resolve Bugs:** Permanently eliminate the stubborn server-side errors (e.g., `params should be awaited`) by removing the underlying complexity.
- **Simplify Architecture:** Consolidate the authentication logic into a single, predictable client-side flow, making the application easier to understand and debug.
- **Reduce Complexity:** Remove all server-side authentication code, including middleware and server-specific Supabase clients (`@supabase/ssr`).
- **Improve Developer Experience:** Create a straightforward and maintainable authentication pattern for future development.

## 3. User Stories

-   **As a developer**, I want a simple and predictable authentication flow so I can debug issues quickly and add new features confidently.
-   **As an internal user**, I want to access a protected page, be redirected to login if I'm not authenticated, and then be returned to my original page after logging in.
-   **As an internal user**, I want the application to remain logged in between browser sessions.

## 4. Functional Requirements

### Core Logic
1.  The application **MUST** use a purely client-side authentication model using Supabase's client-side libraries.
2.  All server-side authentication middleware (`middleware.ts` and its dependencies in `lib/supabase/middleware.ts`) **MUST** be removed.
3.  All pages that fetch data and require authentication (primarily under `/protected-routes/`) **MUST** be converted to client components (using `'use client'`).
4.  These pages **MUST** fetch their required data from the browser *after* the component has mounted, displaying a loading state if necessary.
5.  A global authentication context/provider (e.g., `AuthContext.tsx`) **MUST** be implemented to provide authentication state (user object, loading state, session) to all components.
6.  The global auth provider **MUST** check for an active user session on initial application load.

### User Flow
7.  Protected routes **MUST** be wrapped in a layout or component that checks the authentication state from the global provider.
8.  If a user is not authenticated and tries to access a protected route, they **MUST** be redirected to the `/login` page.
9.  The `/login` page **MUST** handle the user login via Supabase's client-side methods and redirect the user back to their originally intended page upon a successful login.

## 5. Non-Goals (Out of Scope)

-   **Seamless Loading Experience:** Implementing a "no-flicker" UI is not a priority. A brief flash of a loading state or a blank page before a redirect is acceptable.
-   **Server-Side Rendering (SSR) of Protected Content:** All data for protected pages will be fetched and rendered on the client-side (CSR).
-   **Initial Test Overhaul:** The first phase of this refactor will focus on functionality. Tests related to the old server-side model will be removed, and new tests will be addressed in a second phase.

## 6. Technical Plan & Considerations

### Phase 1: Investigation & Planning (Spike)
- **Goal:** Identify all areas of the codebase that rely on the current server-side authentication.
- **Tasks:**
    -   Search the codebase for all usages of `updateSession`, `createServerClient` (in the middleware context), and `@supabase/ssr`.
    -   Create a definitive list of all `async` page components (e.g., `src/app/protected-routes/**/page.tsx`) that will need to be converted to client components.
    -   Identify all tests related to `middleware.ts` and server-side authentication that will need to be removed or refactored.
- **Outcome:** A checklist of files and components to be modified, created, or deleted.

### Phase 2: Implementation
1.  **Create Global Auth Provider:** Implement `src/contexts/AuthContext.tsx` to manage the Supabase session, user state, and provide a `useAuth` hook.
2.  **Update Root Layout:** Wrap the main application layout (`src/app/layout.tsx`) with the new `AuthProvider`.
3.  **Remove Server-Side Auth:** Delete `src/middleware.ts` and `src/lib/supabase/middleware.ts`. Remove the `@supabase/ssr` dependency if it's no longer needed elsewhere.
4.  **Create Protected Route Layout:** Implement a new layout component (`src/app/protected-routes/layout.tsx`) that uses the `useAuth` hook to check for an authenticated user and handles the redirect logic.
5.  **Refactor Pages to Client Components:** Convert all pages identified in the spike to use `'use client'`. Modify their data fetching logic to run on the client-side (e.g., using `useEffect`).
6.  **Refactor Login Page:** Ensure the `/login` page uses only client-side Supabase functions for authentication.
7.  **Remove Obsolete Tests:** Delete or disable tests identified during the spike.

### Phase 3: Testing (Post-Implementation)
1.  **Write New Tests:** Create new tests for the `AuthContext` and the redirect logic in the protected route layout.
2.  **Update Component Tests:** Update tests for the refactored pages to account for their new client-side data fetching and loading states.

## 7. Success Metrics

-   The persistent server-side rendering bugs are permanently resolved.
-   The application's authentication logic is consolidated and easy to trace within the client-side codebase.
-   The `middleware.ts` file and its related server-side session logic have been deleted.
-   The application successfully authenticates users and protects routes using a 100% client-side model. 