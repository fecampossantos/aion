import BouncyCheckbox from "react-native-bouncy-checkbox";
import globalStyle from "../../globalStyle";

const CheckBox = ({
  onPress,
  isChecked,
}: {
  onPress: (value: boolean) => void;
  isChecked: boolean;
}) => {
  return (
    <BouncyCheckbox
      onPress={(isChecked: boolean) => {
        onPress(isChecked);
      }}
      size={25}
      fillColor={globalStyle.black.light}
      unfillColor={globalStyle.black.dark}
      innerIconStyle={{ borderWidth: 2 }}
      isChecked={isChecked}
    />
  );
};

export default CheckBox;
