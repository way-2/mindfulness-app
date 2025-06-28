import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useDatabase } from "../context/DatabaseContext";
import { getAllReminders, getSetting, setSetting } from "../utils/Database";

export default function DailyPhrase() {
  const { db, initialized } = useDatabase();
  const [dailyPhrase, setDailyPhrase] = useState("");
  const [phrases, setPhrases] = useState<string[]>([]);
  const theme = useTheme();

  useEffect(() => {
    const fetchPhrases = async () => {
      if (initialized && db) {
        try {
          const results = await getAllReminders();
          setPhrases(results.map((row) => row));
        } catch (error) {
          console.error("Failed to fetch phrases:", error);
          setPhrases([]);
        }
      }
    };
    fetchPhrases();
  }, [initialized, db]);

  const getPhraseForToday = useCallback(async () => {
    if (!db || phrases.length === 0) return "No phrase available";

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight
    const todayStr = today.toISOString();

    const lastUpdate = await getSetting("daily_phrase_last_updated");

    const lastPhrase = await getSetting("current_daily_phrase");

    if (lastUpdate === todayStr && lastPhrase) {
      return lastPhrase; // Return the cached phrase if it exists
    }

    const randomIndex = Math.floor(Math.random() * phrases.length);
    const phrase = phrases[randomIndex];

    await setSetting("daily_phrase_last_updated", todayStr);
    await setSetting("current_daily_phrase", phrase);
    return phrase;
  }, [db, phrases]);

  useEffect(() => {
    let timeoutId: number;

    const setPhrase = async () => {
      const phrase = await getPhraseForToday();
      setDailyPhrase(phrase);
    };

    setPhrase();

    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setHours(24, 0, 0, 0); // Set to next midnight
    const timeUntilMidnight = nextMidnight.getTime() - now.getTime();

    timeoutId = setTimeout(() => {
      setPhrase();
    }, timeUntilMidnight);

    return () => clearTimeout(timeoutId);
  }, [getPhraseForToday]);

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Text variant="headlineLarge" style={styles.headline}>
        {dailyPhrase}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 0.2,
    justifyContent: "center",
  },
  headline: {
    textAlign: "center",
  },
});
