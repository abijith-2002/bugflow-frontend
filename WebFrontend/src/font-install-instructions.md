# Reddit Sans Font Installation Instructions

## Option 1: Install @fontsource-variable/reddit-sans (Recommended)

To use Reddit Sans font in the application, you need to install the fontsource package:

```bash
cd bugflow-frontend/WebFrontend
npm install @fontsource-variable/reddit-sans
```

After installation, the font will be automatically imported via the `fonts.css` file.

## Option 2: Use Inter Font as Fallback

If you prefer not to install the Reddit Sans package, the application will automatically fall back to Inter font, which is loaded from Google Fonts and provides a similar aesthetic.

## Verification

Once installed, you can verify that Reddit Sans is working by:

1. Opening the browser developer tools
2. Inspecting any text element
3. Checking that the computed font-family shows "Reddit Sans Variable"

## Font Features

The configuration includes:
- Variable font weights (300-700)
- Proper fallback chain
- Optimized font loading with `font-display: swap`
- Global application to all UI elements including inputs and buttons

## Troubleshooting

If Reddit Sans doesn't load:
1. Ensure the package is installed: `npm list @fontsource-variable/reddit-sans`
2. Check browser console for any import errors
3. Verify the fonts.css file is being imported in index.css
4. The fallback Inter font should still work from Google Fonts
