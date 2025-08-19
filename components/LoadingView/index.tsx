import { ActivityIndicator, View, StyleSheet } from "react-native";
import globalStyle from "../../globalStyle";

const styles = StyleSheet.create({
  loadingView: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
});

/**
 * LoadingView component displays a loading indicator
 * @returns {JSX.Element} A view with a centered activity indicator
 */
const LoadingView = () => {
  return (
    <View style={styles.loadingView} testID="loading-container">
      <ActivityIndicator size={"large"} color={globalStyle.white} testID="loading-indicator" />
    </View>
  );
};

export default LoadingView;
