import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Dialog, List, Portal, RadioButton, Snackbar, Switch, useTheme } from "react-native-paper";
import { useDatabase } from "../context/DatabaseContext";
import { getSetting, setSetting } from "../utils/Database";
import { cancelNotifications, requestPermissions, scheduleNotification } from "../utils/Notifications";

export default function SettingScreen() {
  const {db, initialized} = useDatabase(); 
    const theme = useTheme();
    // State for notification toggle
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  // State for notification frequency selection
  const [notificationFrequency, setNotificationFrequency] = useState('1hour'); // Default frequency
  // State to control visibility of the frequency selection dialog
  const [showFrequencyDialog, setShowFrequencyDialog] = useState(false);

  // State for a general purpose Snackbar to show feedback
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      if (initialized && db) {
        try {
          const notificationsSetting = await getSetting('notifications_enabled');
          const frequencySetting = await getSetting('notification_frequency');

          if (notificationsSetting !== null) setNotificationsEnabled(notificationsSetting === 'true');
          if (frequencySetting !== null) setNotificationFrequency(frequencySetting || '1hour'); // Default to '1hour' if not set
        } catch (error) {
          console.error("Failed to load settings:", error);
        }
      }
    }
    loadSettings();
  }, [initialized, db]);

  // Toggles the notifications on/off
  const toggleNotifications = async () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);

    if (initialized && db) {
      try {
        await setSetting('notifications_enabled', newValue ? 'true' : 'false');
        showFeedbackSnackbar(`Notifications ${newValue ? 'enabled' : 'disabled'}`);

        if (newValue) {
          const granted = await requestPermissions();
          if (granted) {
            await scheduleNotification(notificationFrequency);
          } else {
            showFeedbackSnackbar("Notification permissions not granted. Please enable them in settings.");
            setNotificationsEnabled(false); // Disable notifications if permissions are not granted
            await setSetting('notifications_enabled', 'false');
          }
        } else {
          await cancelNotifications();
        }

      } catch (error) {
        showFeedbackSnackbar(`Failed to save setting.`);
        console.error(error);
      }
    }
  };

  // Opens the notification frequency selection dialog
  const handleOpenFrequencyDialog = () => setShowFrequencyDialog(true);
  // Closes the notification frequency selection dialog
  const handleCloseFrequencyDialog = () => setShowFrequencyDialog(false);

  // Options for notification frequency displayed in the dialog
  const frequencyOptions = [
    { label: 'Every Hour', value: '1hour' },
    { label: 'Every 2 Hours', value: '2hours' },
    { label: 'Every 4 Hours', value: '4hours' },
    { label: 'Every 6 Hours', value: '6hours' },
    { label: 'Every 8 Hours', value: '8hours' },
    { label: 'Test (10 seconds)', value: 'test' }, // For testing purposes
  ];

  // Handles the selection of a new notification frequency
  const handleSelectFrequency = async (value) => {
    const newFrequency = value;
    setNotificationFrequency(newFrequency);
    if (initialized && db) {
      try {
        await setSetting('notification_frequency', newFrequency);
        showFeedbackSnackbar(`Notification frequency set to: ${frequencyOptions.find(opt => opt.value === newFrequency)?.label}`);
        if (notificationsEnabled) {
          await scheduleNotification(newFrequency);
        }
      } catch (error) {
        showFeedbackSnackbar(`Failed to save frequency setting.`);
        console.error(error);
      }
    }
    handleCloseFrequencyDialog();
  };

  // Dismisses the Snackbar
  const onDismissSnackbar = () => setSnackbarVisible(false);

  // Helper function to show a Snackbar message
  const showFeedbackSnackbar = (message) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };
  
    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background, paddingTop: 40}}>
            <View style={styles.settingsContent}>
        {/* Notifications Section */}
        <List.Section title="Notifications">
          <List.Item
            title="Enable Notifications"
            description="Turn daily phrase and timer alerts on or off."
            left={() => <List.Icon icon="bell" />}
            right={() => (
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
              />
            )}
            onPress={toggleNotifications} // Allow tapping the whole row to toggle
          />
          <List.Item
            title="Notification Frequency"
            description={`Currently: ${frequencyOptions.find(opt => opt.value === notificationFrequency)?.label}`}
            left={() => <List.Icon icon="calendar-sync" />}
            onPress={handleOpenFrequencyDialog}
            disabled={!notificationsEnabled} // Disable if notifications are off
          />
        </List.Section>

        {/* About Section */}
        <List.Section title="About">
          <List.Item
            title="Version"
            description="1.0.0"
            left={() => <List.Icon icon="information" />}
          />
          <List.Item
            title="Privacy Policy"
            description="Read our privacy statement."
            left={() => <List.Icon icon="shield-lock" />}
            onPress={() => showFeedbackSnackbar("This is a placeholder for your privacy policy content.")}
          />
        </List.Section>
      </View>

      {/* Notification Frequency Selection Dialog (Portal allows it to render on top) */}
      <Portal>
        <Dialog visible={showFrequencyDialog} onDismiss={handleCloseFrequencyDialog}>
          <Dialog.Title>Notification Frequency</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group onValueChange={handleSelectFrequency} value={notificationFrequency}>
              {frequencyOptions.map((option) => (
                <RadioButton.Item
                  key={option.value}
                  label={option.label}
                  value={option.value}
                  position="leading" // Puts the radio button on the left of the text
                  style={styles.dialogListItem}
                />
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={handleCloseFrequencyDialog}>Cancel</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Snackbar for showing various feedback messages */}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={onDismissSnackbar}
        action={{
          label: 'Got It',
          onPress: () => {
            onDismissSnackbar();
          },
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
        
    )
}

const styles = StyleSheet.create({
  settingsContent: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  dialogListItem: {
    paddingVertical: 10,
  }
});