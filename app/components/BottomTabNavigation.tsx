import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { CommonActions } from "@react-navigation/native";
import { BottomNavigation, Icon } from "react-native-paper";
import HomeScreen from "../screens/HomeScreen";
import MoodJournal from "../screens/MoodJournalScreen";
import SettingScreen from "../screens/SettingsScreen";

const Tab = createBottomTabNavigator();

export default function CustomBottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        animation: 'shift', // This is a valid prop for the Tab.Navigator
        headerShown: false, // Often you'll want to hide the header for a bottom tab navigator
      }}
      tabBar={({ navigation, state, descriptors, insets }) => (
        <BottomNavigation.Bar
          navigationState={state}
          safeAreaInsets={insets}
          onTabPress={({ route, preventDefault }) => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (event.defaultPrevented) {
              preventDefault();
            } else {
              navigation.dispatch({
                ...CommonActions.navigate(route.name, route.params),
                target: state.key,
              });
            }
          }}
          renderIcon={({ route, focused, color }) => {
            const { options } = descriptors[route.key];
            return options.tabBarIcon?.({ focused, color, size: 24 }) || null;
          }}
          getLabelText={({ route }) => {
            const { options } = descriptors[route.key];
            const label =
              typeof options.tabBarLabel === 'string'
                ? options.tabBarLabel
                : typeof options.title === 'string'
                ? options.title
                : route.name;

            return label;
          }}
        />
      )}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon source={'home'} color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Mood Journal"
        component={MoodJournal}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon source={'notebook-outline'} color={color} size={26} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon source={'tune'} color={color} size={26} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}