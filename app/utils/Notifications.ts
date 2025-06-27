import * as Notifications from 'expo-notifications';
import { getSetting } from './Database';

export async function requestPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
}

export async function cancelNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function scheduleNotification(frequency: string) {
    let seconds: number;
    switch (frequency) {
        case '2hours':
            seconds = 7200;
            break;
        case '4hours':
            seconds = 14400;
            break;
        case '6hours':
            seconds = 21600;
            break;
        case '8hours':
            seconds = 28800;
            break;
        case 'test':
            seconds = 10; // For testing purposes, set to 10 seconds
            break;
        case '1hour':
        default:
            seconds = 3600;
            break;
    };

    await cancelNotifications();

    let phrase = await getSetting('current_daily_phrase');
    if (!phrase) {
        phrase = "Take a moment to breathe and reflect.";
    }

    await Notifications.scheduleNotificationAsync({
        content: {
            body: phrase
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: seconds,
            repeats: true,
        },
    });

}