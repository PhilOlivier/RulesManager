# Task List: Client-Side Authentication Refactor

This document outlines the tasks required to refactor the application from server-side authentication to a purely client-side model.

- [x] **1.0: Investigation Spike**
  - [x] 1.1: Identify all components and pages that use `createClient` from `@/lib/supabase/server`.
  - [x] 1.2: Locate all instances of server-side `redirect` based on user authentication status.
  - [x] 1.3: Pinpoint where `middleware.ts` and the associated Supabase middleware client are used.
  - [x] 1.4: Document all findings in this task list.

- [x] **2.0: Create Global `AuthContext`**
  - [x] 2.1: Create a new file at `src/contexts/AuthContext.tsx`.
  - [x] 2.2: Implement an `AuthProvider` component that will wrap the application.
  - [x] 2.3: The provider will manage user and session state using `useState`.
  - [x] 2.4: It will expose `user`, `session`, `loading`, `signInWithEmail`, and `signOut` through the context.
  - [x] 2.5: It will use the client-side Supabase instance for authentication logic.
  - [x] 2.6: Wrap the main application layout in `src/app/layout.tsx` with this `AuthProvider`.

- [x] **3.0: Delete Server-Side Middleware**
  - [x] 3.1: Delete the `middleware.ts` file from the root of the `src` directory.
  - [x] 3.2: Delete the `src/lib/supabase/middleware.ts` file.

- [x] **4.0: Implement `ProtectedRoutesLayout`**
  - [x] 4.1: Create a new layout file at `src/app/protected-routes/layout.tsx`.
  - [x] 4.2: This layout will be a client component (`'use client'`).
  - [x] 4.3: It will use the `useAuth` hook to access the authentication state.
  - [x] 4.4: It will use the `useRouter` hook from `next/navigation` to handle redirection.
  - [x] 4.5: Display a full-page loading indicator while `loading` is true.
  - [x] 4.6: If a user does not exist after loading, redirect to `/login`.
  - [x] 4.7: If a user exists, render the `children` prop.

- [x] **5.0: Refactor Pages to be Client Components with Client-Side Data Fetching**
  - [x] 5.1: For each page identified in the spike, add `'use client'` to the top.
      - [x] `src/app/protected-routes/page.tsx`
      - [x] `src/app/protected-routes/scenarios/page.tsx`
      - [x] `src/app/protected-routes/scenarios/[id]/edit/page.tsx`
      - [x] `src/app/protected-routes/scenarios/[scenario_id]/run/page.tsx`
  - [x] 5.2: Convert the page from an `async` function to a standard function component.
  - [x] 5.3: Use `useState` to manage `data` and `loading` states within each page.
  - [x] 5.4: Use `useEffect` to trigger the data-fetching function when the component mounts.
  - [x] 5.5: Update the JSX to render a loading state or the data based on the component's state.

- [x] **6.0: Clean Up Obsolete Tests**
  - [x] 6.1: Delete the `src/middleware.test.ts` file.
  - [x] 6.2: Review the test suite for any other tests that relied on server-side session logic and remove them. 