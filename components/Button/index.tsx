import { Text, TouchableOpacity } from "react-native";
import styles from "./styles";

interface ButtonProps {
  onPress: () => void;
  text: string;
  buttonStyle?: object;
  textStyle?: object;
}

const Button = ({
  onPress,
  text,
  buttonStyle = {},
  textStyle = {},
}: ButtonProps) => {
  return (
    <TouchableOpacity
      onPress={() => onPress()}
      style={{ ...styles.button, ...buttonStyle }}
    >
      <Text style={{ ...styles.text, ...textStyle }}>{text}</Text>
    </TouchableOpacity>
  );
};

export default Button;
