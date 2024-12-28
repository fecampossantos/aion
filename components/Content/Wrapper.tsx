import { View } from "react-native";
import styles from "./styles";

const Wrapper = ({ children }) => (
  <View style={styles.wrapper}>{children}</View>
);

export default Wrapper;
