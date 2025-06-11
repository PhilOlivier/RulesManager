## Relevant Files

- `src/contexts/EnvironmentContext.tsx` - To provide global state for API environment selection (UAT/MVP).
- `src/contexts/EnvironmentContext.test.tsx` - Unit tests for the environment context.
- `src/components/layout/Navigation.tsx` - To add the environment selection UI control.
- `src/lib/services/rulesApi.ts` - To encapsulate the logic for calling the external rules API.
- `src/lib/services/rulesApi.test.ts` - Unit tests for the API service, mocking fetch requests.
- `src/lib/utils/resultsTransformer.ts` - To hold the logic for transforming the API JSON response into a format usable by AG Grid.
- `src/lib/utils/resultsTransformer.test.ts` - Unit tests for the data transformation logic.
- `src/lib/utils/filterParser.ts` - To parse the user's text query into a filter function.
- `src/lib/utils/filterParser.test.ts` - Unit tests for the advanced filtering logic.
- `src/app/scenarios/[scenario_id]/run/page.tsx` - The new page to display the results for a specific scenario run.
- `src/app/scenarios/[scenario_id]/run/page.test.tsx` - Unit tests for the results page.
- `src/components/results/ResultsGrid.tsx` - The new component that will contain the AG Grid and its controls (filtering, normalization).
- `src/components/results/ResultsGrid.test.tsx` - Unit tests for the results grid component.
- `src/components/scenarios/ScenarioTable.tsx` - To add the "Run" button to the scenarios list.

### Notes

- Unit tests should be placed alongside the code files they are testing.
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [x] 1.0 Setup Environment Selection Context
  - [x] 1.1 Create `src/contexts/EnvironmentContext.tsx` to manage the selected API environment (`'UAT'` or `'MVP'`).
  - [x] 1.2 Implement a React context provider that stores the selection in `localStorage` to ensure it persists across sessions.
  - [x] 1.3 Add an environment toggle/switch to the main `Navigation.tsx` component, allowing the user to change the active environment.
  - [x] 1.4 Wrap the root layout of the application with the `EnvironmentProvider` to make the context available globally.
- [x] 2.0 Implement API Service and Data Transformation Logic
  - [x] 2.1 Create a new service file `src/lib/services/rulesApi.ts`.
  - [x] 2.2 Implement a `runScenario` function that accepts scenario data and the selected environment.
  - [x] 2.3 The function should use the correct API URL and `x-api-key` from environment variables based on the selected environment.
  - [x] 2.4 Create `src/lib/utils/resultsTransformer.ts` with a function to process the API's JSON response.
  - [x] 2.5 The transformer function must identify all unique rule keys from the response and generate `colDefs` and `rowData` for AG Grid.
- [x] 3.0 Create Results Page and Triggering Mechanism
  - [x] 3.1 Add a "Run" button to each row in the `src/components/scenarios/ScenarioTable.tsx` component.
  - [x] 3.2 The button should navigate the user to `/scenarios/[scenario_id]/run`.
  - [x] 3.3 Create the new page component at `src/app/scenarios/[scenario_id]/run/page.tsx`.
  - [x] 3.4 On this page, fetch the details of the specified scenario (name, description, data).
  - [x] 3.5 Display the scenario's name and description at the top of the page.
  - [x] 3.6 Implement a loading state that is active while the API request is pending.
  - [x] 3.7 Use a `useEffect` hook to call the `runScenario` service upon page load and store the results in state.
- [x] 4.0 Implement Results View with AG Grid
  - [x] 4.1 Create the `src/components/results/ResultsGrid.tsx` component.
  - [x] 4.2 Set up the AG Grid to accept `colDefs` and `rowData` as props from the results page.
  - [x] 4.3 Add a "Normalise Booleans" toggle switch.
  - [x] 4.4 Implement cell styling using `cellClassRules` to color-code `true`/`false` and `ERROR` values. The styling should adapt based on the normalization toggle.
  - [x] 4.5 Add a label to display the current row count (e.g., "Showing 50 of 1500 rows").
- [x] 5.0 Implement Advanced Filtering Logic
  - [x] 5.1 Add a text input, "Apply Filter" button, and "Reset Filter" button to the `ResultsGrid` component.
  - [x] 5.2 Create `src/lib/utils/filterParser.ts` to translate a user's query string (with AND/OR/NOT) into a predicate function.
  - [x] 5.3 In the `ResultsGrid` component, use AG Grid's external filtering API (`gridApi.setExternalFilter()`) to apply the filter when the "Apply Filter" button is clicked.
  - [x] 5.4 Ensure the filter is case-insensitive and applies only to the "Key" column.
- [x] 6.0 Write Unit Tests
  - [x] 6.1 Write tests for the `EnvironmentContext`, mocking `localStorage`.
  - [x] 6.2 Write tests for the `rulesApi` service, mocking `fetch`.
  - [x] 6.3 Write tests for the `resultsTransformer` utility.
  - [ ] 6.4 Write extensive tests for the `filterParser` to cover all logical operators and edge cases. (Failed to implement)
  - [ ] 6.5 Write tests for the `ResultsGrid` component to check for UI elements and correct rendering based on props.
  - [ ] 6.6 Write tests for the results page (`/scenarios/[scenario_id]/run`) to verify the data fetching, loading state, and error handling logic. 