import { useMaterial3Theme } from '@pchmn/expo-material3-theme';
import { useMemo } from "react";
import { useColorScheme } from "react-native";
import { MD3DarkTheme, MD3LightTheme, Provider } from "react-native-paper";
import CustomBottomTabNavigator from './components/BottomTabNavigation';
import { DatabaseProvider } from './context/DatabaseContext';

export default function RootLayout() {

  const colorScheme = useColorScheme();
  const { theme } = useMaterial3Theme();

  const paperTheme = useMemo(
    () =>
      colorScheme === 'dark' ? { ...MD3DarkTheme, colors: theme.dark } : { ...MD3LightTheme, colors: theme.light },
    [colorScheme, theme]
  );

  return (
    <DatabaseProvider>
      <Provider theme={paperTheme}>
        <CustomBottomTabNavigator />
      </Provider>
    </DatabaseProvider>
  );
}