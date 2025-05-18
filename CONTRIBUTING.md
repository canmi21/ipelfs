# Contributing to [IPELFS](https://github.com/canmi21/ipelfs)

We are excited that you want to contribute to IPELFS! Here are some guidelines to help you get started:

## Project Status

IPELFS is currently under active development. At this stage, we are not actively addressing issues reported in the issue tracker. However, if you encounter an issue and believe you understand how to resolve it, you are welcome to submit a pull request. Please refer to the code guidelines below to ensure your contribution aligns with our standards.

## Code Guidelines

IPELFS is a typical frontend-backend separated project, with distinct requirements for each part:

- **Backend**: Written in Rust using the Axum framework. Source code can be found in the `src/` directory.
- **Frontend**: Built with Vue3 and TailwindCSS. Source code is located in the `webui/` directory.

### Code Style and Conventions

We enforce the following conventions for both frontend and backend code:

- **Indentation**: Use 2 spaces for indentation.
- **Braces**:
  - Opening brace `{` must be on the same line as the function name.
  - Closing brace `}` must be on a new line.
- **File Header**:
  - The first line of every source file must be a comment specifying the file's relative path from the project root (e.g., `// src/main.rs` for backend or `// webui/src/App.vue` for frontend).
  - The second line must be empty.
  - Code starts from the third line.
- **Linting**: All code must pass ESLint checks (applicable to both frontend and backend where relevant).
- **File End**: Every source file must end with an empty newline.
- **Frontend-Specific Guidelines**:
  - For detailed conventions on Vue components, CSS styles, component splitting, composables, folder structure, path naming, and naming conventions for different source types, refer to:
    - `webui/components/README.md`
    - `webui/assets/README.md`

By following these guidelines, you can help ensure that your contributions align with the project's standards. Thank you for your interest in improving IPELFS!
