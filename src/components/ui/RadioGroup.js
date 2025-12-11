// src/components/ui/RadioGroup.js
import React from "react";
import { View } from "react-native";
import RadioButton from "./RadioButton";

/**
 Props:
  - value: selected value
  - onChange: fn(value)
  - options: [{ value, label, disabled?, note? }]
  - direction: 'column' | 'row'
  - size: 'sm' | 'md'
  - style
*/
export default function RadioGroup({
  value,
  onChange = () => {},
  options = [],
  direction = "column",
  size = "md",
  style,
}) {
  return (
    <View
      accessibilityRole="radiogroup"
      style={[{ flexDirection: direction === "row" ? "row" : "column" }, style]}
    >
      {options.map((opt) => (
        <RadioButton
          key={String(opt.value)}
          checked={value === opt.value}
          disabled={opt.disabled}
          label={opt.label}
          note={opt.note}
          size={size}
          onPress={() => {
            if (opt.disabled) return;
            onChange(opt.value);
          }}
          style={opt.style}
        />
      ))}
    </View>
  );
}
