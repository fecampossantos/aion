import { Pressable, Text } from "react-native";
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
    <Pressable
      onPress={() => onPress()}
      style={{ ...styles.button, ...buttonStyle }}
    >
      <Text style={{ ...styles.text, ...textStyle }}>{text}</Text>
    </Pressable>
  );
};

export default Button;
