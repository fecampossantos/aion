import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../globalStyle/theme';
import Modal from './Modal';
import ModalButton from './Button';

interface ConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

/**
 * Modal component for confirming actions
 * @param visible - Whether the modal is visible
 * @param onClose - Function to call when modal should close
 * @param onConfirm - Function to call when action is confirmed
 * @param title - Modal title
 * @param message - Confirmation message
 * @param confirmText - Text for confirm button
 * @param cancelText - Text for cancel button (default: "Cancel")
 * @param variant - Modal style variant (danger, warning, info)
 * @param isLoading - Whether action is currently in progress
 */
const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText = "Cancel",
  variant = 'info',
  isLoading = false,
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return '⚠️';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  const getIconContainerStyle = () => {
    switch (variant) {
      case 'danger':
        return styles.dangerIconContainer;
      case 'warning':
        return styles.warningIconContainer;
      case 'info':
        return styles.infoIconContainer;
      default:
        return styles.infoIconContainer;
    }
  };

  const getConfirmButtonVariant = () => {
    switch (variant) {
      case 'danger':
        return 'danger';
      case 'warning':
        return 'danger';
      case 'info':
        return 'primary';
      default:
        return 'primary';
    }
  };

  return (
    <Modal visible={visible} onClose={onClose} title={title}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, getIconContainerStyle()]}>
          <Text style={styles.icon}>{getIcon()}</Text>
        </View>

        <Text style={styles.message}>{message}</Text>

        <View style={styles.buttonContainer}>
          <ModalButton
            title={cancelText}
            onPress={onClose}
            variant="secondary"
            disabled={isLoading}
            fullWidth
          />
          <ModalButton
            title={isLoading ? "Processing..." : confirmText}
            onPress={onConfirm}
            variant={getConfirmButtonVariant()}
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
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  dangerIconContainer: {
    backgroundColor: theme.colors.error[900],
    borderWidth: 2,
    borderColor: theme.colors.error[700],
  },
  warningIconContainer: {
    backgroundColor: theme.colors.warning[900],
    borderWidth: 2,
    borderColor: theme.colors.warning[700],
  },
  infoIconContainer: {
    backgroundColor: theme.colors.primary[900],
    borderWidth: 2,
    borderColor: theme.colors.primary[700],
  },
  icon: {
    fontSize: 32,
  },
  message: {
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
    width: '100%',
  },
});

export default ConfirmationModal;
