// src/components/ui/BottomNavigationBar.js

import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { colors, spacing, textSizes } from "../../theme";

export default function BottomNavigationBar({
  state,
  descriptors,
  navigation,
}) {
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];

        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        // Colors based on focus
        const color = isFocused ? colors.textPrimary : colors.textSecondary;

        // Icon from screen options
        const icon =
          options.tabBarIcon &&
          options.tabBarIcon({ focused: isFocused, color });

        return (
          <TouchableOpacity
            key={route.key}
            activeOpacity={0.8}
            onPress={onPress}
            style={styles.tabItem}
          >
            {/* Icon */}
            <View style={styles.iconContainer}>{icon}</View>

            {/* Label */}
            <Text
              style={[
                styles.label,
                { color, fontWeight: isFocused ? "600" : "500" },
              ]}
            >
              {label}
            </Text>

            {/* Active Indicator Dot */}
            {isFocused && <View style={styles.dot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.cardBG,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xs,
  },
  iconContainer: {
    marginBottom: 2,
  },
  label: {
    fontSize: textSizes.xs,
    marginTop: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textPrimary,
    marginTop: 3,
  },
});

// const Tab = createBottomTabNavigator();

// <Tab.Navigator
//   tabBar={(props) => <BottomNavigationBar {...props} />}
// >
//   <Tab.Screen
//     name="Home"
//     component={HomeScreen}
//     options={{
//       tabBarLabel: "Home",
//       tabBarIcon: ({ color }) => <HomeIcon size={22} color={color} />,
//     }}
//   />

//   <Tab.Screen
//     name="Categories"
//     component={CategoryScreen}
//     options={{
//       tabBarLabel: "Categories",
//       tabBarIcon: ({ color }) => <GridIcon size={22} color={color} />,
//     }}
//   />

//   <Tab.Screen
//     name="Cart"
//     component={CartScreen}
//     options={{
//       tabBarLabel: "Cart",
//       tabBarIcon: ({ color }) => <CartIcon size={22} color={color} />,
//     }}
//   />

//   <Tab.Screen
//     name="Account"
//     component={AccountScreen}
//     options={{
//       tabBarLabel: "Profile",
//       tabBarIcon: ({ color }) => <UserIcon size={22} color={color} />,
//     }}
//   />
// </Tab.Navigator>
