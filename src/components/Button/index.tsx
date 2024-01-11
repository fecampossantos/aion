import { Text, TouchableOpacity } from "react-native";
import styles from "./styles";

interface ButtonProps {
  onPress: () => void;
  text: string;
}

const Button = ({ onPress, text }: ButtonProps) => {
  return (
    <TouchableOpacity onPress={() => onPress()} style={styles.button}>
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
};

export default Button;
