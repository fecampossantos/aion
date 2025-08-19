import { View, StyleSheet } from "react-native";
import { theme } from "../../globalStyle/theme";

const styles = StyleSheet.create({
  wrapper: { 
    flex: 1,
    backgroundColor: theme.colors.neutral[900],
  },
});

/**
 * Wrapper component provides a styled container for content
 * @param {React.ReactNode} children - Child components to render
 * @returns {JSX.Element} A styled view container
 */
const Wrapper = ({ children }: { children?: React.ReactNode }) => (
  <View style={styles.wrapper} testID="wrapper-container">{children}</View>
);

export default Wrapper;
