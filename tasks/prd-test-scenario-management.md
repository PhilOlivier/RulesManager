# Product Requirements Document: Test Scenario Management

## Introduction/Overview

The Test Scenario Management feature provides users with the ability to create, view, edit, and duplicate test scenarios for mortgage applications. This is an internal tool for a small team (3 users) that will serve as the foundation for a larger Rules Builder application. Each scenario consists of a collection of key-value pairs that represent applicant data, property details, and loan requirements stored in a flexible JSON format.

## Goals

1. Enable users to efficiently create and manage test scenarios for mortgage application testing
2. Provide a simple, intuitive interface for CRUD operations on scenario data
3. Support scenarios with potentially hundreds of key-value pairs through high-performance data grids
4. Establish the foundation for a larger Rules Builder application ecosystem
5. Deliver an MVP that focuses on core functionality without complex validations or error handling

## User Stories

1. **As a mortgage rules tester**, I want to view all available test scenarios in a clean table format so that I can quickly identify and select the scenario I need to work with.

2. **As a mortgage rules tester**, I want to create new test scenarios with custom key-value pairs so that I can build comprehensive test cases for different mortgage application types.

3. **As a mortgage rules tester**, I want to edit existing scenarios so that I can update test data as requirements change or improve existing test cases.

4. **As a mortgage rules tester**, I want to duplicate an existing scenario so that I can quickly create variations of similar test cases without starting from scratch.

5. **As a mortgage rules tester**, I want to delete scenarios that are no longer needed so that I can keep the scenario list clean and relevant.

6. **As a mortgage rules tester**, I want to work with large scenarios (hundreds of rows) smoothly so that I can create comprehensive test cases without performance issues.

## Functional Requirements

### Application Structure
1. The application must include a top navigation bar with the following sections:
   - Rules Builder (logo/home)
   - Test Scenarios (current feature)
   - Lender Settings (future feature)
   - Rules (future feature)
   - Results (potential future feature)

### Scenario List View
2. The system must display all test scenarios in a tabular format with the following columns:
   - Name
   - Description (truncated if longer than reasonable display length)
   - Created date
   - Last Modified date
   - Actions (Run, Edit, Copy, Delete buttons)

3. The system must provide a "Create New Scenario" button prominently displayed at the top right of the scenario list.

4. The system must implement pagination to handle large numbers of scenarios efficiently.

5. The system must allow users to sort scenarios by clicking on column headers (Name, Created, Last Modified).

### Create New Scenario
6. The system must provide a "Create New Scenario" page with the following elements:
   - Name field (text input, required)
   - Description field (textarea, optional)
   - "+ Add Row" button to add new key-value pairs

7. The system must use AG Grid to display and edit key-value pairs with:
   - Key column (editable text)
   - Value column (editable text)
   - Action column with delete ("×") buttons for individual rows

8. The system must auto-save changes as users edit the scenario (no explicit save button required).

9. The system must provide a "Return to Scenario List" button or allow users to navigate away using the top navigation.

10. The system must store key-value pairs as JSONB in the existing Supabase `test_scenarios` table.

### Edit Existing Scenario
11. The system must provide an "Edit Scenario" page that uses the same interface as "Create New Scenario" but pre-populated with existing data.

12. The system must auto-save changes as users edit (same as create mode).

13. The system must update the "updated_at" timestamp when scenarios are modified.

### Duplicate Scenario
14. The system must provide a "Duplicate" action that creates an exact copy of the selected scenario.

15. The duplicated scenario must be named "Copy of [Original Name]".

16. After duplication, the system must immediately open the duplicated scenario in edit mode.

### Delete Scenario
17. The system must provide a "Delete" action that removes the scenario from the database.

18. The system must immediately refresh the scenario list after deletion (no confirmation dialog for V1).

## Non-Goals (Out of Scope)

- User authentication and authorization (to be implemented later)
- User profiles or account management
- Data validation or input constraints
- Error handling for duplicate names or invalid data
- Search and filtering functionality (separate PRD)
- Complex permission systems or user roles
- Import/Export functionality (beyond the planned Excel import)
- Scenario execution or result visualization
- Version history or change tracking
- Bulk operations on multiple scenarios
- Advanced grid features beyond basic editing

## Design Considerations

- Use shadcn/ui components for consistent styling throughout the application
- Implement AG Grid for the key-value pair editing interface to handle large datasets efficiently
- Follow the wireframe designs provided, with modifications for the navigation header
- Maintain a clean, modern interface suitable for internal business tools
- Ensure responsive design works on desktop screens (mobile optimization not required for internal tool)

## Technical Considerations

- **Database**: Connect to existing Supabase `test_scenarios` table with structure:
  - `id` (UUID, primary key)
  - `name` (text)
  - `description` (text, nullable)
  - `input_data` (JSONB for key-value pairs)
  - `expected_outcomes` (JSONB, not used in V1)
  - `created_at` (timestamp with timezone)
  - `updated_at` (timestamp with timezone)
  - `author` (UUID, not used in V1 without authentication)

- **Frontend Framework**: Next.js with React and TypeScript
- **Grid Component**: AG Grid for high-performance data editing
- **UI Components**: shadcn/ui for consistent component library
- **State Management**: React state (no complex state management needed for V1)

## Success Metrics

- Users can successfully create, edit, and duplicate test scenarios
- Application handles scenarios with 100+ key-value pairs without performance issues
- Zero blocking bugs that prevent core CRUD operations
- All three team members can effectively use the tool for their testing workflows
- Foundation is established for adding future features (search, filtering, scenario execution)

## Open Questions

- Should the "Run" button in the scenario list be implemented in this phase, or is it placeholder for future functionality?
- What should be the default sort order for the scenario list (most recent first, alphabetical, etc.)?
- Should there be any visual indicators for recently modified scenarios?
- Any specific keyboard shortcuts or accessibility requirements for the grid editing interface?

## Implementation Notes

- Focus on core functionality over polish for V1
- Prioritize getting the basic CRUD operations working reliably
- AG Grid integration should support basic cell editing without advanced features
- Keep the codebase simple and extensible for future enhancements 