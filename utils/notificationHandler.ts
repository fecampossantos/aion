import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';

export class NotificationHandler {
  private static instance: NotificationHandler;

  public static getInstance(): NotificationHandler {
    if (!NotificationHandler.instance) {
      NotificationHandler.instance = new NotificationHandler();
    }
    return NotificationHandler.instance;
  }

  async initialize() {
    // Set up notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    // Handle notification responses (when user taps notification)
    Notifications.addNotificationResponseReceivedListener(this.handleNotificationResponse);

    // Handle notifications received while app is in foreground
    Notifications.addNotificationReceivedListener(this.handleNotificationReceived);
  }

  private handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    const data = response.notification.request.content.data;
    
    if (data && data.taskId && (data.action === 'timer_running' || data.action === 'timer_paused')) {
      // Navigate to the task page
      this.navigateToTask(data.taskId as string, data.projectId as string);
    }
  };

  private handleNotificationReceived = (notification: Notifications.Notification) => {
    // Handle notifications received while app is in foreground
    // You can customize this behavior if needed
    console.log('Notification received while app is active:', notification);
  };

  private navigateToTask(taskId: string, projectId?: string) {
    try {
      if (projectId) {
        // Navigate directly if we have the project ID
        router.push({
          pathname: '/Task',
          params: {
            taskID: taskId,
            projectID: projectId,
            taskName: '', // We could also store task name in notification data
          },
        });
      } else {
        // If no project ID, navigate to home and let user find the task
        router.push('/');
      }
    } catch (error) {
      console.error('Failed to navigate to task:', error);
      // Fallback: navigate to home
      router.push('/');
    }
  }

  async scheduleTimerNotification(taskName: string, taskId: string, projectId?: string): Promise<string> {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `${taskName} - 00:00:00`,
        body: 'Timer is running - tap to open',
        data: {
          taskId: taskId,
          projectId: projectId,
          action: 'timer_running',
        },
      },
      trigger: null,
    });

    return notificationId;
  }

  async updateTimerNotification(
    notificationId: string,
    taskName: string,
    timeString: string,
    taskId: string,
    projectId?: string
  ): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${taskName} - ${timeString}`,
        body: 'Timer is running - tap to open',
        data: {
          taskId: taskId,
          projectId: projectId,
          action: 'timer_running',
        },
      },
      identifier: notificationId,
      trigger: null,
    });
  }

  async dismissNotification(notificationId: string): Promise<void> {
    await Notifications.dismissNotificationAsync(notificationId);
  }

  cleanup() {
    // Remove listeners if needed
    // Note: Expo notifications doesn't have removeAllNotificationListeners
    // Individual listeners are removed automatically when the app unmounts
  }
}

export default NotificationHandler;