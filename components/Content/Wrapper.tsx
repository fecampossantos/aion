import { View } from "react-native";
import styles from "./styles";

/**
 * Wrapper component provides a styled container for content
 * @param {React.ReactNode} children - Child components to render
 * @returns {JSX.Element} A styled view container
 */
const Wrapper = ({ children }: { children?: React.ReactNode }) => (
  <View style={styles.wrapper} testID="wrapper-container">{children}</View>
);

export default Wrapper;
