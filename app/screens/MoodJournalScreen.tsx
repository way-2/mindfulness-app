import { View } from "react-native";
import { useTheme } from "react-native-paper";
import Fab from "../components/Fab";
import MoodJournalCalendar from "../components/MoodJournalCalendar";

export default function MoodJournal() {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <MoodJournalCalendar />
      <Fab />
    </View>
  );
}
