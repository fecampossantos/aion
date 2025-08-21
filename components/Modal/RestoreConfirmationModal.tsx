import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../globalStyle/theme';
import { Modal, ModalButton } from './index';

interface RestoreConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  backupInfo: {
    date: string;
    projectCount: number;
    taskCount: number;
    timingCount: number;
  } | null;
  isLoading?: boolean;
}

/**
 * Modal component for restore confirmation after file selection
 * @param visible - Whether the modal is visible
 * @param onClose - Function to call when modal should close
 * @param onConfirm - Function to call when restore is confirmed
 * @param backupInfo - Information about the selected backup
 * @param isLoading - Whether restore is currently in progress
 */
const RestoreConfirmationModal: React.FC<RestoreConfirmationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  backupInfo,
  isLoading = false,
}) => {
  return (
    <Modal visible={visible} onClose={onClose} title="Confirm Restore">
      <View style={styles.content}>
        <View style={styles.warningContainer}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningTitle}>Final Warning</Text>
          <Text style={styles.warningText}>
            This will REPLACE all current data with the data from the backup file.
          </Text>
          <Text style={styles.warningText}>
            This action cannot be undone.
          </Text>
        </View>

        {backupInfo && (
          <View style={styles.backupInfo}>
            <Text style={styles.backupInfoTitle}>Backup Information:</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date:</Text>
              <Text style={styles.infoValue}>{backupInfo.date}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Projects:</Text>
              <Text style={styles.infoValue}>{backupInfo.projectCount}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tasks:</Text>
              <Text style={styles.infoValue}>{backupInfo.taskCount}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Time Records:</Text>
              <Text style={styles.infoValue}>{backupInfo.timingCount}</Text>
            </View>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <ModalButton
            title="Cancel"
            onPress={onClose}
            variant="secondary"
            disabled={isLoading}
            fullWidth
          />
          <ModalButton
            title={isLoading ? "Restoring..." : "Restore Data"}
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
  backupInfo: {
    backgroundColor: theme.colors.neutral[700],
    borderWidth: 1,
    borderColor: theme.colors.neutral[600],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  backupInfoTitle: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.md,
    marginBottom: theme.spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    color: theme.colors.neutral[300],
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
  },
  infoValue: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.fontSize.sm,
  },
  buttonContainer: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
});

export default RestoreConfirmationModal;
