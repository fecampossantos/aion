import { Text, View, StyleSheet } from "react-native";
import { parseToCurrencyFormat } from "../../utils/parser";
import TextInput from "../TextInput";
import { theme } from "../../globalStyle/theme";

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  label: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.md,
    marginBottom: theme.spacing.sm,
  },
  wrapper: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    display: "flex",
    flexDirection: "row",
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.neutral[800],
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.neutral[600],
    alignItems: "center",
    ...theme.shadows.sm,
  },
  errorWrapper: {
    borderColor: theme.colors.error[500],
    backgroundColor: theme.colors.error[900],
  },
  disabledWrapper: {
    backgroundColor: theme.colors.neutral[900],
    borderColor: theme.colors.neutral[700],
    opacity: 0.6,
  },
  currencyPrefix: {
    backgroundColor: theme.colors.primary[600],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    minWidth: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  currency: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.md,
  },
  input: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.white,
    borderBottomColor: "transparent",
    borderBottomWidth: 0,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: "transparent",
  },
  errorInput: {
    color: theme.colors.error[300],
  },
  disabledInput: {
    color: theme.colors.neutral[400],
  },
  errorText: {
    color: theme.colors.error[400],
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
});

interface CurrencyInputProps {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  style?: object;
  disabled?: boolean;
  error?: boolean;
  label?: string;
}

/**
 * CurrencyInput component provides a styled input field for currency values
 * @param {CurrencyInputProps} props - Currency input configuration
 * @returns {JSX.Element} A currency input with R$ prefix and validation
 */
const CurrencyInput = ({ 
  value, 
  placeholder, 
  onChange, 
  style = {}, 
  disabled = false,
  error = false,
  label
}: CurrencyInputProps) => {
  const handleChangeText = (text: string) => {
    return onChange(parseToCurrencyFormat(text));
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[
          styles.label,
          { color: error ? theme.colors.error[400] : theme.colors.white }
        ]}>
          {label}
        </Text>
      )}
      
      <View style={[
        styles.wrapper,
        error && styles.errorWrapper,
        disabled && styles.disabledWrapper
      ]}>
        <View style={styles.currencyPrefix}>
          <Text style={[
            styles.currency,
            { color: disabled ? theme.colors.neutral[400] : theme.colors.white }
          ]}>
            R$
          </Text>
        </View>
        
        <TextInput
          keyboardType="numeric"
          style={[
            styles.input,
            style,
            error && styles.errorInput,
            disabled && styles.disabledInput
          ]}
          value={value}
          onChangeText={(text) => handleChangeText(text)}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.neutral[500]}
          testID="currencyInput-input"
          editable={!disabled}
        />
      </View>
      
      {error && (
        <Text style={styles.errorText}>
          Valor inválido
        </Text>
      )}
    </View>
  );
};

export default CurrencyInput;
