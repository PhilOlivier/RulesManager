  - [x] 4.4 Display a loading spinner or skeleton while data is loading.
  - [x] 4.5 Display a user-friendly error message if the hook returns an error.
  - [x] 4.6 Render the `JournalGrid` component, passing the `rowData` and `columnDefs` from the hook.
  - [x] 4.7 Display the `job_uuid` and the current view type ("Rules" or "Results") as a header.

- [x] 4.0 Integrate Components into the Final Results Page
  - [x] 4.1 Create the file `src/app/protected-routes/journal-query/[job_uuid]/page.tsx` as a client component.
  - [x] 4.2 Extract the `job_uuid` from path parameters and `view` from search parameters.
  - [x] 4.3 Use the `useJournalData` hook to fetch and process all data.
  - [x] 4.4 Display a loading spinner or skeleton while data is loading.
  - [x] 4.5 Display a user-friendly error message if the hook returns an error.
  - [x] 4.6 Render the `JournalGrid` component, passing the `rowData` and `columnDefs` from the hook.
  - [x] 4.7 Display the `job_uuid` and the current view type ("Rules" or "Results") as a header.

- [x] 5.0 Implement View-Specific Logic and Final Polish
  - [x] 5.1 In the `useJournalData` hook, if the `view_type` is `rules`, add a custom cell renderer or a `cellStyle` property to the column definitions to truncate long text with an ellipsis.
  - [x] 5.2 Ensure the full, non-truncated rule formula is visible on hover (e.g., via a `title` attribute or a tooltip).
  - [x] 5.3 Conduct a final review of the feature to ensure it meets all requirements from the PRD and is visually consistent with the rest of the application.