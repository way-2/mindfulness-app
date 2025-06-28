import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";
import Fab from "../components/Fab";
import MoodJournalCalendar from "../components/MoodJournalCalendar";
import { addMoodJournalEntry, getMoodJournalEntries } from "../utils/Database";

export default function MoodJournal() {
  const theme = useTheme();
  const [entries, setEntries] = useState([]);

  const fetchEntries = async () => {
    const data = await getMoodJournalEntries();
    setEntries(data);
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleAddEntry = async ({ feeling, notes }) => {
    await addMoodJournalEntry(feeling, notes);
    fetchEntries(); // Refresh entries after adding
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <MoodJournalCalendar entries={entries} />
      <Fab onAddEntry={handleAddEntry} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 10,
  },
});
