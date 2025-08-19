import { ActivityIndicator, View } from "react-native";
import styles from "./styles";
import globalStyle from "../../globalStyle";

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
