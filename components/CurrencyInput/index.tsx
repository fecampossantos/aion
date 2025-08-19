import { Text, View } from "react-native";
import styles from "./styles";
import { parseToCurrencyFormat } from "../../utils/parser";
import TextInput from "../TextInput";
import { theme } from "../../globalStyle/theme";

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
