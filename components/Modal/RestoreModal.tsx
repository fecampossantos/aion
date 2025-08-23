import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../globalStyle/theme';
import { Modal, ModalButton } from './index';

interface RestoreModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

/**
 * Modal component for restore confirmation
 * @param visible - Whether the modal is visible
 * @param onClose - Function to call when modal should close
 * @param onConfirm - Function to call when restore is confirmed
 * @param isLoading - Whether restore is currently in progress
 */
const RestoreModal: React.FC<RestoreModalProps> = ({
  visible,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  return (
    <Modal visible={visible} onClose={onClose} title="Restore Data">
      <View style={styles.content}>
        <View style={styles.warningContainer}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningTitle}>Important Warning</Text>
          <Text style={styles.warningText}>
            This action will REPLACE all current data with the data from the backup file.
          </Text>
        </View>

        <Text style={styles.description}>
          This will allow you to select a backup file and restore all your data from it.
        </Text>

        <View style={styles.steps}>
          <Text style={styles.stepsTitle}>How it works:</Text>
          <Text style={styles.step}>1. Select your backup file (.json)</Text>
          <Text style={styles.step}>2. Review backup information</Text>
          <Text style={styles.step}>3. Confirm the restore operation</Text>
          <Text style={styles.step}>4. All current data will be replaced</Text>
        </View>

        <View style={styles.recommendation}>
          <Text style={styles.recommendationTitle}>Recommendation:</Text>
          <Text style={styles.recommendationText}>
            Create a backup of your current data first if you want to preserve it.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <ModalButton
            title="Cancel"
            onPress={onClose}
            variant="secondary"
            disabled={isLoading}
            fullWidth
          />
          <ModalButton
            title={isLoading ? "Selecting File..." : "Select Backup File"}
            onPress={onConfirm}
            variant="danger"
            loading={isLoading}
            disabled={isLoading}
            fullWidth
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.lg,
  },
  warningContainer: {
    backgroundColor: theme.colors.error[900],
    borderWidth: 1,
    borderColor: theme.colors.error[700],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  warningIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.xs,
  },
  warningTitle: {
    color: theme.colors.error[100],
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.md,
    marginBottom: theme.spacing.xs,
  },
  warningText: {
    color: theme.colors.error[200],
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    textAlign: 'center',
    lineHeight: 18,
  },
  description: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.md,
    lineHeight: 22,
  },
  steps: {
    gap: theme.spacing.xs,
  },
  stepsTitle: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.md,
    marginBottom: theme.spacing.xs,
  },
  step: {
    color: theme.colors.neutral[300],
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 18,
  },
  recommendation: {
    backgroundColor: theme.colors.primary[900],
    borderWidth: 1,
    borderColor: theme.colors.primary[700],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  recommendationTitle: {
    color: theme.colors.primary[100],
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.sm,
    marginBottom: theme.spacing.xs,
  },
  recommendationText: {
    color: theme.colors.primary[200],
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 18,
  },
  buttonContainer: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
});

export default RestoreModal;
