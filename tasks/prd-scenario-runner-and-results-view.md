# PRD: Scenario Runner & Results Viewer

**Document Status:** DRAFT

## 1. Overview

This document outlines the requirements for a "Scenario Runner" feature within the Rules Validator application. This feature will allow users to execute a test scenario against an external rules API and view the results in a new, interactive grid interface. The goal is to provide a seamless way for users to validate their rule sets against different data scenarios without leaving the application.

## 2. User Stories

-   **As a mortgage rules tester**, I want to run a scenario against the rules engine so that I can see the outcome of the rules based on the scenario's data.
-   **As a mortgage rules tester**, I want to be taken to a results page after running a scenario so that I can immediately see the feedback from the rules engine.
-   **As a mortgage rules tester**, I want to see the name and description of the scenario on the results page so that I have context for the results I am viewing.
-   **As a mortgage rules tester**, I want the results displayed in a clear, tabular format where rows are rule keys and columns are different lenders/rule sets.
-   **As a mortgage rules tester**, I want to filter the results based on keywords in the rule key using AND/OR/NOT logic so that I can quickly find specific results in a large dataset.
-   **As a mortgage rules tester**, I want to normalize boolean values (0/1 to false/true) and see them color-coded so that I can easily distinguish between pass and fail states.
-   **As a rules administrator**, I want to run a scenario against the rules engine so that I can see the outcome of the rules based on the scenario's data.
-   **As a rules administrator**, I want to be taken to a results page after running a scenario so that I can immediately see the feedback from the rules engine.
-   **As a rules administrator**, I want to see the name and description of the scenario on the results page so that I have context for the results I am viewing.
-   **As a rules administrator**, I want the results displayed in a clear, tabular format where rows are rule keys and columns are different lenders/rule sets.
-   **As a rules administrator**, I want to filter the results based on keywords in the rule key using AND/OR/NOT logic so that I can quickly find specific results in a large dataset.
-   **As a rules administrator**, I want to normalize boolean values (0/1 to false/true) and see them color-coded so that I can easily distinguish between pass and fail states.
-   **As a rules administrator**, I want to switch the target API environment (e.g., UAT, MVP) so that I can run scenarios against different versions of the rules engine.

## 3. Functional Requirements

### 3.1. Triggering a Scenario Run

-   A "Run" button shall be present for each scenario in the scenario list (`/scenarios`).
-   Clicking the "Run" button will trigger the execution process.

### 3.2. API Interaction

-   **Endpoint:** The application will send a POST request to the `/resolve-with-rules-and-journal` endpoint.
-   **Authentication:** The request must include an `x-api-key` header for authentication. The API key will be retrieved from environment variables.
-   **Request Payload:** The body of the POST request will be a JSON object with the following structure:
    ```json
    {
      "inbound": {
        // The full JSON data from the selected scenario will be placed here
      }
    }
    ```
-   **Response:** The API is expected to return a JSON object where the top-level keys represent different lenders or rule sets (e.g., "Root", "Root.Resi", "Root.Resi.Mass"). The value of each key is another object containing key-value pairs of rule IDs and their results.

### 3.3. Results Page

-   **Navigation:** Upon clicking "Run", the user will be immediately navigated to a new page, for example `/scenarios/run/{scenario_id}/results`. The UI should display a loading state (e.g., a spinner) while waiting for the API response.
-   **Scenario Context:** The results page must display the `name` and `description` of the scenario that was executed. This data should be fetched or passed from the previous page.
-   **Data Persistence:** The results from the API call **will not** be saved to the database. They are for immediate, in-session viewing only.

### 3.4. Results Grid (AG Grid Implementation)

-   **Data Transformation:**
    -   The JSON response from the API must be transformed into a row/column format suitable for AG Grid.
    -   **Columns:**
        1.  A "Key" column displaying the rule identifier string.
        2.  Subsequent columns for each top-level key (lender) in the API response. The column header should be the lender's name.
    -   **Rows:**
        -   Each unique rule identifier found across all lenders in the response will constitute a single row.
        -   The value for each cell will be the result of that `rule` for that `lender`. If a rule key does not exist for a given lender, the cell should be blank.
-   **Grid Features:**
    -   The grid should fill the available width of the container.
    -   Columns should be resizable.
    -   Horizontal and vertical scrolling should be enabled for large data sets.

### 3.5. Filtering Logic

-   An input field will be provided above the grid for filtering.
-   Filtering will apply to the "Key" column only.
-   The filter logic must support:
    -   **Keywords:** Searching for a single word (e.g., `Residency`).
    -   **Quoted Phrases:** Searching for exact phrases (e.g., `"Country.Residence"`).
    -   **AND:** Combining terms where both must be present (e.g., `"Canlend" AND "residency"`).
    -   **OR:** Combining terms where at least one must be present (e.g., `"LTV" OR "LoanAmount"`).
    -   **NOT:** Excluding terms (e.g., `NOT "Expat"`).
-   Filtering should be case-insensitive.
-   An "Apply Filter" button will trigger the filter operation.
-   A "Reset Filter" button will clear the filter and show all results.

### 3.6. Boolean Normalization and Styling

-   A toggle switch labeled "Normalise Booleans" will be provided.
-   When **on**, all cell values of `0` will be displayed as `false`, and `1` will be displayed as `true`.
-   When **off**, values will be shown as they are.
-   Cell Styling:
    -   Cells containing `true` (or `1` if normalization is off) should have a green background/text.
    -   Cells containing `false` (or `0` if normalization is off) should have a red background/text.
    -   Values of "ERROR: ..." should have a distinct warning style (e.g., amber/yellow).

### 3.7 Environment Selection
-   A UI control (e.g., a toggle switch or dropdown) shall be added to the main application header to allow environment selection.
-   The available environments will be "UAT" and "MVP".
-   The user's selection must persist throughout their session (e.g., using `localStorage`).
-   The application will dynamically select the API URL and `x-api-key` based on the chosen environment. It will expect to find corresponding variables in the `.env.local` file (e.g., `UAT_API_URL`, `UAT_API_KEY`, `MVP_API_URL`, `MVP_API_KEY`).

## 4. UI/UX Mockup Analysis

The provided mockup shows:
-   A main title "Rules Validator".
-   An environment selection toggle (UAT/MVP) in the top-right corner of the header.
-   A filter input area with "Apply Filter" and "Reset Filter" buttons.
-   A "Normalise Booleans" toggle.
-   A row count indicator (e.g., "Showing 48 of 1558 rows").
-   The AG Grid with color-coded boolean values.

*(Note: The "Choose file" button from the mockup will be ignored as our workflow starts from an existing scenario).*

## 5. Non-Functional Requirements

-   **Performance:** The UI must remain responsive while waiting for the API. The data transformation and grid rendering should be efficient enough to handle large result sets (e.g., ~1500 rows) without significant lag.
-   **Error Handling:**
    -   If the API call fails (e.g., network error, 5xx response), a user-friendly error message should be displayed on the results page instead of the grid.
    -   If the API response is not in the expected format, a parsing error should be shown.

## 6. Out of Scope

-   Saving scenario run results to the database.
-   Historical tracking of scenario runs.
-   Comparing results between two different runs.
-   User ability to upload a JSON file directly on the results page.

## 7. Open Questions

*(All initial questions have been resolved)* 