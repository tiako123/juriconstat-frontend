import React from 'react';
import { Animated, Easing, ImageBackground, StyleSheet, View } from 'react-native';
import { colors } from '../theme';

export default function BrandBackdrop() {
  const pulse = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulse]);

  const sweep = {
    opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.75] }),
    transform: [
      { translateX: pulse.interpolate({ inputRange: [0, 1], outputRange: [-32, 26] }) },
      { rotate: '-18deg' },
    ],
  };

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <ImageBackground
        source={require('../../assets/icon.png')}
        style={StyleSheet.absoluteFill}
        imageStyle={styles.watermark}
        blurRadius={18}
      />
      <View style={styles.veil} />
      <Animated.View style={[styles.lightBand, styles.bandOne, sweep]} />
      <Animated.View style={[styles.lightBand, styles.bandTwo, sweep]} />
      <View style={styles.gridLineOne} />
      <View style={styles.gridLineTwo} />
    </View>
  );
}

const styles = StyleSheet.create({
  watermark: { opacity: 0.08, transform: [{ scale: 2.8 }], top: -40 },
  veil: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(3, 8, 6, 0.86)' },
  lightBand: {
    position: 'absolute',
    height: 170,
    width: 520,
    borderWidth: 1,
    borderColor: 'rgba(82, 183, 136, 0.24)',
    backgroundColor: 'rgba(82, 183, 136, 0.08)',
  },
  bandOne: { top: 86, left: -170 },
  bandTwo: {
    right: -210,
    bottom: 110,
    borderColor: 'rgba(74, 144, 226, 0.20)',
    backgroundColor: 'rgba(74, 144, 226, 0.07)',
  },
  gridLineOne: {
    position: 'absolute',
    left: 24,
    right: 24,
    top: 130,
    height: 1,
    backgroundColor: colors.borderSoft,
    opacity: 0.45,
  },
  gridLineTwo: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 150,
    height: 1,
    backgroundColor: colors.borderSoft,
    opacity: 0.35,
  },
});
