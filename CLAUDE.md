# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Solito monorepo that enables cross-platform development with Expo (React Native) and Next.js using shared components and navigation. Solito allows you to write code once and run it on both mobile and web platforms.

## Architecture

### Monorepo Structure
- `apps/expo` - React Native mobile app using Expo SDK 54
- `apps/next` - Next.js 16 web app with App Router
- `packages/app` - Shared code, components, and features used by both platforms

### Key Design Patterns
- **Feature-based organization**: Code is organized by features in `packages/app/features/` rather than by file type
- **Shared navigation**: Uses Solito's cross-platform navigation with React Navigation 7
- **Provider pattern**: Shared providers wrap both apps in `packages/app/provider/`
- **Platform-specific overrides**: Uses `.native.tsx` extensions for React Native specific implementations

### Navigation Architecture
- **Mobile**: Uses React Navigation's native stack navigator in `packages/app/navigation/native/index.tsx`
- **Web**: Uses Next.js App Router with file-based routing
- **Cross-platform**: Solito provides unified navigation hooks like `useRouter` and `useParams`

## Development Commands

### Root Level Commands
```bash
# Install dependencies
yarn

# Start development servers
yarn native    # Start Expo development server (cd apps/expo && yarn start)
yarn web       # Start Next.js development server (cd apps/next && yarn next)

# Build across monorepo
npx turbo run build
```

### Platform-Specific Commands

#### Next.js (Web)
```bash
cd apps/next
yarn dev       # Start development server
yarn build     # Build for production
yarn start     # Start production server
yarn lint      # Run ESLint
```

#### Expo (Mobile)
```bash
cd apps/expo
yarn start     # Start Expo development server
yarn android   # Run on Android
yarn ios       # Run on iOS
```

## Dependency Management

### Pure JavaScript Dependencies
Install in `packages/app` for cross-platform usage:
```bash
cd packages/app
yarn add <package>
cd ../..
yarn
```

### Native Dependencies
Install in `apps/expo` for React Native modules:
```bash
cd apps/expo
yarn add <react-native-package>
cd ../..
yarn
```

⚠️ **Important**: If installing native dependencies in `packages/app`, ensure exact same version is installed in both `apps/expo` and `apps/next`.

## Code Organization

### Features Structure
- `packages/app/features/` - Contains feature-based modules
- Each feature can contain screens, components, hooks, and logic
- Avoid creating separate `screens` folders - organize by feature instead

### Providers
- `packages/app/provider/` - Shared app providers
- Safe area provider handles platform differences
- Navigation provider wraps platform-specific navigation

### Platform-Specific Code
- Use `.native.tsx` extension for React Native specific files
- Use `.tsx` extension for shared/Web-specific files
- Example: `index.native.tsx` and `index.tsx` for platform implementations

## Development Workflow

1. **Make changes to shared code** in `packages/app/`
2. **Test on both platforms** using `yarn web` and `yarn native`
3. **For mobile testing**: Build dev client first with `expo run:ios` or `eas build`
4. **Run expo start** after dev client is built

## Technology Stack

- **React**: 19.1.0 with React Compiler experimental support
- **Expo**: SDK 54 with latest features
- **Next.js**: 16.0.0-beta with App Router
- **Navigation**: React Navigation 7 + Solito for cross-platform routing
- **Animation**: Moti for cross-platform animations
- **Styling**: Dripsy for design system (implied from dependencies)
- **Build**: Turborepo for monorepo builds

## File Naming Conventions

- Use kebab-case for file names
- Feature folders contain related components
- Screen components are named `[feature]-screen.tsx`
- Platform-specific files use `.native.tsx` extension