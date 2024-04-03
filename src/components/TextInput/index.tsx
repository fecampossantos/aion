import { TextInput as RNTextInput, View } from "react-native";
import styles, { placeHolderColor } from "./styles";

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
