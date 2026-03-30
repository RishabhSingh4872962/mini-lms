import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function scheduleBookmarkMilestoneNotification(): Promise<void> {
  const granted = await requestNotificationPermission();
  if (!granted) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "🎯 Nice collection!",
      body: "You've bookmarked 5 courses. Time to start one!",
      data: { type: "bookmark_milestone" },
    },
    trigger: null, // immediate
  });
}

export async function scheduleReminderNotification(): Promise<void> {
  const granted = await requestNotificationPermission();
  if (!granted) return;

  // Cancel any existing reminders first
  await Notifications.cancelAllScheduledNotificationsAsync();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "📚 We miss you!",
      body: "You haven't learned anything today. Pick up where you left off!",
      data: { type: "daily_reminder" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 60 * 60 * 24, // 24 hours
      repeats: false,
    },
  });
}

export async function cancelReminderNotification(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
