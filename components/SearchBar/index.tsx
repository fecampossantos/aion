import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { theme } from "../../globalStyle/theme";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.neutral[800],
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    flex: 1,
    ...theme.shadows.sm,
  },
  searchIcon: {
    color: theme.colors.neutral[400],
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.md,
    paddingVertical: theme.spacing.sm,
  },
  clearButton: {
    padding: theme.spacing.xs,
  },
  clearIcon: {
    color: theme.colors.neutral[400],
  },
});

/**
 * SearchBar component for filtering data with search functionality
 * @param {SearchBarProps} props - Component properties
 * @param {string} props.value - Current search value
 * @param {(text: string) => void} props.onChangeText - Function to handle text changes
 * @param {string} props.placeholder - Placeholder text for the input
 * @param {() => void} props.onClear - Function to clear the search input
 * @returns {JSX.Element} A search input with search icon and clear button
 */
const SearchBar = ({
  value,
  onChangeText,
  placeholder = "Search...",
  onClear,
}: SearchBarProps) => {
  /**
   * Handles clearing the search input
   */
  const handleClear = () => {
    onChangeText("");
    onClear?.();
  };

  return (
    <View style={styles.container}>
      <AntDesign name="search1" size={20} style={styles.searchIcon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.neutral[400]}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && onClear && (
        <TouchableOpacity 
          style={styles.clearButton} 
          onPress={handleClear}
          testID="clear-button"
        >
          <AntDesign name="close" size={18} style={styles.clearIcon} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SearchBar;
