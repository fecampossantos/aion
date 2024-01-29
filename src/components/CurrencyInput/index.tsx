import { Text, View } from "react-native";
import styles, { placeHolderColor } from "./styles";
import { parseToCurrencyFormat } from "../../../utils/parser";
import TextInput from "../TextInput";
const CurrencyInput = ({ value, placeholder, onChange, style = {} }: any) => {
  const handleChangeText = (text: string) => {
    return onChange(parseToCurrencyFormat(text));
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.currency}>R$</Text>
      <TextInput
        keyboardType="numeric"
        style={style ? { ...styles.input, ...style } : { ...styles.input }}
        value={value}
        onChangeText={(text) => handleChangeText(text)}
        placeholder={placeholder}
        placeholderTextColor={placeHolderColor}
        testID="currencyInput-input"
      />
    </View>
  );
};

export default CurrencyInput;
