import { TextInput as RNTextInput, View, StyleSheet } from "react-native";
import globalStyle from "../../globalStyle";

const styles = StyleSheet.create({
  input: {
    fontSize: 26,
    fontFamily: globalStyle.font.regular,
    color: globalStyle.white,
    borderBottomColor: globalStyle.white,
    borderBottomWidth: 1,
  },
  wrapper: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
});

export const placeHolderColor = globalStyle.black.light;

/**
 * TextInput component provides a styled text input field
 * @param {any} props - All props are passed through to the underlying TextInput
 * @returns {JSX.Element} A styled text input with consistent styling
 */
const TextInput = ({ ...props }: any) => {
  return (
    <View style={styles.wrapper}>
      <RNTextInput
        style={styles.input}
        placeholderTextColor={placeHolderColor}
        testID="textInput-input"
        cursorColor={"#fff"}
        {...props}
      />
    </View>
  );
};

export default TextInput;
