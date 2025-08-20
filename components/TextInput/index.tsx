import { TextInput as RNTextInput, View, StyleSheet, Text } from "react-native";
import globalStyle from "../../globalStyle";
import { useFormValidation } from "./useFormValidation";

const styles = StyleSheet.create({
  input: {
    backgroundColor: globalStyle.black.main,
    borderWidth: 1,
    borderColor: globalStyle.black.light,
    borderRadius: 12,
    padding: 16,
    color: globalStyle.white,
    fontSize: 16,
    fontFamily: globalStyle.font.regular,
    minHeight: 56,
  },
  wrapper: {
    gap: 8,
  },
});

export const placeHolderColor = globalStyle.black.light;

interface TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  maxLength?: number;
  validator?: (value: string) => string | null;
  testID?: string;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  secureTextEntry?: boolean;
  editable?: boolean;
  style?: any;
}

/**
 * TextInput component with validation support
 * @param {TextInputProps} props - TextInput configuration and props
 * @returns {JSX.Element} A styled text input with validation
 */
const TextInput = ({
  value,
  onChangeText,
  placeholder,
  maxLength,
  validator,
  testID,
  multiline = false,
  numberOfLines = 1,
  keyboardType = "default",
  autoCapitalize = "sentences",
  autoCorrect = true,
  secureTextEntry = false,
  editable = true,
  style,
}: TextInputProps) => {
  const { error, isValid, validate, clearError } = useFormValidation({
    maxLength,
    validator,
  });

  /**
   * Handles text changes and validates input
   * @param {string} text - The new text value
   */
  const handleChangeText = (text: string) => {
    onChangeText(text);
    
    if (text.length === 0) {
      clearError();
    } else {
      validate(text);
    }
  };

  /**
   * Handles focus events to clear errors
   */
  const handleFocus = () => {
    if (error) {
      clearError();
    }
  };

  return (
    <View style={styles.wrapper}>
      <RNTextInput
        style={[
          styles.input,
          !isValid && { borderColor: globalStyle.error },
          style,
        ]}
        value={value}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeHolderColor}
        maxLength={maxLength}
        testID={testID}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        secureTextEntry={secureTextEntry}
        editable={editable}
        onFocus={handleFocus}
      />
      {error && (
        <Text style={{ color: globalStyle.error, fontSize: 12, fontFamily: globalStyle.font.regular }}>
          {error}
        </Text>
      )}
    </View>
  );
};

export default TextInput;
