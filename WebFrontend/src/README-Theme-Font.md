# Reddit Sans Font & Nord Theme Configuration

This document describes the implementation of Reddit Sans font and Nord theme color palette for the BugFlow bug tracking application frontend.

## 📁 File Structure

```
src/
├── fonts.css              # Reddit Sans font configuration and typography
├── theme-nord.css         # Nord theme color palette and semantic variables
├── index.css              # Global styles with font and theme imports
├── App.css                # Application layout and component styles
├── components/
│   ├── ThemeDemo.js       # Interactive theme demonstration component
│   └── ThemeDemo.css      # Styles for the theme demo
└── font-install-instructions.md
```

## 🎨 Nord Theme Color Palette

The Nord theme includes 16 carefully selected colors organized into 4 groups:

### Polar Night (Dark Base Colors)
- `--nord0` (#2e3440) - Primary dark background
- `--nord1` (#3b4252) - Secondary dark background  
- `--nord2` (#434c5e) - Tertiary dark background
- `--nord3` (#4c566a) - Comments, inactive elements

### Snow Storm (Light Colors)
- `--nord4` (#d8dee9) - Dark text on light backgrounds
- `--nord5` (#e5e9f0) - Medium text, secondary text
- `--nord6` (#eceff4) - Light text, primary text on dark

### Frost (Blue Accents)
- `--nord7` (#8fbcbb) - Teal accent
- `--nord8` (#88c0d0) - Light blue (primary accent)
- `--nord9` (#81a1c1) - Medium blue
- `--nord10` (#5e81ac) - Dark blue

### Aurora (Colorful Accents)
- `--nord11` (#bf616a) - Red (errors)
- `--nord12` (#d08770) - Orange
- `--nord13` (#ebcb8b) - Yellow (warnings)
- `--nord14` (#a3be8c) - Green (success)
- `--nord15` (#b48ead) - Purple

## 🔤 Reddit Sans Font

### Installation
```bash
npm install @fontsource-variable/reddit-sans
```

### Features
- Variable font with weights 300-700
- Optimized for web with `font-display: swap`
- Fallback to Inter font from Google Fonts
- Applied globally to all UI elements including inputs

### Usage
The font is automatically applied through CSS variables:
```css
font-family: var(--font-primary);
```

## 🎯 Semantic Color Variables

The theme includes semantic variables for consistent usage:

### Background Colors
```css
--bg-primary: var(--nord0);
--bg-secondary: var(--nord1);
--bg-tertiary: var(--nord2);
```

### Text Colors
```css
--text-primary: var(--nord6);
--text-secondary: var(--nord5);
--text-tertiary: var(--nord4);
```

### Interactive Colors
```css
--color-primary: var(--nord8);
--color-success: var(--nord14);
--color-warning: var(--nord13);
--color-error: var(--nord11);
```

## 🧩 Component Integration

### Forms
All form elements automatically use:
- Reddit Sans font family
- Nord theme colors for backgrounds, borders, text
- Consistent focus states with Nord blue accent

### Buttons
- Primary buttons use `--nord8` (light blue)
- Secondary buttons use `--nord3` (dark gray)
- Hover states with Nord color variations

### Cards & Panels
- Background: `--nord1`
- Borders: `--nord3`
- Subtle shadows with Nord-based opacity

## 🌙 Theme Switching

The implementation supports light/dark theme switching:

```javascript
// Toggle between themes
const toggleTheme = () => {
  setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
};

// Apply theme to document
useEffect(() => {
  document.documentElement.setAttribute('data-theme', theme);
}, [theme]);
```

## 📱 Responsive Design

The theme includes responsive breakpoints:
- Mobile: 480px and below
- Tablet: 768px and below
- Desktop: Above 768px

## ♿ Accessibility

### Features Included
- High contrast mode support
- Reduced motion preference support
- Proper focus states with Nord blue outline
- Color contrast ratios meet WCAG guidelines

### Usage Guidelines
- Use semantic color variables instead of raw Nord colors
- Ensure sufficient contrast for text readability
- Test with screen readers and keyboard navigation

## 🧪 Testing & Demo

Use the ThemeDemo component to verify:
```jsx
import ThemeDemo from './components/ThemeDemo';

// Shows all colors, typography, and components
<ThemeDemo />
```

## 🔧 Customization

### Adding New Semantic Colors
```css
:root {
  --color-custom: var(--nord15); /* Use existing Nord color */
}
```

### Typography Scale
```css
:root {
  --font-size-custom: 1.375rem; /* Add custom size */
}
```

## 📋 Checklist for New Components

When creating new components:
- [ ] Use semantic color variables (not raw Nord colors)
- [ ] Apply `var(--font-primary)` for typography
- [ ] Include hover/focus states with Nord colors
- [ ] Test in both light and dark themes
- [ ] Verify responsive behavior
- [ ] Check accessibility with screen readers

## 🐛 Troubleshooting

### Font Not Loading
1. Verify `@fontsource-variable/reddit-sans` is installed
2. Check browser console for import errors
3. Fallback Inter font should still work

### Colors Not Applying
1. Ensure `theme-nord.css` is imported in `index.css`
2. Check that `data-theme` attribute is set on `<html>`
3. Verify CSS variable syntax: `var(--variable-name)`

### Build Issues
1. Check all CSS imports are valid
2. Ensure component files are in correct directories
3. Verify no syntax errors in CSS files

## 📚 Resources

- [Nord Theme Official Site](https://www.nordtheme.com/)
- [Reddit Sans Font](https://github.com/reddit/redditsans)
- [Fontsource Documentation](https://fontsource.org/)
- [CSS Custom Properties (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
