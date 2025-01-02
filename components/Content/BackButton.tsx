import { AntDesign } from "@expo/vector-icons";
import { Pressable } from "react-native";
import globalStyle from "../../globalStyle";

const BackButton = ({ onPress }: { onPress: () => void }) => (
  <Pressable onPress={onPress}>
    <AntDesign name={"caretleft"} size={16} color={globalStyle.white} />
  </Pressable>
);

export default BackButton;
