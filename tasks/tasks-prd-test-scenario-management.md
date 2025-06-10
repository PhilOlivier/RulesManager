# Task List: Test Scenario Management Implementation

## Relevant Files

- `components/layout/Navigation.tsx` - Top navigation bar component with Rules Builder branding and nav items
- `components/layout/Navigation.test.tsx` - Unit tests for Navigation component
- `app/test-scenarios/page.tsx` - Main scenario list view page component
- `app/test-scenarios/page.test.tsx` - Unit tests for scenario list page
- `app/test-scenarios/create/page.tsx` - Create new scenario page component
- `app/test-scenarios/create/page.test.tsx` - Unit tests for create scenario page
- `app/test-scenarios/[id]/edit/page.tsx` - Edit existing scenario page component
- `app/test-scenarios/[id]/edit/page.test.tsx` - Unit tests for edit scenario page
- `components/scenarios/ScenarioTable.tsx` - Data table component for displaying scenarios list
- `components/scenarios/ScenarioTable.test.tsx` - Unit tests for ScenarioTable component
- `components/scenarios/ScenarioEditor.tsx` - AG Grid-based editor component for key-value pairs
- `components/scenarios/ScenarioEditor.test.tsx` - Unit tests for ScenarioEditor component
- `lib/supabase/scenarios.ts` - Database service functions for scenario CRUD operations
- `lib/supabase/scenarios.test.ts` - Unit tests for scenario database functions
- `lib/types/scenario.ts` - TypeScript type definitions for scenario data structures
- `app/globals.css` - Global styles and AG Grid theme configuration
- `.env.local` - Environment variables for Supabase connection and other configurations
- `package.json` - Project dependencies including AG Grid, Supabase client, and shadcn/ui components

### Notes

- Unit tests should typically be placed alongside the code files they are testing
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration
- AG Grid requires specific CSS imports and theme configuration
- The `.env.local` file needs to be created manually with your Supabase credentials. It is ignored by git and cannot be created by the assistant.

## Tasks

- [x] 1.0 Project Setup and Environment Configuration
  - [x] 1.1 Create `.env.local` file with Supabase connection variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
  - [x] 1.2 Install required dependencies: `npm install @supabase/supabase-js ag-grid-react ag-grid-community`
  - [x] 1.3 Install shadcn/ui components: `npx shadcn-ui@latest add button table input textarea sheet`
  - [x] 1.4 Configure AG Grid CSS imports in `app/globals.css`
  - [x] 1.5 Set up Supabase client configuration in `lib/supabaseClient.ts`
  - [x] 1.6 Verify Next.js and TypeScript configuration is properly set up

- [x] 2.0 Set up Application Foundation and Navigation
  - [x] 2.1 Create `components/layout/Navigation.tsx` with Rules Builder branding and nav items
  - [x] 2.2 Implement responsive navigation bar using shadcn/ui components
  - [x] 2.3 Add navigation items: Test Scenarios (active), Lender Settings, Rules, Results
  - [x] 2.4 Create main layout component `components/layout/Layout.tsx` that includes Navigation
  - [x] 2.5 Update `app/layout.tsx` to use the new Layout component
  - [x] 2.6 Write unit tests for Navigation component

- [x] 3.0 Implement Supabase Database Integration
  - [x] 3.1 Create TypeScript type definitions in `lib/types/scenario.ts` for Scenario interface
  - [x] 3.2 Implement `lib/supabase/scenarios.ts` with getAllScenarios() function
  - [x] 3.3 Implement getScenarioById() function for fetching individual scenarios
  - [x] 3.4 Implement createScenario() function for inserting new scenarios
  - [x] 3.5 Implement updateScenario() function for updating existing scenarios
  - [x] 3.6 Implement deleteScenario() function for removing scenarios
  - [x] 3.7 Implement duplicateScenario() function for copying scenarios
  - [x] 3.8 Write unit tests for all database service functions

- [x] 4.0 Create Scenario List View with Table Operations
  - [x] 4.1 Create `app/test-scenarios/page.tsx` as the main scenario list page
  - [x] 4.2 Implement `components/scenarios/ScenarioTable.tsx` using shadcn/ui Table component
  - [x] 4.3 Add table columns: Name, Description (truncated), Created, Last Modified, Actions
  - [ ] 4.4 Implement sorting functionality for Name, Created, and Last Modified columns
  - [x] 4.5 Add pagination controls for handling large scenario lists
  - [x] 4.6 Implement "Create New Scenario" button with navigation to create page
  - [x] 4.7 Add action buttons: Run (placeholder), Edit, Copy, Delete for each scenario row
  - [x] 4.8 Implement delete functionality with immediate list refresh
  - [x] 4.9 Implement delete confirmation dialog
  - [x] 4.10 Add pagination to the scenario list
  - [x] 4.11 Implement search and filtering functionality on the scenario list

- [x] 5.0 Build Scenario Editor with AG Grid Integration
  - [x] 5.1 Create `components/scenarios/ScenarioEditor.tsx` with AG Grid React component
  - [x] 5.2 Configure AG Grid with Key, Value, and Action columns
  - [x] 5.3 Implement editable cells for Key and Value columns
  - [x] 5.4 Add delete button ("×") for individual rows in Action column
  - [x] 5.5 Implement "+ Add Row" functionality to append new key-value pairs
  - [x] 5.6 Configure AG Grid theme and styling to match application design
  - [x] 5.7 Implement auto-resize columns and handle large datasets efficiently
  - [x] 5.8 Add form fields for scenario Name (required) and Description (optional)
  - [x] 5.9 Write unit tests for ScenarioEditor component

- [x] 6.0 Implement CRUD Operations and Auto-save Functionality
  - [x] 6.1 Create `app/test-scenarios/create/page.tsx` for new scenario creation
  - [x] 6.2 Implement auto-save functionality that triggers on cell blur/change events
  - [x] 6.3 Create `app/test-scenarios/[id]/edit/page.tsx` for editing existing scenarios
  - [x] 6.4 Implement scenario data loading and pre-population in edit mode
  - [x] 6.5 Implement duplicate scenario functionality that creates copy and opens in edit mode
  - [x] 6.6 Add "Return to Scenario List" navigation button or breadcrumb
  - [x] 6.7 Ensure updated_at timestamp is properly maintained on all changes
  - [x] 6.8 Handle JSONB conversion between database and AG Grid data formats
  - [x] 6.9 Write unit tests for create and edit pages
  - [ ] 6.10 Test end-to-end workflow: create → edit → duplicate → delete scenarios
  - [ ] 6.11 Final review and code cleanup

- [ ] 7.0 (Optional) Bonus Tasks 