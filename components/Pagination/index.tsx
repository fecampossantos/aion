import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { theme } from "../../globalStyle/theme";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  pageButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.neutral[800],
    justifyContent: "center",
    alignItems: "center",
    ...theme.shadows.sm,
  },
  activePageButton: {
    backgroundColor: theme.colors.primary[500],
  },
  pageButtonText: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.sm,
  },
  navigationButton: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.neutral[800],
    justifyContent: "center",
    alignItems: "center",
    ...theme.shadows.sm,
  },
  disabledNavigationButton: {
    backgroundColor: theme.colors.neutral[700],
    opacity: 0.5,
  },
  navigationIcon: {
    color: theme.colors.white,
  },
  disabledNavigationIcon: {
    color: theme.colors.neutral[400],
  },
  pageInfo: {
    color: theme.colors.neutral[400],
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    marginHorizontal: theme.spacing.md,
  },
});

/**
 * Pagination component for navigating through pages of data
 * @param {PaginationProps} props - Component properties
 * @param {number} props.currentPage - Current active page
 * @param {number} props.totalPages - Total number of pages
 * @param {(page: number) => void} props.onPageChange - Function to handle page changes
 * @param {() => void} props.onNextPage - Function to go to next page
 * @param {() => void} props.onPreviousPage - Function to go to previous page
 * @returns {JSX.Element} Pagination controls with page numbers and navigation
 */
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  onNextPage,
  onPreviousPage,
}: PaginationProps) => {
  if (totalPages <= 1) {
    return null;
  }

  /**
   * Generates page numbers to display
   * @returns {Array<number>} Array of page numbers to show
   */
  const getPageNumbers = (): Array<number> => {
    const pages: Array<number> = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.navigationButton,
          currentPage === 1 && styles.disabledNavigationButton,
        ]}
        onPress={onPreviousPage}
        disabled={currentPage === 1}
      >
        <AntDesign
          name="left"
          size={16}
          style={
            currentPage === 1
              ? styles.disabledNavigationIcon
              : styles.navigationIcon
          }
        />
      </TouchableOpacity>

      {pageNumbers.map((page, index) => {
        const isActive = page === currentPage;
        const showEllipsis = index > 0 && page - pageNumbers[index - 1] > 1;
        
        return (
          <View key={page} style={{ flexDirection: "row", alignItems: "center" }}>
            {showEllipsis && (
              <Text style={styles.pageInfo}>...</Text>
            )}
            <TouchableOpacity
              style={[
                styles.pageButton,
                isActive && styles.activePageButton,
              ]}
              onPress={() => onPageChange(page)}
            >
              <Text style={styles.pageButtonText}>{page}</Text>
            </TouchableOpacity>
          </View>
        );
      })}

      <TouchableOpacity
        style={[
          styles.navigationButton,
          currentPage === totalPages && styles.disabledNavigationButton,
        ]}
        onPress={onNextPage}
        disabled={currentPage === totalPages}
      >
        <AntDesign
          name="right"
          size={16}
          style={
            currentPage === totalPages
              ? styles.disabledNavigationIcon
              : styles.navigationIcon
          }
        />
      </TouchableOpacity>
    </View>
  );
};

export default Pagination;
