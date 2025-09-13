import { AntDesign } from "@expo/vector-icons";
import { Pressable } from "react-native";
import globalStyle from "../../globalStyle";

/**
 * BackButton component provides a navigation back button
 * @param {Function} onPress - Function to call when button is pressed
 * @returns {JSX.Element} A pressable back button with left arrow icon
 */
const BackButton = ({ onPress }: { onPress: () => void }) => (
  <Pressable onPress={onPress} testID="back-button">
    <AntDesign name={"caret-left"} size={16} color={globalStyle.white} testID="back-icon" />
  </Pressable>
);

export default BackButton;
