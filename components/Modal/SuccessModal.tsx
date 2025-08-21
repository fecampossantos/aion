import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../globalStyle/theme';
import { Modal, ModalButton } from './index';

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  details?: string[];
}

/**
 * Modal component for showing success messages
 * @param visible - Whether the modal is visible
 * @param onClose - Function to call when modal should close
 * @param title - Success title
 * @param message - Success message
 * @param details - Optional array of detail items to display
 */
const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  onClose,
  title,
  message,
  details = [],
}) => {
  return (
    <Modal visible={visible} onClose={onClose} title={title}>
      <View style={styles.content}>
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successMessage}>{message}</Text>
        </View>

        {details.length > 0 && (
          <View style={styles.detailsContainer}>
            {details.map((detail, index) => (
              <Text key={index} style={styles.detail}>
                {detail}
              </Text>
            ))}
          </View>
        )}

        <ModalButton
          title="OK"
          onPress={onClose}
          fullWidth
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: theme.spacing.lg,
  },
  successContainer: {
    backgroundColor: theme.colors.success[900],
    borderWidth: 1,
    borderColor: theme.colors.success[700],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.xs,
  },
  successMessage: {
    color: theme.colors.success[100],
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  detailsContainer: {
    gap: theme.spacing.xs,
  },
  detail: {
    color: theme.colors.neutral[300],
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 18,
  },
});

export default SuccessModal;
