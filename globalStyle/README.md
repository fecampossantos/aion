# Global Style System

This directory contains the centralized theme system for the Aion app, providing consistent design tokens, colors, spacing, and component styles across the entire application.

## 🎨 Available Theme Exports

### Colors
```typescript
import { colors } from '../../globalStyle/theme';

// Primary colors (blue scale)
colors.primary[500] // Main primary color
colors.primary[600] // Darker variant

// Neutral colors (gray scale)
colors.neutral[800] // Dark background
colors.neutral[600] // Border color
colors.neutral[400] // Muted text

// Semantic colors
colors.success[500] // Success state
colors.warning[500] // Warning state
colors.error[500]   // Error state

// Transparent variants
colors.transparent.white[10] // 10% white overlay
colors.transparent.black[20] // 20% black overlay
```

### Spacing
```typescript
import { spacing } from '../../globalStyle/theme';

spacing.xs    // 4px
spacing.sm    // 8px
spacing.md    // 12px
spacing.lg    // 16px
spacing.xl    // 20px
spacing['2xl'] // 24px
spacing['3xl'] // 32px
spacing['4xl'] // 40px
spacing['5xl'] // 48px
spacing['6xl'] // 64px
```

### Border Radius
```typescript
import { borderRadius } from '../../globalStyle/theme';

borderRadius.none   // 0px
borderRadius.sm     // 4px
borderRadius.md     // 8px
borderRadius.lg     // 12px
borderRadius.xl     // 16px
borderRadius['2xl'] // 20px
borderRadius['3xl'] // 24px
borderRadius.full   // 9999px (circular)
```

### Shadows
```typescript
import { shadows } from '../../globalStyle/theme';

shadows.sm  // Small shadow
shadows.md  // Medium shadow
shadows.lg  // Large shadow
shadows.xl  // Extra large shadow

// Usage example
container: {
  ...shadows.lg,
  // This spreads all shadow properties
}
```

### Typography
```typescript
import { typography } from '../../globalStyle/theme';

// Font families
typography.fontFamily.regular
typography.fontFamily.medium
typography.fontFamily.bold

// Font sizes
typography.fontSize.xs     // 12px
typography.fontSize.sm     // 14px
typography.fontSize.md     // 16px
typography.fontSize.lg     // 18px
typography.fontSize.xl     // 20px
typography.fontSize['2xl'] // 24px

// Line heights
typography.lineHeight.tight   // 1.25
typography.lineHeight.normal  // 1.5
typography.lineHeight.relaxed // 1.75
```

### Components
```typescript
import { components } from '../../globalStyle/theme';

// Pre-configured component styles
components.card.height           // 72px
components.card.paddingHorizontal // 20px
components.card.borderRadius     // 16px
components.card.backgroundColor  // neutral[800]

components.button.height         // 48px
components.button.paddingHorizontal // 16px
components.button.borderRadius   // 12px

components.input.height          // 48px
components.input.borderColor     // neutral[600]
```

## 🚀 Migration Guide

### Before (Old globalStyle)
```typescript
import globalStyle from "../../globalStyle";

const styles = StyleSheet.create({
  container: {
    backgroundColor: globalStyle.black.light,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  text: {
    color: globalStyle.white,
    fontFamily: globalStyle.font.medium,
  },
});
```

### After (New Theme System)
```typescript
import { theme } from "../../globalStyle/theme";

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.neutral[800],
    paddingHorizontal: theme.spacing['2xl'],
    borderRadius: theme.borderRadius.md,
  },
  text: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.md,
  },
});
```

## 🎯 Best Practices

1. **Use semantic color names**: Instead of hardcoded hex values, use semantic names like `colors.primary[500]` or `colors.neutral[800]`

2. **Leverage spacing scale**: Always use the predefined spacing values instead of arbitrary numbers

3. **Use component presets**: For common UI patterns, use the pre-configured component styles

4. **Maintain consistency**: Use the same color, spacing, and typography values across similar components

5. **Import only what you need**: Import specific parts of the theme instead of the entire theme object when possible

## 🔄 Backward Compatibility

The old `globalStyle` is still exported for backward compatibility, but new components should use the theme system. Existing components can be gradually migrated without breaking changes.

## 🎨 Customization

To add new theme values or modify existing ones:

1. Add the new value to the appropriate section in `theme.ts`
2. Export it from the main theme object
3. Update this documentation
4. Consider adding it to the `components` section if it's component-specific

## 📱 Platform Considerations

- **Shadows**: Use `...shadows.lg` for iOS and `elevation: shadows.lg.elevation` for Android
- **Colors**: All colors are platform-agnostic
- **Spacing**: All spacing values work consistently across platforms
- **Typography**: Font families should be available on both platforms
