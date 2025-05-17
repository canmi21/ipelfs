# CSS Styling Guidelines (Assets)

This document outlines the CSS styling strategy, focusing on the organization and usage of CSS files within the `assets/app/` directory. The goal is to maintain a clean, scalable, and themeable styling architecture.

## Core Principles

1.  **Global Theme (`assets/app.css`):**

    - This file is the single source of truth for all color definitions, including light/dark mode palettes, theme colors (e.g., primary, accent, success, error), and text colors.
    - Colors are defined using CSS Custom Properties (variables) (e.g., `var(--color-bg-page)`, `var(--theme-green-base)`).
    - It includes detailed English comments explaining the purpose and intended use of each color variable.
    - This file should be imported globally, for instance, at the top of `assets/main.css`.

2.  **Component-Specific Styles (e.g., `assets/app/componentname.css` or `assets/app/group/componentname.css`):**

    - Each Vue component that requires styling beyond basic layout/animation (which resides in the `.vue` file itself) should have a corresponding CSS file in the `assets/app/` directory, mirroring its path in the `components/` directory (using lowercase for filenames and directories).
    - **Contents:** These files should _only_ contain styles specific to that component's unique appearance or "special needs" that are not part of the global theme or layout. This includes:
      - Specific `padding` or `margin` values that are for internal spacing/aesthetics of the component's elements, not defining its overall layout box.
      - `border-radius` properties.
      - Unique `font-size`, `font-weight`, `line-height`, `text-align` for elements within the component.
      - `list-style-type`.
      - `cursor` properties for interactive elements.
      - Specific `border` styles (e.g., `border-width`, `border-style`), but `border-color` should always use a variable from `assets/app.css`.
      - Any other non-color, non-layout styling attributes that define the component's unique look and feel.
    - **Color Usage:** All color-related properties (`color`, `background-color`, `border-color`, `box-shadow` color, etc.) in these files **must** use CSS variables defined in `assets/app.css`. No hardcoded hex/rgb values for colors should be present.
    - **Import:** These component-specific CSS files should be imported into the `<style scoped>` block of their corresponding Vue component.

3.  **No Redundancy:** Avoid redefining styles that are already handled by Tailwind CSS (if used for utility classes) or global styles, unless specifically overriding for a component's unique need.

## Directory Structure Example

```txt
assets/
└── app/
├── app.css                       # Global theme and color definitions
├── leftsidebar.css               # Styles for LeftSidebar container (used in App.vue)
├── relativemain.css              # Styles for RelativeMain container (used in App.vue)
├── relativemain_component.css    # Specific styles for RelativeMain.vue component itself
└── leftsidebar/                  # Mirrors components/leftsidebar/
├── topsidebar.css
├── middlesidebar.css
├── bottomsidebar.css
└── topsidebar/               # Mirrors components/leftsidebar/topsidebar/
└── sidebartogglebutton.css
```

## Usage

- When styling a component, first check if `assets/app.css` provides a suitable color variable.
- If the style is related to layout or animation, it belongs in the `<style scoped>` of the `.vue` file.
- If it's a unique stylistic attribute (like `border-radius` for a specific button, or unique internal `padding`), it goes into the component's dedicated CSS file in `assets/app/`, using global color variables.
- If a new theme color or a widely reusable color variant is needed, it should be proposed for addition to `assets/app.css`.
