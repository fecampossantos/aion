import { TextInput, View } from "react-native";

import styles from "./styles";
import { useState } from "react";

const QuickTask = () => {
  const [taskName, setTaskName] = useState<String>("");

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <TextInput
          onChangeText={(text) => setTaskName(text)}
          style={styles.textInput}
        />
      </View>
    </View>
  );
};

export default QuickTask;
