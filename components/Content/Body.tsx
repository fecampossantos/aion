import { View } from "react-native";
import styles from "./styles";

/**
 * Body component provides the main content area wrapper
 * @param {React.ReactNode} children - Child components to render
 * @returns {JSX.Element} A styled view container for main content
 */
const Body = ({ children }: { children?: React.ReactNode }) => {
  return <View style={styles.body} testID="body-container">{children}</View>;
};

export default Body;
