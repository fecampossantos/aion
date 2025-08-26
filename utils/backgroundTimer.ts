import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationHandler } from './notificationHandler';

const BACKGROUND_TIMER_TASK = 'background-timer-task';
const TIMER_STORAGE_KEY = 'background_timer_data';

export interface TimerData {
  isRunning: boolean;
  startTime: number;
  taskName: string;
  taskId: string;
  projectId?: string;
  elapsedTime: number;
  notificationId?: string;
}

// Define the background task
TaskManager.defineTask(BACKGROUND_TIMER_TASK, async () => {
  try {
    const timerDataString = await AsyncStorage.getItem(TIMER_STORAGE_KEY);
    if (!timerDataString) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const timerData: TimerData = JSON.parse(timerDataString);
    
    if (!timerData.isRunning) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    // Calculate current elapsed time
    const currentTime = Date.now();
    const totalElapsed = Math.floor((currentTime - timerData.startTime) / 1000);
    
    // Update stored data
    const updatedTimerData: TimerData = {
      ...timerData,
      elapsedTime: totalElapsed
    };
    
    await AsyncStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(updatedTimerData));

    // Update notification with current time
    if (timerData.notificationId) {
      const hours = Math.floor(totalElapsed / 3600);
      const minutes = Math.floor((totalElapsed % 3600) / 60);
      const seconds = totalElapsed % 60;
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      const notificationHandler = NotificationHandler.getInstance();
      await notificationHandler.updateTimerNotification(
        timerData.notificationId,
        timerData.taskName,
        timeString,
        timerData.taskId,
        timerData.projectId
      );
    }

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Background timer task error:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export class BackgroundTimer {
  private static instance: BackgroundTimer;
  private updateInterval: NodeJS.Timeout | null = null;

  public static getInstance(): BackgroundTimer {
    if (!BackgroundTimer.instance) {
      BackgroundTimer.instance = new BackgroundTimer();
    }
    return BackgroundTimer.instance;
  }

  async initialize() {
    try {
      // Request notification permissions
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permissions not granted');
      }

      // Set notification handler
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });

      // Register background fetch task
      await BackgroundFetch.registerTaskAsync(BACKGROUND_TIMER_TASK, {
        minimumInterval: 1, // 15 seconds minimum interval
        stopOnTerminate: false,
        startOnBoot: true,
      });

      console.log('Background timer initialized');
    } catch (error) {
      console.error('Failed to initialize background timer:', error);
    }
  }

  async startTimer(taskName: string, taskId: string, projectId?: string): Promise<string | null> {
    try {
      const startTime = Date.now();
      
      // Schedule persistent notification using NotificationHandler
      const notificationHandler = NotificationHandler.getInstance();
      const notificationId = await notificationHandler.scheduleTimerNotification(taskName, taskId, projectId);

      const timerData: TimerData = {
        isRunning: true,
        startTime,
        taskName,
        taskId,
        projectId,
        elapsedTime: 0,
        notificationId
      };

      await AsyncStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timerData));
      
      // Start local update interval for when app is active
      this.startLocalUpdates();
      
      return notificationId;
    } catch (error) {
      console.error('Failed to start background timer:', error);
      return null;
    }
  }

  async stopTimer(): Promise<number> {
    try {
      const timerDataString = await AsyncStorage.getItem(TIMER_STORAGE_KEY);
      if (!timerDataString) {
        return 0;
      }

      const timerData: TimerData = JSON.parse(timerDataString);
      
      // Calculate final elapsed time
      const currentTime = Date.now();
      const totalElapsed = Math.floor((currentTime - timerData.startTime) / 1000);

      // Clear timer data
      await AsyncStorage.removeItem(TIMER_STORAGE_KEY);
      
      // Dismiss notification
      if (timerData.notificationId) {
        const notificationHandler = NotificationHandler.getInstance();
        await notificationHandler.dismissNotification(timerData.notificationId);
      }
      
      // Stop local updates
      this.stopLocalUpdates();
      
      return totalElapsed;
    } catch (error) {
      console.error('Failed to stop background timer:', error);
      return 0;
    }
  }

  async pauseTimer(): Promise<void> {
    try {
      const timerDataString = await AsyncStorage.getItem(TIMER_STORAGE_KEY);
      if (!timerDataString) {
        return;
      }

      const timerData: TimerData = JSON.parse(timerDataString);
      
      // Calculate elapsed time up to pause
      const currentTime = Date.now();
      const elapsedTime = Math.floor((currentTime - timerData.startTime) / 1000);
      
      const updatedTimerData: TimerData = {
        ...timerData,
        isRunning: false,
        elapsedTime
      };

      await AsyncStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(updatedTimerData));
      
      // Update notification to show paused state
      if (timerData.notificationId) {
        const hours = Math.floor(elapsedTime / 3600);
        const minutes = Math.floor((elapsedTime % 3600) / 60);
        const seconds = elapsedTime % 60;
        const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `${timerData.taskName} - ${timeString}`,
            body: 'Timer paused - tap to open',
            data: {
              taskId: timerData.taskId,
              projectId: timerData.projectId,
              action: 'timer_paused'
            }
          },
          identifier: timerData.notificationId,
          trigger: null,
        });
      }
      
      this.stopLocalUpdates();
    } catch (error) {
      console.error('Failed to pause background timer:', error);
    }
  }

  async resumeTimer(): Promise<void> {
    try {
      const timerDataString = await AsyncStorage.getItem(TIMER_STORAGE_KEY);
      if (!timerDataString) {
        return;
      }

      const timerData: TimerData = JSON.parse(timerDataString);
      
      // Calculate new start time accounting for elapsed time
      const currentTime = Date.now();
      const newStartTime = currentTime - (timerData.elapsedTime * 1000);
      
      const updatedTimerData: TimerData = {
        ...timerData,
        isRunning: true,
        startTime: newStartTime
      };

      await AsyncStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(updatedTimerData));
      
      // Start local updates again
      this.startLocalUpdates();
    } catch (error) {
      console.error('Failed to resume background timer:', error);
    }
  }

  async getCurrentTime(): Promise<{ hours: number; minutes: number; seconds: number } | null> {
    try {
      const timerDataString = await AsyncStorage.getItem(TIMER_STORAGE_KEY);
      if (!timerDataString) {
        return null;
      }

      const timerData: TimerData = JSON.parse(timerDataString);
      
      let totalElapsed: number;
      
      if (timerData.isRunning) {
        const currentTime = Date.now();
        totalElapsed = Math.floor((currentTime - timerData.startTime) / 1000);
      } else {
        totalElapsed = timerData.elapsedTime;
      }

      const hours = Math.floor(totalElapsed / 3600);
      const minutes = Math.floor((totalElapsed % 3600) / 60);
      const seconds = totalElapsed % 60;

      return { hours, minutes, seconds };
    } catch (error) {
      console.error('Failed to get current time:', error);
      return null;
    }
  }

  async isRunning(): Promise<boolean> {
    try {
      const timerDataString = await AsyncStorage.getItem(TIMER_STORAGE_KEY);
      if (!timerDataString) {
        return false;
      }

      const timerData: TimerData = JSON.parse(timerDataString);
      return timerData.isRunning;
    } catch (error) {
      console.error('Failed to check if timer is running:', error);
      return false;
    }
  }

  async getTimerData(): Promise<TimerData | null> {
    try {
      const timerDataString = await AsyncStorage.getItem(TIMER_STORAGE_KEY);
      if (!timerDataString) {
        return null;
      }

      return JSON.parse(timerDataString);
    } catch (error) {
      console.error('Failed to get timer data:', error);
      return null;
    }
  }

  private startLocalUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(async () => {
      try {
        const timerData = await this.getTimerData();
        if (!timerData || !timerData.isRunning) {
          this.stopLocalUpdates();
          return;
        }

        // Update notification every 5 seconds when app is active
        const currentTime = await this.getCurrentTime();
        if (currentTime && timerData.notificationId) {
          const timeString = `${currentTime.hours.toString().padStart(2, '0')}:${currentTime.minutes.toString().padStart(2, '0')}:${currentTime.seconds.toString().padStart(2, '0')}`;
          
          const notificationHandler = NotificationHandler.getInstance();
          await notificationHandler.updateTimerNotification(
            timerData.notificationId,
            timerData.taskName,
            timeString,
            timerData.taskId,
            timerData.projectId
          );
        }
      } catch (error) {
        console.error('Local update error:', error);
      }
    }, 1000); // Update every 5 seconds
  }

  private stopLocalUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  async cleanup(): Promise<void> {
    this.stopLocalUpdates();
    try {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_TIMER_TASK);
    } catch (error) {
      console.error('Failed to cleanup background timer:', error);
    }
  }
}

export default BackgroundTimer;