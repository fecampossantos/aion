import { Text, View, StyleSheet } from "react-native";
import { theme } from "../../globalStyle/theme";

const styles = StyleSheet.create({
  header: {
    minHeight: 80,
    backgroundColor: theme.colors.neutral[900],
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[800],
  },
  button: {
    minWidth: theme.spacing['4xl'],
    height: theme.spacing['4xl'],
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  titleWrapper: {
    flex: 1,
    minHeight: theme.spacing['7xl'],
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingHorizontal: theme.spacing.md,
  },
  title: {
    textAlign: "left",
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.bold,
  }
});

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
