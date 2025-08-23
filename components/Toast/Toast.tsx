import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../../globalStyle/theme';

export interface ToastProps {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onHide: () => void;
  duration?: number;
}

/**
 * Custom Toast component for showing notifications
 * @param visible - Whether the toast is visible
 * @param message - Toast message
 * @param type - Toast type (success, error, info, warning)
 * @param onHide - Function to call when toast should hide
 * @param duration - How long to show the toast (default: 4000ms)
 */
const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  type,
  onHide,
  duration = 4000,
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      // Slide in and fade in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration]);

  const hideToast = () => {
    // Slide out and fade out
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  if (!visible) return null;

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return styles.success;
      case 'error':
        return styles.error;
      case 'info':
        return styles.info;
      case 'warning':
        return styles.warning;
      default:
        return styles.info;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        getToastStyle(),
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={styles.icon}>{getIcon()}</Text>
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 1000,
    borderRadius: theme.borderRadius.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  icon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  message: {
    flex: 1,
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.md,
    lineHeight: 20,
  },
  closeButton: {
    marginLeft: theme.spacing.sm,
    padding: 4,
  },
  closeText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  success: {
    backgroundColor: theme.colors.success[600],
  },
  error: {
    backgroundColor: theme.colors.error[600],
  },
  info: {
    backgroundColor: theme.colors.primary[600],
  },
  warning: {
    backgroundColor: theme.colors.warning[600],
  },
});

export default Toast;
