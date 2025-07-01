# Development Tasks: Rules Manager MVP

This document breaks down the work required to implement the Rules Manager MVP, based on the corresponding PRD.

## Relevant Files

- `src/app/protected-routes/rules/page.tsx` - The new page that will host the Rules Manager grid.
- `src/app/protected-routes/rules/page.test.tsx` - Tests for the new Rules Manager page.
- `src/components/layout/Navigation.tsx` - The main navigation bar where the "Rules" link will be added.
- `src/components/rules/RulesManager.tsx` - The main Rules Manager component with filtering controls, grid integration, and metadata panel with auto-saving.
- `src/components/rules/RulesManagerGrid.tsx` - The main component containing the AG Grid with info icon column and lender column remove icons.
- `src/components/rules/RulesManagerGrid.test.tsx` - Tests for the `RulesManagerGrid` component.
- `src/components/rules/MetadataPanel.tsx` - The slide-out panel for editing rule metadata with auto-saving to database.
- `src/components/rules/MetadataPanel.test.tsx` - Tests for the `MetadataPanel` component.
- `src/components/rules/AddLenderModal.tsx` - Modal for adding new lender columns with validation for dot notation format.
- `src/lib/services/rulesManager.ts` - Service file for all Supabase and API interactions related to rules.
- `src/lib/services/rulesManager.test.ts` - Tests for the rules manager service.
- `src/lib/utils/filterParser.ts` - Utility for parsing complex filter queries with boolean logic.

### Notes

- Unit tests should be placed alongside the code files they are testing.
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [ ] **Phase 1: Database Setup and Foundation**
  - [x] 1.1 Create the new page file at `src/app/protected-routes/rules/page.tsx`.
  - [x] 1.2 Add a "Rules" link to the `Navigation` component that navigates to the `/protected-routes/rules` page.
  - [x] 1.3 Create the necessary database tables in Supabase:
    - [x] 1.3.1 Create the `rules` table (id, key, type, description, category, created_at, updated_at)
    - [x] 1.3.2 Create the `lender_values` table (id, rule_id, lender, value, created_at, updated_at)
    - [x] 1.3.3 Create the `lenders` table (id, name, parent_name, display_order, created_at, updated_at)
  - [x] 1.4 Create the `src/lib/services/rulesManager.ts` file with basic database functions:
    - [x] 1.4.1 Function to fetch all rules from the `rules` table
    - [x] 1.4.2 Function to fetch all lender values from the `lender_values` table
    - [x] 1.4.3 Function to transform data into grid-friendly format
    - [x] 1.4.4 Function to insert/update a rule in the `rules` table
    - [x] 1.4.5 Function to insert/update/delete a value in the `lender_values` table

- [x] **Phase 2: Core Grid Implementation**
  - [x] 2.1 Create the `src/components/rules/RulesManagerGrid.tsx` component with:
    - [x] 2.1.1 Basic AG Grid setup with pinned Key column
    - [x] 2.1.2 Data loading from Supabase via the rules manager service
    - [x] 2.1.3 Column definitions with sorting enabled
  - [x] 2.2 Implement cell editing:
    - [x] 2.2.1 Make lender columns editable
    - [x] 2.2.2 Add debounced save function (400ms) triggered by `onCellValueChanged`
    - [x] 2.2.3 Implement `valueFormatter` and `valueSetter` for data type handling
    - [x] 2.2.4 Add `suppressConvertCellToNumber: true` to grid options
  - [x] 2.3 Add basic filtering:
    - [x] 2.3.1 Text input for key-based filtering
    - [x] 2.3.2 Radio buttons for type-based filtering (All, Rules, Constants)
    - [x] 2.3.3 Display for showing filtered row count vs. total row count

- [x] **Phase 3: Metadata Management**
  - [x] 3.1 Create the `src/components/rules/MetadataPanel.tsx` component using `shadcn/ui` `Sheet`
  - [x] 3.2 Implement fields in the metadata panel:
    - [x] 3.2.1 Read-only key display
    - [x] 3.2.2 Editable description textarea
    - [x] 3.2.3 Editable category input
    - [x] 3.2.4 Type selector (Rule/Constant)
  - [x] 3.3 Add info icon column to the grid that opens the metadata panel for the selected row
  - [x] 3.4 Implement auto-saving from the metadata panel to the `rules` table

- [x] **Phase 4: Lender Management**
  - [x] 4.1 Create the `src/components/rules/AddLenderModal.tsx` component
  - [x] 4.2 Add UI controls for lender management:
    - [x] 4.2.1 "Add Lender" button that opens the modal
    - [x] 4.2.2 Context menu or icon for removing lenders
  - [x] 4.3 Implement lender validation:
    - [x] 4.3.1 Validate lender name format (dot notation)
    - [x] 4.3.2 Validate that parent lenders exist
  - [x] 4.4 Implement lender operations:
    - [x] 4.4.1 Function to add a new lender column to the grid
    - [x] 4.4.2 Function to remove a lender column with confirmation
    - [x] 4.4.3 Update the grid to reflect added/removed lenders

- [ ] **Phase 5: API Upload Functionality**
  - [ ] 5.1 Implement inheritance resolution:
    - [ ] 5.1.1 Create function to traverse lender hierarchy
    - [ ] 5.1.2 Implement algorithm to find closest ancestor with a value
  - [ ] 5.2 Implement API payload transformation:
    - [ ] 5.2.1 Function to transform data into "dict of dicts" format
    - [ ] 5.2.2 Include only explicitly set values per lender
    - [ ] 5.2.3 Add required timestamps to the payload
  - [ ] 5.3 Create the `uploadRules` function in `rulesManager.ts`:
    - [ ] 5.3.1 Get environment from context
    - [ ] 5.3.2 Send payload to the correct API endpoint
    - [ ] 5.3.3 Handle success/failure responses
  - [ ] 5.4 Add "Upload" button to the UI that triggers the upload process
  - [ ] 5.5 Implement toast notifications for upload feedback

- [ ] **Phase 6: Testing and Refinement**
  - [ ] 6.1 Write comprehensive tests for all components
  - [ ] 6.2 Test with large datasets (~1500 rules, ~130 lenders)
  - [ ] 6.3 Implement performance optimizations if needed
  - [ ] 6.4 Add error handling for edge cases
  - [ ] 6.5 Final UI refinements and polish