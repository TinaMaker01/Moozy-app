# Moozy Priority Improvements

This document outlines the priority improvements for the Moozy mobile application, categorized by impact and effort.

## High Priority

### 1. Fix Critical Startup Crash
* **Action**: Add missing `StyleSheet` import in `App.tsx`.
* **Expected Impact**: Restores application stability and allows it to boot successfully.
* **Estimated Effort**: Very Low (< 5 minutes).

### 2. Complete Core Navigation
* **Action**: Integrate `DashboardScreen` and `ProfileScreen` into `AppNavigator.tsx`.
* **Expected Impact**: Provides users access to all main functional areas of the app.
* **Estimated Effort**: Low (15 minutes).

## Medium Priority

### 1. Fix Development Environment
* **Action**: Migrate ESLint to v10 compatible config and fix Jest configuration/mocks.
* **Expected Impact**: Enables automated testing and linting, ensuring code quality and preventing regressions.
* **Estimated Effort**: Medium (1 hour).

### 2. Enhance Player Controller
* **Action**: Implement state tracking for "Now Playing" and progress bar in `PlayerController.tsx`.
* **Expected Impact**: Improves UX by providing real-time feedback on playback status.
* **Estimated Effort**: Medium (2 hours).

## Low Priority

### 1. Functional Settings
* **Action**: Implement Dark Mode and Notification toggles in `SettingsScreen.tsx`.
* **Expected Impact**: Enhances personalization and user engagement.
* **Estimated Effort**: Medium (3 hours).

### 2. Real Data Integration
* **Action**: Replace `MOCK_TRACKS` in `LibraryScreen.tsx` with data fetched from an API or local storage.
* **Expected Impact**: Transforms the app from a prototype to a functional tool.
* **Estimated Effort**: High (4+ hours).
