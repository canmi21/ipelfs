# Vue Component Guidelines

This document provides guidelines for creating, structuring, and styling Vue components within this project.

## Component Structure and Placement

1.  **File Naming:**

    - Vue component files should use **PascalCase** (e.g., `MyComponent.vue`, `UserProfileCard.vue`).
    - Associated component-specific CSS files (located in `assets/app/`) should use **lowercase** and mirror the component's directory structure (e.g., if component is `components/forms/CustomInput.vue`, its CSS might be `assets/app/forms/custominput.css`).
    - Composable files (in `composables/`) should follow a `useFeatureName.ts` or similar camelCase/PascalCase convention as established for that directory.

2.  **Directory Structure:**

    - Components should be organized logically into subdirectories within `components/`. For example, components related to a "user profile" feature might go into `components/profile/`.
    - If a component becomes complex and uses several child components that are _only_ used by it, these child components can be placed in a subdirectory named after the parent component (e.g., `components/MyComplexComponent/InternalChild.vue`).

3.  **Minimal Component Principle:**
    - Strive for small, focused components that do one thing well. This improves reusability, testability, and maintainability.
    - If a part of a component has its own distinct logic, state, or can be reused elsewhere, consider splitting it into a new component.

## Component Styling

The styling of components is divided into three main areas:

1.  **Layout and Animation (In `.vue` file - `<style scoped>`):**

    - The `<style scoped>` block within a `.vue` file should **exclusively** contain CSS rules related to the component's internal layout structure and any animations or transitions.
    - Examples: `display: flex`, `grid` properties, `flex-grow`, `width`, `height` (when structural), `position`, `top/left/right/bottom`, `overflow`, `margin` and `padding` that define the component's primary box model and relationship between its main structural child elements.
    - All styles here are scoped to the component by default.

2.  **Component-Specific Unique Styles (External CSS in `assets/app/`):**

    - Each component may have an associated CSS file in `assets/app/` (mirroring its path, e.g., `assets/app/componentname.css`).
    - This file is for styling attributes that are unique to this component and are not global theme colors or core layout. This includes:
      - Specific `padding` for internal elements (e.g., padding within a button, around text in a list item).
      - `border-radius`.
      - `font-size`, `font-weight`, `line-height` specific to elements within this component.
      - `list-style-type`.
      - `cursor` properties.
      - `border` properties (using `var()` for color, but `border-width` and `border-style` can be defined here).
    - **Import:** This CSS file should be imported at the top of the component's `<style scoped>` block:

      ```vue
      <style scoped>
      @import '../assets/app/path/to/componentname.css';

      /* Layout & animation styles here */
      .my-component-wrapper {
        display: flex;
      }
      </style>
      ```

3.  **Global Theme and Colors (From `assets/app.css`):**
    - All general colors (backgrounds, text colors, border colors, theme colors like primary/accent/success/error) **must** be applied using CSS Custom Properties (variables) defined in `assets/app.css`.
    - **Usage:** In your component-specific CSS files (in `assets/app/`) or directly in `<style scoped>` (though less common for colors directly), use `var(--variable-name)`.
      ```css
      /* In assets/app/mycomponent.css */
      .my-component-title {
        color: var(--color-text-default);
        border-bottom: 1px solid var(--color-border-primary);
      }
      .my-component-button {
        background-color: var(--theme-green-base);
        color: var(--text-on-green);
      }
      ```
    - **When to Use:** Always use these variables for any color application. If a new color is needed that seems reusable or part of the broader theme, it should be added to `assets/app.css`.

## First Line Comment

- Every `.vue` file must start with a comment indicating its project-relative path, followed by a newline.  
  Example: `<!-- components/MyComponent.vue -->`
- Every `.css` file (in `assets/` or elsewhere) must start with a comment indicating its project-relative path, followed by a newline.  
  Example: `/* assets/app/mycomponent.css */`

## No Other Comments

**Because when components are split down to a sufficiently small extent, we should be able to understand their functions directly by looking at the files or function names of the components themselves; otherwise, it means that they can be further subdivided**

- Apart from the first-line path comment and the detailed comments in `assets/app.css`, no other comments should be present in `.vue` or component-specific `.css` files.
