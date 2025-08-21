import React, { useRef, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from "react-native";
import { theme } from "../../globalStyle/theme";

/**
 * ToggleSwitch component with smooth animations and customizable label placement
 * @param {ToggleSwitchProps} props - Component properties
 * @param {boolean} props.value - Current toggle state (true/false)
 * @param {(value: boolean) => void} props.onValueChange - Function called when toggle changes
 * @param {string} props.label - Optional label text to display
 * @param {boolean} props.disabled - Whether the toggle is disabled
 * @param {"small" | "medium" | "large"} props.size - Size variant of the toggle
 * @param {"left" | "top"} props.labelPlacement - Position of the label relative to the toggle
 * @returns {JSX.Element} An animated toggle switch with optional label
 */

interface ToggleSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: "small" | "medium" | "large";
  labelPlacement?: "left" | "top";
}

const ToggleSwitch = ({
  value,
  onValueChange,
  label,
  disabled = false,
  size = "medium",
  labelPlacement = "left",
}: ToggleSwitchProps) => {
  const translateX = useRef(new Animated.Value(value ? 1 : 0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  // Size configurations
  const sizeConfig = {
    small: {
      width: 40,
      height: 24,
      thumbSize: 18,
      fontSize: 10,
    },
    medium: {
      width: 56,
      height: 32,
      thumbSize: 26,
      fontSize: 12,
    },
    large: {
      width: 60,
      height: 36,
      thumbSize: 30,
      fontSize: 14,
    },
  };

  const config = sizeConfig[size];

  // Animate thumb position
  useEffect(() => {
    const toValue = value ? 1 : 0;
    Animated.spring(translateX, {
      toValue,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, [value, translateX]);

  // Handle press with animation
  const handlePress = () => {
    if (disabled) return;

    // Scale animation on press
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onValueChange(!value);
  };

  // Calculate thumb position
  const thumbTranslateX = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [2, config.width - config.thumbSize - 2],
  });

  // Background color animation
  const backgroundColor = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [
      disabled ? theme.colors.neutral[600] : theme.colors.neutral[700],
      disabled ? theme.colors.neutral[600] : theme.colors.primary[500],
    ],
  });

  const containerStyle = labelPlacement === "top" ? styles.containerTop : styles.container;
  const labelStyle = labelPlacement === "top" ? styles.labelTop : styles.label;

  return (
    <View style={containerStyle}>
      {label && (
        <Text
          style={[
            labelStyle,
            { fontSize: config.fontSize },
            disabled && styles.disabledLabel,
          ]}
        >
          {label}
        </Text>
      )}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
        disabled={disabled}
        testID="toggle-switch"
        style={[
          styles.track,
          {
            width: config.width,
            height: config.height,
            backgroundColor: disabled
              ? theme.colors.neutral[600]
              : theme.colors.neutral[700],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              width: config.thumbSize,
              height: config.thumbSize,
              transform: [
                { translateX: thumbTranslateX },
                { scale: scale },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.background,
            {
              width: config.width,
              height: config.height,
              backgroundColor,
            },
          ]}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    flexShrink: 0,
  },
  containerTop: {
    flexDirection: "column",
    alignItems: "center",
    gap: theme.spacing.xs,
    flexShrink: 0,
  },
  label: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.medium,
    marginRight: theme.spacing.xs,
    flexShrink: 1,
  },
  labelTop: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.medium,
    marginRight: 0,
    marginBottom: theme.spacing.xs,
    flexShrink: 1,
    textAlign: "center",
  },
  disabledLabel: {
    color: theme.colors.neutral[400],
  },
  track: {
    borderRadius: 20,
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  background: {
    position: "absolute",
    borderRadius: 20,
    zIndex: 1,
  },
  thumb: {
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    position: "absolute",
    zIndex: 2,
    ...theme.shadows.md,
  },
});

export default ToggleSwitch;
