import { StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";
import CountdownTimer from "../components/CountdownTimer";
import DailyPhrase from "../components/DailyPhrase";

export default function HomeScreen() {
    const theme = useTheme();
    
    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background}]}>
            <DailyPhrase />
            <CountdownTimer />
        </View>
    )

}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    paddingTop: 80,
    paddingHorizontal: 10,
  },
});