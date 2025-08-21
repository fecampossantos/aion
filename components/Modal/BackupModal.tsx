import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../globalStyle/theme';
import { Modal, ModalButton } from './index';

interface BackupModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

/**
 * Modal component for backup creation confirmation
 * @param visible - Whether the modal is visible
 * @param onClose - Function to call when modal should close
 * @param onConfirm - Function to call when backup is confirmed
 * @param isLoading - Whether backup is currently in progress
 */
const BackupModal: React.FC<BackupModalProps> = ({
  visible,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  return (
    <Modal visible={visible} onClose={onClose} title="Create Backup">
      <View style={styles.content}>
        <Text style={styles.description}>
          This will create a backup file with all your projects, tasks, and time tracking data.
        </Text>
        
        <Text style={styles.info}>
          The file will be saved to your device's Documents folder and you can then share or save it to your preferred location.
        </Text>

        <View style={styles.features}>
          <Text style={styles.featuresTitle}>What's included:</Text>
          <Text style={styles.feature}>• All projects and their settings</Text>
          <Text style={styles.feature}>• All tasks and completion status</Text>
          <Text style={styles.feature}>• All time tracking records</Text>
          <Text style={styles.feature}>• Project relationships and data integrity</Text>
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
            title={isLoading ? "Creating Backup..." : "Create Backup"}
            onPress={onConfirm}
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
  description: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.md,
    lineHeight: 22,
  },
  info: {
    color: theme.colors.neutral[400],
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 20,
  },
  features: {
    gap: theme.spacing.xs,
  },
  featuresTitle: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.semibold,
    fontSize: theme.typography.fontSize.md,
    marginBottom: theme.spacing.xs,
  },
  feature: {
    color: theme.colors.neutral[300],
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 18,
  },
  buttonContainer: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
});

export default BackupModal;
