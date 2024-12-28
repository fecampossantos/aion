import { View } from "react-native";
import styles from "./styles";
const Body = ({ children }) => {
  return <View style={styles.body}>{children}</View>;
};

export default Body;
