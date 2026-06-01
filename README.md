# Moozy

A React Native application providing a profile view and a data dashboard.

## Prerequisites
- Node.js (>=18)
- React Native development environment set up (Android Studio/Xcode)

## Installation

1. Clone the repository (if applicable) and navigate to the project directory:
   ```bash
   cd Moozy
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Running on a Physical Device

### Prerequisites
- Enable **Developer Options** and **USB Debugging** on your smartphone.
- Connect your device to your computer via USB.

### Run Command
Once the device is detected (`adb devices` for Android, `xcrun xctrace list devices` for iOS), run:

```bash
# Android
npx react-native run-android

# iOS
npx react-native run-ios --device
```

## Project Structure
```text
├── android/            # Native Android configuration
├── ios/                # Native iOS configuration
├── src/                # Application source code
│   ├── components/     # Shared UI components
│   ├── navigation/     # App navigation configuration
│   └── screens/        # Screen components
├── App.tsx             # Entry point
├── index.js            # JavaScript bundle entry
├── metro.config.js     # Metro bundler config
├── package.json        # Dependencies and scripts
└── tsconfig.json       # TypeScript configuration
```
