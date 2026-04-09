import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';
import { colors, fonts, spacing, borderRadius, fontSize } from '../lib/theme';

const CAUSE_BREAKDOWN = [
  { label: 'Missions', icon: 'globe-outline', pct: 40 },
  { label: 'Community Outreach', icon: 'people-outline', pct: 25 },
  { label: 'Youth Ministry', icon: 'heart-outline', pct: 20 },
  { label: 'General Fund', icon: 'wallet-outline', pct: 15 },
];

export default function OnboardingScreen() {
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [monthlyAmount, setMonthlyAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleSetupSubscription = async () => {
    if (monthlyAmount <= 0) return;
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { amount: monthlyAmount },
      });
      if (error || !data?.url) throw new Error(data?.error || 'Failed to create subscription');
      await WebBrowser.openBrowserAsync(data.url);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not set up subscription. You can do this later from the Give tab.');
    }
    setLoading(false);
  };

  const handleComplete = async () => {
    if (!firstName.trim()) {
      Alert.alert('Error', 'Please enter your first name');
      return;
    }
    setLoading(true);

    // If they chose a monthly amount, set up subscription first
    if (monthlyAmount > 0) {
      await handleSetupSubscription();
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        full_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        monthly_giving: monthlyAmount,
        onboarding_complete: true,
      })
      .eq('id', user?.id);
    setLoading(false);
    if (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } else {
      await refreshProfile();
    }
  };

  const steps = [
    // Step 1: Profile (name only)
    <ScrollView key="profile" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Text style={styles.stepTitle}>Tell us about yourself</Text>
      <Text style={styles.stepSubtitle}>This helps us personalize your experience</Text>

      <Text style={styles.label}>First Name *</Text>
      <TextInput style={styles.input} placeholder="First name" placeholderTextColor={colors.mutedForeground} value={firstName} onChangeText={setFirstName} autoCapitalize="words" />

      <Text style={styles.label}>Last Name</Text>
      <TextInput style={styles.input} placeholder="Last name" placeholderTextColor={colors.mutedForeground} value={lastName} onChangeText={setLastName} autoCapitalize="words" />
    </ScrollView>,

    // Step 2: Monthly Giving (optional, default $0)
    <ScrollView key="giving" showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Support the Mission</Text>
      <Text style={styles.stepSubtitle}>Set up optional monthly giving — you can always change this later</Text>

      <View style={styles.amountDisplay}>
        <Text style={styles.amountLabel}>Monthly</Text>
        <Text style={styles.amountValue}>
          {monthlyAmount === 0 ? 'Free' : `$${monthlyAmount}`}
        </Text>
        <Text style={styles.amountSubtext}>
          {monthlyAmount === 0 ? 'No commitment needed' : 'per month'}
        </Text>
      </View>

      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={50}
          step={5}
          value={monthlyAmount}
          onValueChange={setMonthlyAmount}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
        />
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>$0</Text>
          <Text style={styles.sliderLabel}>$25</Text>
          <Text style={styles.sliderLabel}>$50</Text>
        </View>
      </View>

      {monthlyAmount > 0 && (
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Where your giving goes</Text>
          {CAUSE_BREAKDOWN.map((cause) => (
            <View key={cause.label} style={styles.breakdownRow}>
              <Ionicons name={cause.icon as any} size={18} color={colors.primary} />
              <Text style={styles.breakdownLabel}>{cause.label}</Text>
              <Text style={styles.breakdownAmount}>
                ${Math.round(monthlyAmount * cause.pct / 100)}/mo
              </Text>
              <Text style={styles.breakdownPct}>{cause.pct}%</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>,

    // Step 3: Welcome
    <View key="welcome" style={styles.centerContent}>
      <Ionicons name="heart" size={64} color={colors.primary} />
      <Text style={styles.welcomeTitle}>Welcome to DSCPLE</Text>
      <Text style={styles.welcomeText}>
        You're all set! Dive into daily devotionals, connect with missionaries, and be part of something greater.
      </Text>
    </View>,
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Progress */}
      <View style={styles.progressRow}>
        {steps.map((_, i) => (
          <View key={i} style={[styles.progressDot, i <= step && styles.progressDotActive]} />
        ))}
      </View>

      <View style={styles.content}>{steps[step]}</View>

      {/* Navigation */}
      <View style={styles.bottomRow}>
        {step > 0 && (
          <TouchableOpacity onPress={() => setStep(step - 1)}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        )}
        <View style={styles.flex} />
        {step === 1 && monthlyAmount === 0 && step < steps.length - 1 && (
          <TouchableOpacity onPress={() => setStep(step + 1)} style={{ marginRight: spacing.md }}>
            <Text style={styles.skipText}>Skip</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextButton, loading && { opacity: 0.6 }]}
          onPress={step < steps.length - 1 ? () => setStep(step + 1) : handleComplete}
          disabled={loading}
        >
          <Text style={styles.nextButtonText}>
            {loading ? 'Saving...' : step < steps.length - 1 ? 'Next' : 'Get Started'}
          </Text>
          {!loading && <Ionicons name="arrow-forward" size={18} color={colors.background} style={{ marginLeft: 6 }} />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  progressRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingTop: spacing.md },
  progressDot: { width: 32, height: 4, borderRadius: 2, backgroundColor: colors.border },
  progressDotActive: { backgroundColor: colors.foreground },
  content: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.xl },
  stepTitle: { fontFamily: fonts.bold, fontSize: fontSize['2xl'], color: colors.foreground },
  stepSubtitle: { fontFamily: fonts.regular, fontSize: fontSize.base, color: colors.mutedForeground, marginTop: spacing.xs, marginBottom: spacing.lg },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.foreground, marginBottom: spacing.xs, marginTop: spacing.md },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.lg, paddingHorizontal: spacing.md, paddingVertical: 14, fontFamily: fonts.regular, fontSize: fontSize.base, color: colors.foreground },
  flex: { flex: 1 },
  // Amount display
  amountDisplay: { alignItems: 'center', paddingVertical: spacing.xl },
  amountLabel: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.mutedForeground, textTransform: 'uppercase', letterSpacing: 1 },
  amountValue: { fontFamily: fonts.bold, fontSize: 48, color: colors.foreground, marginTop: spacing.xs },
  amountSubtext: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.mutedForeground, marginTop: spacing.xs },
  // Slider
  sliderContainer: { paddingHorizontal: spacing.sm },
  slider: { width: '100%', height: 40 },
  sliderLabels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  sliderLabel: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.mutedForeground },
  // Breakdown
  breakdownCard: { backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.lg, marginTop: spacing.lg },
  breakdownTitle: { fontFamily: fonts.semibold, fontSize: fontSize.sm, color: colors.foreground, marginBottom: spacing.md },
  breakdownRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  breakdownLabel: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.foreground, flex: 1, marginLeft: spacing.sm },
  breakdownAmount: { fontFamily: fonts.semibold, fontSize: fontSize.sm, color: colors.foreground, marginRight: spacing.sm },
  breakdownPct: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.mutedForeground, width: 32, textAlign: 'right' },
  // Welcome
  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  welcomeTitle: { fontFamily: fonts.bold, fontSize: fontSize['2xl'], color: colors.foreground, marginTop: spacing.lg },
  welcomeText: { fontFamily: fonts.regular, fontSize: fontSize.base, color: colors.mutedForeground, textAlign: 'center', lineHeight: 24, marginTop: spacing.md, paddingHorizontal: spacing.lg },
  // Navigation
  bottomRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  backText: { fontFamily: fonts.medium, fontSize: fontSize.base, color: colors.mutedForeground },
  skipText: { fontFamily: fonts.medium, fontSize: fontSize.base, color: colors.mutedForeground },
  nextButton: { flexDirection: 'row', backgroundColor: colors.foreground, borderRadius: borderRadius.xl, paddingVertical: 14, paddingHorizontal: spacing.lg, alignItems: 'center' },
  nextButtonText: { fontFamily: fonts.semibold, fontSize: fontSize.base, color: colors.background },
});
