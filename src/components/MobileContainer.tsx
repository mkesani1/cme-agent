import React from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';

interface MobileContainerProps {
  children: React.ReactNode;
}

export function MobileContainer({ children }: MobileContainerProps) {
  const { width } = useWindowDimensions();

  // Only apply container styling on web with larger screens
  if (Platform.OS !== 'web' || width < 500) {
    return <>{children}</>;
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: 430,
    height: '100%',
    maxHeight: 932,
    backgroundColor: '#F0F7FA',
    borderRadius: 40,
    overflow: 'hidden',
    // @ts-ignore - web only shadow
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
  },
});
