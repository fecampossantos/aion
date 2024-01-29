import { ActivityIndicator, View } from "react-native";
import styles from "./styles";
import globalStyle from "../../globalStyle";

const LoadingView = () => {
  return (
    <View style={styles.loadingView}>
      <ActivityIndicator size={"large"} color={globalStyle.white} />
    </View>
  );
};

export default LoadingView;
