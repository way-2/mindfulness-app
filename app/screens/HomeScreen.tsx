import { View } from "react-native";
import { useTheme } from "react-native-paper";
import CountdownTimer from "../components/CountdownTimer";
import DailyPhrase from "../components/DailyPhrase";

export default function HomeScreen() {
    const theme = useTheme();
    
    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background}}>
            <DailyPhrase />
            <CountdownTimer />
        </View>
    )

}
