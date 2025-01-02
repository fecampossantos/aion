import { Text, View } from "react-native";
import styles from "./styles";

const Header = ({
  left,
  right,
  title,
}: {
  left?: React.ReactNode;
  title?: string;
  right?: React.ReactNode;
}) => {
  return (
    <View style={styles.header}>
      <View style={styles.button}>{left}</View>
      <View style={styles.titleWrapper}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.button}>{right}</View>
    </View>
  );
};

export default Header;
