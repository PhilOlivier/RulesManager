# Product Requirements Document: Rules Manager MVP

## 1. Introduction/Overview

The Rules Manager MVP will replace the current Excel-based workflow for managing mortgage lending rules. This project aims to create a streamlined, web-based interface for viewing, editing, and organizing lending rules and lender constants within the existing Rules Builder application. The new system will maintain compatibility with the current backend API for uploading rulesets.

The core of the feature is an editable grid that allows users to manage a large dataset (~1,500 rules across ~130 lenders) efficiently. It includes functionality for filtering, managing rule metadata, and uploading changes to different environments.

## 2. Goals

* Replace the manual, error-prone Excel process with a robust web interface.
* Provide a centralized, single source of truth for all lending rules and constants.
* Streamline the process of editing and uploading rules to the backend system.
* Improve data integrity by managing rules and metadata in a structured database.
* Integrate seamlessly with the existing application's UI and authentication.

## 3. User Stories

**As a Rules Administrator:**

* I want to view all rules and constants in a grid so that I can get a complete overview of the lending logic.
* I want to quickly find a specific rule by searching for its key name.
* I want to filter the view to show only "rules" (computational expressions) so I can focus on editing business logic.
* I want to edit a rule's formula directly in the grid and have my changes saved automatically.
* I want to open a panel for a specific rule to read its description, so I can understand its purpose before making changes.
* I want to edit the description of a rule to keep the documentation up-to-date.
* I want to classify an item as a "rule" from the metadata panel.
* I want to add and remove lender columns as needed to manage new lending products.

**As a Lending Policy Manager:**

* I want to view all rules and constants in a grid to understand the current policy configuration.
* I want to filter the view to show only "constants" so I can easily adjust thresholds, limits, and other parameters.
* I want to edit the value of a constant directly in the grid, and have the change saved automatically.
* I want to open a panel for a specific constant to see its description and ensure I am editing the correct value.
* I want to classify an item as a "constant" from the metadata panel.
* I want to upload the entire set of rules and constants to the UAT environment to test the impact of my changes before they go live.
* I want to receive clear feedback on whether the upload was successful or failed.

## 4. Functional Requirements

### FR1: Grid-Based Rule Management
1.1. Display all rules and constants in an AG Grid interface accessible by clicking on "Rules" in the nav bar.
1.2. The grid must support ~1,500 rows (keys) and ~130 columns (lenders).
1.3. The first column ("Key") must be pinned to the left to remain visible during horizontal scrolling.
1.4. All columns must be sortable.
1.5. All cells in the grid (except the "Key" column) must be editable.
1.6. Cell edits must trigger an automatic, debounced save to the Supabase database (400ms debounce period).
1.7. Empty cells should be preserved as they represent inherited values in the backend system.

### FR2: Filtering
2.1. A text input field shall be available to filter the grid rows by the "Key" column.
2.2. A set of radio buttons (or similar toggle) shall be available to filter rows by their type: "All", "Rules", or "Constants".
2.3. A text display must show the count of visible rows versus the total number of rows (e.g., "Showing 150 of 1557 rows").

### FR3: Metadata Management
3.1. An icon (e.g., info icon) shall be present in each row. Clicking this icon will open a slide-out panel from the side of the screen.
3.2. The metadata panel will display:
    * The rule/constant key (read-only).
    * A "Description" text area (editable).
    * A "Category" text field (editable).
    * A "Type" selector (e.g., radio buttons or a toggle) to classify the item as a "Rule" or a "Constant" (editable).
3.3. Changes made in the metadata panel must be saved automatically to the database.

### FR4: Lender Management
4.1. Users must be able to add new lender columns to the grid.
4.2. Users must be able to remove existing lender columns from the grid.
4.3. When adding a new lender, the system must validate that the name follows the proper dot notation format.
4.4. When removing a lender, the system must prompt for confirmation before proceeding.

### FR5: Data Upload
5.1. An "Upload" button shall be available on the page.
5.2. Clicking the "Upload" button will trigger a process that:
    a. Fetches the entire current dataset.
    b. Resolves inheritance for all empty cells.
    c. Formats it into the required JSON payload structure (see Technical Considerations).
    d. Sends the payload to the appropriate backend API endpoint (`/store-dicts`).
5.3. The target environment (e.g., MVP or UAT) for the upload will be determined by the existing environment toggle in the application's header.
5.4. The user must be shown a success or failure notification after the upload attempt.

### FR6: Data Storage
6.1. All rules and constants must be stored in a normalized database structure using Supabase.
6.2. The database must store only explicitly set values, not inherited ones.
6.3. The data structure must support the dynamic addition and removal of lenders.

## 5. Non-Goals (Out of Scope)

* Visualization of rule dependencies or impact analysis.
* Advanced filtering based on rule content, hierarchical grouping, or saved filters.
* CSV or JSON import/export functionality.
* Rule version history, rollback capabilities, or diff visualization.
* Role-based access control (beyond existing authentication) or collaborative editing features.
* Advanced editing features like syntax highlighting or autocompletion.

## 6. Design Considerations

* The UI should align with the existing application's style, using `shadcn/ui` components where possible.
* The grid experience should feel familiar to users of Excel or Google Sheets.
* The slide-out panel for metadata should not block the view of the grid, allowing users to see both simultaneously.
* The AG Grid theme should match the application's theme (e.g., `ag-theme-alpine`).
* Empty cells should clearly indicate inheritance to users.

## 7. Technical Considerations

### Database Schema: Supabase
The system will use a normalized database structure with the following tables:

#### Rules Table
* `id` (UUID, primary key)
* `key` (TEXT, unique)
* `type` (TEXT, 'constant' or 'rule')
* `description` (TEXT, nullable)
* `category` (TEXT, nullable)
* `created_at` (TIMESTAMPTZ)
* `updated_at` (TIMESTAMPTZ)

#### Lender Values Table
* `id` (UUID, primary key)
* `rule_id` (UUID, foreign key to rules.id)
* `lender` (TEXT)
* `value` (TEXT)
* `created_at` (TIMESTAMPTZ)
* `updated_at` (TIMESTAMPTZ)
* Unique constraint on (rule_id, lender)

#### Lenders Table
* `id` (UUID, primary key)
* `name` (TEXT, unique)
* `parent_name` (TEXT, references lenders.name)
* `display_order` (INTEGER)
* `created_at` (TIMESTAMPTZ)
* `updated_at` (TIMESTAMPTZ)

### AG Grid Configuration
* Implement a debounced save operation with a **400ms** timeout for cell edits to prevent excessive API calls while ensuring data is not lost.
* Use `cellEditor: 'agTextCellEditor'` and avoid `cellEditorPopup: true` to provide a seamless, Excel-like editing experience.
* Use `valueFormatter` to display all cell values as strings, preserving their underlying data type.
* Use `valueSetter` to handle type preservation on edit. Numeric values should be stored as numbers, while formulas (`=...`) and other values remain strings.
* Set `suppressConvertCellToNumber: true` in the grid options.
* The component must clean up any pending debounce timeouts when it unmounts.

### Inheritance Resolution
* For display in the grid, show only explicitly set values (empty cells indicate inheritance).
* For API upload, resolve inheritance by traversing the lender hierarchy to find the closest ancestor with a value set.

### API Payload for Upload
The data must be transformed into a specific JSON format before being sent to the `/store-dicts` endpoint. The payload should look like this:

```json
{
  "dicts": {
    "root": {
      "Key1": "value1",
      "Key2": "=Rule1"
    },
    "root.resi": {
      "Key1": "override_value1"
      // Key2 is inherited from root
    },
    // ... other lenders
  },
  "created_date": "ISODateString",
  "valid_from_date": "ISODateString"
}
```

This structure is a "dict of dicts," where the outer dict keys are lender names (columns) and the inner dicts map rule keys to their values for that lender. Only explicitly set values are included in each lender's dict.

## 8. Success Metrics

1. The new web interface completely replaces the need for the Excel-based workflow for editing rules.
2. Rules can be successfully viewed, filtered (by key and type), and edited in the grid.
3. Metadata (description, category, type) can be managed for each rule via the slide-out panel.
4. Users can add and remove lender columns as needed.
5. The "Upload" functionality successfully sends data to both MVP and UAT environments, confirmed by backend logs and successful test runs.
6. The performance of the grid is acceptable with the full dataset (~1500 rows, ~130 columns), with no significant UI lag during scrolling or editing.

## 9. Open Questions

* None at this time.