import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../lib/supabase';
import { colors, fonts, spacing, borderRadius, fontSize } from '../lib/theme';

const slides = [
  { title: "Choose What You Pay", description: "DSCPLE is a platform built on generosity — you choose what you pay. Every payment goes directly toward missionary work, nonprofit support, and spreading the Gospel around the world." },
  { title: "Support the Mission", description: "Your contribution, no matter the size, makes a real difference. 100% of payments go directly to missionaries and faith-based nonprofits serving communities around the globe." },
  { title: "Stay Connected", description: "As a supporter, you'll get access to exclusive updates from the missionaries and organizations your generosity supports. See the impact of your giving firsthand." },
];

export default function PricingScreen({ navigation }: any) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [monthlyAmount, setMonthlyAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (monthlyAmount === 0) {
      navigation.goBack();
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { amount: monthlyAmount },
      });
      if (error || !data?.url) {
        throw new Error(data?.error || 'Failed to create checkout session');
      }
      await WebBrowser.openBrowserAsync(data.url);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Payment setup failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color={colors.foreground} />
      </TouchableOpacity>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>DSCPLE</Text>
      </View>

      {/* Slide Content */}
      <Text style={styles.slideDescription}>{slides[currentSlide].description}</Text>

      {/* Slide Indicators */}
      <View style={styles.indicatorRow}>
        <TouchableOpacity onPress={() => setCurrentSlide(Math.max(0, currentSlide - 1))}>
          <Ionicons name="chevron-back" size={20} color={colors.mutedForeground} />
        </TouchableOpacity>
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View key={i} style={[styles.dot, i === currentSlide && styles.dotActive]} />
          ))}
        </View>
        <TouchableOpacity onPress={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}>
          <Ionicons name="chevron-forward" size={20} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      {/* Amount Display */}
      <Text style={styles.amountDisplay}>${monthlyAmount}/monthly</Text>

      {/* Slider */}
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={50}
          step={1}
          value={monthlyAmount}
          onValueChange={setMonthlyAmount}
          minimumTrackTintColor={colors.foreground}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.foreground}
        />
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        style={[styles.continueButton, loading && { opacity: 0.6 }]}
        onPress={handleContinue}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color={colors.background} />
        ) : (
          <Text style={styles.continueButtonText}>
            {monthlyAmount === 0 ? 'Continue for Free' : `Give $${monthlyAmount}/month`}
          </Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg },
  backButton: { marginTop: spacing.md },
  logoContainer: { alignItems: 'center', marginTop: spacing.xl },
  logoText: { fontFamily: fonts.bold, fontSize: fontSize['2xl'], color: colors.foreground, letterSpacing: 2 },
  slideDescription: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.foreground, textAlign: 'center', lineHeight: 22, marginTop: spacing.lg },
  indicatorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: spacing.lg, gap: spacing.md },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 8, height: 4, borderRadius: 2, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.foreground, width: 24 },
  amountDisplay: { fontFamily: fonts.bold, fontSize: fontSize['4xl'], color: colors.foreground, textAlign: 'center', marginTop: spacing.xxl },
  sliderContainer: { paddingHorizontal: spacing.sm, marginTop: spacing.lg },
  slider: { width: '100%', height: 40 },
  continueButton: { backgroundColor: colors.foreground, borderRadius: borderRadius.xl, paddingVertical: 18, alignItems: 'center', marginTop: spacing.xxl },
  continueButtonText: { fontFamily: fonts.semibold, fontSize: fontSize.base, color: colors.background },
});
