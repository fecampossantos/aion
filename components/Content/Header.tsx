import { Pressable, Text, View } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import styles from "./styles";
import globalStyle from "../../globalStyle";
import { router } from "expo-router";

const Header = ({
  right,
  title,
  showGoBack = true,
}: {
  showGoBack?: boolean;
  title?: string;
  right?: React.ReactNode;
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.button}>
        {showGoBack ? (
          <Pressable onPress={() => router.back()}>
            <AntDesign name={"caretleft"} size={16} color={globalStyle.white} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.titleWrapper}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.button}>{right}</View>
    </View>
  );
};

export default Header;
