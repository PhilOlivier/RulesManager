# PRD: Journal Query & Results Viewer

## 1. Introduction/Overview

This document outlines the requirements for a new feature: the "Journal Query" page. The primary purpose of this tool is to allow internal users to retrieve and view the data associated with a specific `job_uuid` from a previously executed scenario run. This is critical for debugging and analysis, as it provides a direct way to inspect the exact rules and resolved values tied to a specific test case, identified by its `job_uuid`.

The feature will consist of an input page to submit the query and a dynamic results page that can display the data in two distinct formats: a "Rules View" and a "Results View," both presented in a wide grid format inspired by the existing scenario results viewer.

## 2. Goals

-   **Enable Debugging:** Provide a direct lookup tool for developers and analysts to investigate past scenario runs using a `job_uuid`.
-   **Improve Analysis:** Allow users to easily compare rule definitions ("Unresolved") against their computed outputs ("Resolved") for any given test.
-   **Maintain UI Consistency:** Replicate the powerful grid and filtering interface from the existing scenario results page to provide a familiar user experience.
-   **Handle Complex Data:** Implement the necessary data transformation logic to parse the complex, array-based API response into a structured, user-friendly grid view.

## 3. User Stories

-   As a developer debugging a ticket, I want to enter a `job_uuid` provided in the ticket and see the exact rule definitions that were used, so I can understand the logic that was executed.
-   As a rules analyst, I want to enter a `job_uuid` and view the final resolved values, so I can verify the outcome and identify any discrepancies or errors.
-   As a non-technical user, I want a simple page where I can paste a `job_uuid` and select "View Results" to see the output in the same familiar grid I'm used to, without needing to understand the underlying API.

## 4. Functional Requirements

### 4.1 Input Page (`/protected-routes/journal-query`)

1.  **Job UUID Input:** The page must contain a text input field for the user to enter a `job_uuid`.
2.  **View Selection:** The page must provide two choices, "View Rules" and "View Results," using radio buttons. "View Results" should be the default selection.
3.  **Retrieve Button:** A "Retrieve" button must be present to submit the query.
4.  **Action:** Clicking the "Retrieve" button shall open the results page in a new browser tab. The URL will include the `job_uuid` as a path parameter and the view type (`rules` or `results`) as a query parameter.
    -   Example URL: `/protected-routes/journal-query/7cf215c5-475d-4a06-95a2-ccca6abb4cb0?view=results`
5.  **State:** The input page shall remain unchanged after the "Retrieve" button is clicked.

### 4.2 API Integration

1.  **Endpoint:** The results page will call the `GET /get_journal/{job_uuid}` endpoint.
2.  **Authentication:** The API call must use the existing `MVP` and `UAT` base URLs and authentication tokens from the application's environment context.

### 4.3 Results Page (`/protected-routes/journal-query/[job_uuid]`)

1.  **Data Fetching:** On page load, the component must call the API using the `job_uuid` from the URL.
2.  **Data Processing:** The page must implement logic to process the array-based JSON response:
    -   Filter the array into two separate collections: one where `comment` is "Unresolved" (for the Rules View) and one where `comment` is "Resolved" (for the Results View).
    -   For each collection, group the items by the `QDEXBankCode` found within the nested `dictionary`.
    -   Pivot this grouped data to create a single array of row objects suitable for the AG Grid, where each object represents a `key` (or `Variable`) and has properties for each `QDEXBankCode`.
3.  **View Rendering:** The page must render either the "Rules View" or the "Results View" based on the `view` query parameter from the URL.

### 4.4 Rules View (`view=rules`)

1.  **Grid Columns:** The grid must have a dynamic number of columns:
    -   The first column must be titled "Key".
    -   Subsequent columns must be dynamically generated, one for each unique `QDEXBankCode` (e.g., "Root", "Root.Resi"). The column header will be the bank code.
2.  **Grid Rows:** Each row in the grid will represent a unique rule name (a key from the `dictionary`). The cells will contain the corresponding rule formula.
3.  **Formula Handling:** For long formulas (particularly in the "Root" column), the cell text must be truncated with an ellipsis. The full text should be viewable on hover (e.g., via a `title` attribute). The grid cells should not auto-expand their height or width to fit the content.
4.  **Filtering:** The page must include the same filtering controls as the existing scenario results page (e.g., search/filter input, "Normalized Booleans" toggle).

### 4.5 Results View (`view=results`)

1.  **Layout:** This view must visually and functionally replicate the existing scenario results page (`.../run`).
2.  **Grid Columns & Rows:** The grid structure (dynamic columns for each lender, rows for each variable) must be identical to the existing results page.
3.  **Header Information:** The page should display the `job_uuid`. It will not display a scenario title or description.
4.  **Filtering:** The page must include the same filtering controls as the existing scenario results page.

## 5. Non-Goals (Out of Scope)

-   This feature will not provide a way to save or modify the retrieved journal data. It is a read-only viewer.
-   The UI will not support viewing rules and results on the same page simultaneously. The user must choose one view type on the input page.

## 6. Design Considerations

-   The overall layout, including the AG Grid theme, fonts, and component styling, should be consistent with the rest of the application.
-   The input page should be simple and centered, focusing the user on the three required inputs (UUID, view type, retrieve button).

## 7. Technical Considerations

-   A significant portion of the effort will be in creating a robust data transformation utility/hook to handle the complex data processing required for both views. This logic should be well-tested.
-   The AG Grid implementation should be reused or heavily inspired by the existing `ResultsGrid` component to ensure consistency.

## 8. Success Metrics

-   Internal users can successfully retrieve and view journal data without assistance.
-   Time-to-diagnose for bug tickets containing a `job_uuid` is measurably reduced.

## 9. Open Questions

-   None at this time. 