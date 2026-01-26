# Token System Setup

## File Structure

```
tokens/
├── primitives.json       # Raw values (never change across themes)
├── semantics.json        # Meaningful roles (reference primitives)
├── themes/
│   ├── default.json      # Default theme colors
│   ├── soft.json         # Soft theme colors
│   └── noir.json         # Noir theme colors
├── build-tokens.js       # Script to generate CSS
└── dist/
    └── tokens.css        # Generated CSS (do not edit)
```

## How It Works

1. **Primitives** = Raw values that never change
   - Spacing scale (4px, 8px, 16px...)
   - Font sizes (14px, 16px, 18px)
   - Border radius (4px, 8px, 12px)
   - etc.

2. **Semantics** = Meaningful roles that reference primitives
   - `role.body.size` → references `{type.size.2}` → becomes 16px
   - `stack.2` → references `{space.4}` → becomes 16px
   - These give meaning to the primitives

3. **Themes** = Just color overrides (and occasionally shadows)
   - Each theme file only contains what changes
   - Default: warm light colors
   - Soft: softer light colors, pure white surface
   - Noir: dark colors, stronger shadows

## Building CSS

Run this command:
```bash
node build-tokens.js
```

This generates `dist/tokens.css` with:
```css
:root {
  --space-4: 16px;
  --color-bg: #fdfcfb;
  --role-body-size: 16px;
  /* ... all your tokens */
}

[data-theme="soft"] {
  --color-bg: #f6f2ec;
  --color-surface: #ffffff;
  /* ... color overrides */
}

[data-theme="noir"] {
  --color-bg: #0e0e0e;
  --color-text: #f6f2ec;
  /* ... color overrides */
}
```

## Using in HTML

```html
<link rel="stylesheet" href="dist/tokens.css">

<!-- Default theme -->
<body>
  <div style="background: var(--color-bg); padding: var(--space-4);">
    <p style="font-size: var(--role-body-size);">Hello</p>
  </div>
</body>

<!-- Soft theme -->
<body data-theme="soft">
  <!-- Same markup, different colors -->
</body>

<!-- Noir theme -->
<body data-theme="noir">
  <!-- Same markup, different colors -->
</body>
```

## Editing Themes (Your Skin Editor)

**To change a theme's colors:**
1. Open `themes/default.json` (or soft.json, or noir.json)
2. Change the hex values
3. Run `node build-tokens.js`
4. CSS updates automatically

**Example - changing Default theme's background:**
```json
{
  "color": {
    "bg": { "value": "#ffffff", "type": "color" }  // Changed from #fdfcfb
  }
}
```

**Your skin editor should:**
- Read from these theme JSON files
- Let you edit the color values
- Write back to the JSON files
- Trigger `build-tokens.js` to regenerate CSS

## What You Can't Edit in Themes

Themes should ONLY contain colors (and maybe shadows). These stay in primitives/semantics:
- ❌ Spacing values
- ❌ Font sizes
- ❌ Border radius
- ❌ Typography roles

If you want different spacing in a theme, that's a different system (not covered here).

## Adding New Primitives

Edit `primitives.json`:
```json
{
  "space": {
    "11": { "value": 160, "type": "dimension" }  // New spacing value
  }
}
```

## Adding New Semantic Roles

Edit `semantics.json`:
```json
{
  "role": {
    "caption": {
      "size": { "value": "{type.size.1}" },
      "weight": { "value": "{type.weight.regular}" }
    }
  }
}
```

## GitHub Setup

Replace your current `tokens/core.json` with this structure:

```
your-repo/
└── tokens/
    ├── primitives.json
    ├── semantics.json
    ├── themes/
    │   ├── default.json
    │   ├── soft.json
    │   └── noir.json
    └── build-tokens.js
```

## Automation (GitHub Actions)

Create `.github/workflows/build-tokens.yml`:
```yaml
name: Build Tokens

on:
  push:
    paths:
      - 'tokens/**'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd tokens && node build-tokens.js
      - run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add tokens/dist/tokens.css
          git commit -m "Update compiled tokens" || exit 0
          git push
```

Now every time you push token changes, CSS auto-generates.

## Next Steps

1. ✅ Put these files in your GitHub repo
2. ✅ Run `node build-tokens.js` to generate CSS
3. ✅ Use the CSS in your editorial structures
4. ✅ Build your skin editor to edit the theme JSON files
5. ✅ Set up GitHub Actions for automation

That's it. No Figma, no plugins, just JSON → CSS → websites.
