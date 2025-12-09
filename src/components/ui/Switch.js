// src/components/ui/Switch.js

import React, { useEffect, useRef } from "react";
import { View, TouchableOpacity, Animated, StyleSheet } from "react-native";
import { colors, spacing, radius } from "../../theme";

export default function Switch({
  value = false,
  onChange = () => {},
  disabled = false,
  size = "md", // sm | md
  style = {},
}) {
  // Sizes for small and medium variants
  const sizeMap = {
    sm: { width: 40, height: 22, thumb: 16 },
    md: { width: 50, height: 28, thumb: 22 },
  };

  const s = sizeMap[size];

  // Animated value
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  // Update animation when value changes
  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [value]);

  // Interpolations
  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, s.width - s.thumb - 2], // thumb travel
  });

  const trackColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.gray300, colors.gray900], // OFF to ON
  });

  const thumbColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.white50, colors.white50], // always white thumb
  });

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled}
      onPress={() => onChange(!value)}
      style={[style, { opacity: disabled ? 0.5 : 1 }]}
    >
      {/* Track */}
      <Animated.View
        style={[
          styles.track,
          {
            width: s.width,
            height: s.height,
            borderRadius: s.height / 2,
            backgroundColor: trackColor,
          },
        ]}
      >
        {/* Thumb */}
        <Animated.View
          style={[
            styles.thumb,
            {
              width: s.thumb,
              height: s.thumb,
              borderRadius: s.thumb / 2,
              backgroundColor: thumbColor,
              transform: [{ translateX }],
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  track: {
    justifyContent: "center",
    padding: 2,
  },
  thumb: {
    elevation: 2,
    shadowColor: colors.shadowBase,
    shadowOpacity: 0.25,
    shadowRadius: 2,
  },
});
