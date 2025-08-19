import { View, StyleSheet } from "react-native";
import { theme } from "../../globalStyle/theme";

const styles = StyleSheet.create({
  body: { 
    flex: 1,
    backgroundColor: theme.colors.neutral[900],
  },
});

/**
 * Body component provides the main content area wrapper
 * @param {React.ReactNode} children - Child components to render
 * @returns {JSX.Element} A styled view container for main content
 */
const Body = ({ children }: { children?: React.ReactNode }) => {
  return <View style={styles.body} testID="body-container">{children}</View>;
};

export default Body;
