## Relevant Files

- `src/lib/supabaseClient.ts` - Supabase client configuration and initialization
- `src/app/layout.tsx` - Root application layout, contains AuthProvider
- `src/contexts/AuthContext.tsx` - Authentication context provider for session management
- `src/contexts/AuthContext.test.tsx` - Unit tests for AuthContext
- `src/app/login/page.tsx` - Login page component with magic link functionality
- `src/app/login/page.test.tsx` - Unit tests for login page
- `src/components/auth/LoginForm.tsx` - Reusable login form component
- `src/components/auth/LoginForm.test.tsx` - Unit tests for LoginForm component
- `src/middleware.ts` - Next.js middleware for route protection
- `src/middleware.test.ts` - Unit tests for authentication middleware
- `src/app/auth/callback/route.ts` - API route for handling Supabase auth callbacks
- `src/app/auth/callback/route.test.ts` - Unit tests for auth callback handler
- `src/components/layout/Navigation.tsx` - Updated navigation with logout functionality
- `src/hooks/useAuth.ts` - Custom hook for authentication operations
- `src/hooks/useAuth.test.ts` - Unit tests for useAuth hook
- `.env.local` - Environment variables for Supabase configuration
- `tasks/tasks-prd-supabase-magic-link-authentication.md` - This task list

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `AuthContext.tsx` and `AuthContext.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [x] 1.0 Supabase Setup and Configuration
  - [x] 1.1 A Supabase project is already in use.
  - [x] 1.2 In the Supabase dashboard, ensure 'Email' provider is enabled and 'Enable Magic Link' is turned on.
  - [x] 1.3 In Supabase auth settings, confirm Site URL is `http://localhost:3000` for local development and add `http://localhost:3000/auth/callback` to the Additional Redirect URLs.
  - [x] 1.4 The Supabase JavaScript client (`@supabase/supabase-js`) is already installed.
  - [x] 1.5 The `.env.local` file with Supabase credentials is in place.
  - [x] 1.6 The Supabase client is configured in `src/lib/supabaseClient.ts`.
  - [x] 1.7 (Optional) Write unit tests for Supabase client initialization.
  - [x] 1.8 User accounts are already present in the Supabase `auth.users` table.

- [ ] 2.0 Authentication Context and Session Management
  - [x] 2.1 Create `src/contexts/AuthContext.tsx` with user state management
  - [x] 2.2 Implement session initialization and persistence logic
  - [x] 2.3 Add loading states for authentication checks
  - [x] 2.4 Create `src/hooks/useAuth.ts` custom hook for authentication operations
  - [x] 2.5 Implement login function using `supabase.auth.signInWithOtp()`
  - [x] 2.6 Implement logout function using `supabase.auth.signOut()`
  - [x] 2.7 Add session change listener for real-time auth state updates
  - [x] 2.8 Wrap root layout with AuthContext provider
  - [ ] 2.9 Write unit tests for AuthContext and useAuth hook

- [ ] 3.0 Login Page Implementation
  - [x] 3.1 Create `src/app/login/page.tsx` with basic page structure
  - [x] 3.2 Create `src/components/auth/LoginForm.tsx` component
  - [x] 3.3 Add QDEX logo and "Rules Builder" text matching navbar styling
  - [x] 3.4 Implement email input field with validation
  - [x] 3.5 Add "Enter email address to log in" instruction text
  - [x] 3.6 Implement magic link sending functionality on form submission
  - [x] 3.7 Add success feedback message when magic link is sent
  - [x] 3.8 Add error handling for invalid emails or failed sends
  - [x] 3.9 Style the page to match the application's theme.
  - [ ] 3.10 Ensure responsive design for mobile and desktop
  - [ ] 3.11 Write unit tests for login page and form components

- [x] 4.0. Implement the authentication callback to handle the magic link redirect.
  - [x] 4.1. Create a new route handler at `src/app/auth/callback/route.ts`.
  - [x] 4.2. In the route handler, extract the `code` from the request URL.
  - [x] 4.3. Use the `exchangeCodeForSession` method from the Supabase client to exchange the code for a user session.
  - [x] 4.4. If the exchange is successful, redirect the user to the application's home page (`/`).
  - [x] 4.5. If the exchange fails, redirect the user to an error page or show an error message.

- [x] 5.0. Implement middleware to protect routes.
  - [ ] 5.1. Create a `middleware.ts` file at the root of the `src` directory.
  - [ ] 5.2. In the middleware, check for the user's session on protected routes.
  - [ ] 5.3. If the user is not authenticated, redirect them to the `/login` page.
  - [ ] 5.4. Configure the middleware to run on the desired routes, excluding public paths like `/login` and `/auth/callback`.

- [x] 6.0. Add a logout button and functionality.
  - [x] 6.1. Add a "Logout" button to the application's main navigation or user menu.
  - [x] 6.2. Call the `signOut` method from the `AuthContext` when the button is clicked.
  - [x] 6.3. After logout, the user should be redirected to the login page.

- [x] 7.0. Final Testing.
  - [x] 7.1. Go through the entire login and logout flow to ensure it works as expected.
  - [x] 7.2. Test edge cases, such as an invalid magic link or an expired token.
  - [x] 7.3. Verify that protected routes are inaccessible to unauthenticated users. 