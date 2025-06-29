import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { Card, Icon, Text, useTheme } from "react-native-paper";
import relieved_emoticon from "../../assets/images/relieved_emoticon.png";

const moodToIcon: Record<string, string> = {
  Excited: "emoticon-excited-outline",
  Happy: "emoticon-happy-outline",
  Neutral: "emoticon-neutral-outline",
  Sad: "emoticon-sad-outline",
  Angry: "emoticon-angry-outline"
};

function formatDate(ts: number) {
  const d = new Date(ts);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function MoodJournalCalendar({entries}) {
  const theme = useTheme();
  const [markedDates, setMarkedDates] = useState({});
  const [entriesByDate, setEntriesByDate] = useState<Record<string, any[]>>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    const marks: Record<string, any> = {};
    const byDate: Record<string, any[]> = {};
    entries.forEach((entry) => {
      const dateStr = formatDate(entry.id);
      marks[dateStr] = {
        marked: true,
        dotColor: theme.colors.primary,
      };
      if (!byDate[dateStr]) byDate[dateStr] = [];
      byDate[dateStr].push(entry);
    });
    setMarkedDates(marks);
    setEntriesByDate(byDate);
  }, [entries, theme.colors.primary]);

  // Highlight selected date
  const calendarMarkedDates = {
    ...markedDates,
    ...(selectedDate && {
      [selectedDate]: {
        ...(markedDates[selectedDate] || {}),
        selected: true,
        selectedColor: theme.colors.primaryContainer,
      },
    }),
  };

  return (
    <View style={styles.container}>
        <Text variant="headlineSmall" style={styles.headline}>Mood Journal</Text>
      <Calendar
        markedDates={calendarMarkedDates}
        onDayPress={(day) => {
          setSelectedDate(day.dateString);
        }}
        theme={{
          backgroundColor: theme.colors.background,
          calendarBackground: theme.colors.background,
          todayTextColor: theme.colors.primary,
          dotColor: theme.colors.primary,
        }}
      />
      {selectedDate && entriesByDate[selectedDate] && (
        <ScrollView style={{ margin: 12, flexGrow: 0 }}>
          {entriesByDate[selectedDate].map((entry, idx) => (
            <Card
              key={idx}
              style={{
                marginBottom: 8,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Card.Content
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <Icon
                  source={moodToIcon[entry.mood] || relieved_emoticon}
                  size={32}
                  color={theme.colors.primary}
                />
                <View style={{flexDirection: "column", marginLeft: 10 }}>
                  {/* Display formatted timestamp */}
                  <Text
                    variant="labelSmall"
                    style={{ color: theme.colors.onSurfaceVariant }}
                  >
                    {new Date(entry.id).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                  {entry.notes ? (
                    <Text variant="bodyMedium" style={{ marginTop: 2, marginEnd: 35 }}>
                      {entry.notes}
                    </Text>
                  ) : null}
                </View>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    paddingTop: 25,
  },
  headline: {
    textAlign: "center"
  }
});