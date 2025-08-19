import { Text, View } from "react-native";
import styles from "./styles";

/**
 * Header component provides a consistent header layout with optional left/right buttons and title
 * @param {React.ReactNode} left - Optional left button/content
 * @param {React.ReactNode | string} title - Optional title text or custom component
 * @param {React.ReactNode} right - Optional right button/content
 * @returns {JSX.Element} A header with three sections: left button, title, right button
 */
const Header = ({
  left,
  right,
  title,
}: {
  left?: React.ReactNode;
  title?: React.ReactNode | string;
  right?: React.ReactNode;
}) => {
  const renderTitle = () => {
    if (typeof title === 'string') {
      return (
        <View style={styles.titleWrapper}>
          <Text style={styles.title} testID="header-title">{title}</Text>
        </View>
      );
    }
    
    if (title) {
      return (
        <View style={styles.titleWrapper}>
          {title}
        </View>
      );
    }
    
    return null;
  };

  return (
    <View style={styles.header} testID="header-container">
      {left && <View style={styles.button} testID="header-left">{left}</View>}
      {renderTitle()}
      {right && <View style={styles.button} testID="header-right">{right}</View>}
    </View>
  );
};

export default Header;
