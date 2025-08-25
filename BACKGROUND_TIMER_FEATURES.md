# Background Timer & Notification Features

## Overview

This document describes the two new features added to the Aion timer app:

1. **Background Timer**: Keep the timer running when the app is minimized or closed
2. **Persistent Notifications**: Show ongoing notifications with timer status and click-to-open functionality

## Features Added

### 1. Background Timer Functionality

The timer now continues running even when the app is in the background or completely closed.

**Key Components:**
- `utils/backgroundTimer.ts` - Main background timer service
- `expo-task-manager` and `expo-background-fetch` - Background task execution
- AsyncStorage - Persistent timer state storage

**How it works:**
- When a timer starts, it's registered as a background task
- Timer state is stored in AsyncStorage for persistence
- Background fetch runs every 15+ seconds to update timer state
- App syncs with background timer when returning to foreground

### 2. Persistent Notifications

When a timer is running, a persistent notification appears in the phone's notification center.

**Key Components:**
- `utils/notificationHandler.ts` - Notification management service
- `expo-notifications` - Notification display and handling
- Deep linking - Navigation when notification is tapped

**Features:**
- Shows current task name and elapsed time in notification
- Updates every 5 seconds when app is active
- Updates every 15+ seconds when app is in background
- Tapping notification opens the app to the specific task page
- Notification automatically dismisses when timer stops

## Implementation Details

### Background Timer Service (`utils/backgroundTimer.ts`)

```typescript
export class BackgroundTimer {
  // Singleton pattern for global timer state
  static getInstance(): BackgroundTimer
  
  // Initialize background tasks and permissions
  async initialize()
  
  // Start timer with task info
  async startTimer(taskName: string, taskId: string, projectId?: string)
  
  // Stop timer and return total elapsed time
  async stopTimer(): Promise<number>
  
  // Pause/resume functionality
  async pauseTimer()
  async resumeTimer()
  
  // Get current timer state
  async getCurrentTime()
  async isRunning()
}
```

### Notification Handler (`utils/notificationHandler.ts`)

```typescript
export class NotificationHandler {
  // Singleton pattern for notification management
  static getInstance(): NotificationHandler
  
  // Set up notification permissions and handlers
  async initialize()
  
  // Create timer notification
  async scheduleTimerNotification(taskName, taskId, projectId?)
  
  // Update existing notification with new time
  async updateTimerNotification(notificationId, taskName, timeString, taskId, projectId?)
  
  // Handle notification tap to navigate to task
  private handleNotificationResponse()
}
```

### Updated Timer Hook (`components/Timer/useTimer.ts`)

The existing timer hook was enhanced to:
- Use the background timer service instead of local setInterval
- Sync with background timer on app state changes
- Handle persistent notifications
- Maintain existing UI behavior

## Configuration Changes

### App Configuration (`app.json`)

Added required permissions and plugins:

```json
{
  "android": {
    "permissions": [
      "android.permission.WAKE_LOCK",
      "android.permission.FOREGROUND_SERVICE"
    ]
  },
  "ios": {
    "infoPlist": {
      "UIBackgroundModes": [
        "background-fetch",
        "background-processing"
      ]
    }
  },
  "plugins": [
    "expo-task-manager",
    "expo-background-fetch"
  ]
}
```

### Dependencies Added

```json
{
  "expo-task-manager": "latest",
  "expo-background-fetch": "latest"
}
```

## User Experience

### Timer Behavior
1. **Start Timer**: User taps play button, timer starts and notification appears
2. **Background Mode**: User minimizes/closes app, timer continues running
3. **Notification Updates**: Time updates in notification every 5-15 seconds
4. **Return to App**: Timer syncs with background state when app reopens
5. **Notification Tap**: Tapping notification opens app to the specific task
6. **Stop Timer**: Timer stops and notification automatically dismisses

### Notification Content
- **Title**: `TaskName - HH:MM:SS` (e.g., "Website Design - 01:23:45")
- **Body**: "Timer is running - tap to open" or "Timer paused - tap to open"
- **Action**: Tapping opens the app to the specific task page

## Technical Notes

### Background Task Limitations
- iOS: Background tasks have time limits (usually 30 seconds to 10 minutes)
- Android: More permissive but may be killed by battery optimization
- Background fetch frequency is controlled by the system, not the app

### Notification Updates
- Active app: Updates every 5 seconds for smooth UI
- Background mode: Updates every 15+ seconds via background fetch
- System may throttle background updates based on app usage patterns

### Data Persistence
- Timer state stored in AsyncStorage
- Survives app restarts and system reboots
- Automatically cleaned up when timer stops

## Testing

To test the new features:

1. Start a timer on any task
2. Minimize the app - notification should appear
3. Wait and observe time updates in notification
4. Tap notification - should open to the task page
5. Close app completely and reopen - timer should still be running
6. Stop timer - notification should disappear

## Troubleshooting

### Timer Not Running in Background
- Check notification permissions are granted
- Verify background app refresh is enabled
- Check battery optimization settings (Android)

### Notifications Not Appearing
- Ensure notification permissions are granted
- Check Do Not Disturb settings
- Verify app notification settings in system preferences

### Navigation Not Working
- Ensure deep linking is properly configured
- Check that task and project IDs are valid
- Verify expo-router navigation setup