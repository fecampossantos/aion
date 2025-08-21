import { Pressable, Text, StyleSheet } from "react-native";
import { theme } from "../../globalStyle/theme";

const styles = StyleSheet.create({
  button: {
    borderColor: theme.colors.neutral[700],
    borderWidth: 2,
    borderRadius: theme.borderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.neutral[800],
    ...theme.shadows.sm,
  },
  text: { 
    color: theme.colors.white, 
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.md,
  },
});

interface ButtonProps {
  onPress: () => void;
  text: string;
  buttonStyle?: object;
  textStyle?: object;
  disabled?: boolean;
}

/**
 * Button component with customizable styling and press handling
 * @param {ButtonProps} props - Component properties
 * @param {() => void} props.onPress - Function to call when button is pressed
 * @param {string} props.text - Text to display on the button
 * @param {object} [props.buttonStyle] - Additional styles for the button container
 * @param {object} [props.textStyle] - Additional styles for the button text
 * @param {boolean} [props.disabled] - Whether the button is disabled
 * @returns {JSX.Element} A customizable button component
 */
const Button = ({
  onPress,
  text,
  buttonStyle = {},
  textStyle = {},
  disabled = false,
}: ButtonProps) => {
  return (
    <Pressable
      onPress={() => !disabled && onPress()}
      style={[
        styles.button,
        buttonStyle,
        disabled && { opacity: 0.5, backgroundColor: theme.colors.neutral[600] }
      ]}
    >
      <Text style={{ ...styles.text, ...textStyle }}>{text}</Text>
    </Pressable>
  );
};

export default Button;
