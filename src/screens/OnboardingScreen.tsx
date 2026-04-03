import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';
import { colors, fonts, spacing, borderRadius, fontSize } from '../lib/theme';

export default function OnboardingScreen() {
  const { user, refreshProfile } = useAuth();
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    if (!firstName.trim()) {
      Alert.alert('Error', 'Please enter your first name');
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        full_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        address: address.trim() || null,
        city: city.trim() || null,
        state: state.trim() || null,
        zip: zip.trim() || null,
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
    // Step 1: Profile
    <ScrollView key="profile" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Text style={styles.stepTitle}>Tell us about yourself</Text>
      <Text style={styles.stepSubtitle}>This helps us personalize your experience</Text>

      <Text style={styles.label}>First Name *</Text>
      <TextInput style={styles.input} placeholder="First name" placeholderTextColor={colors.mutedForeground} value={firstName} onChangeText={setFirstName} autoCapitalize="words" />

      <Text style={styles.label}>Last Name</Text>
      <TextInput style={styles.input} placeholder="Last name" placeholderTextColor={colors.mutedForeground} value={lastName} onChangeText={setLastName} autoCapitalize="words" />

      <Text style={styles.label}>Address (optional)</Text>
      <TextInput style={styles.input} placeholder="Street address" placeholderTextColor={colors.mutedForeground} value={address} onChangeText={setAddress} />

      <View style={styles.row}>
        <View style={styles.flex}>
          <Text style={styles.label}>City</Text>
          <TextInput style={styles.input} placeholder="City" placeholderTextColor={colors.mutedForeground} value={city} onChangeText={setCity} />
        </View>
        <View style={{ width: spacing.sm }} />
        <View style={{ width: 80 }}>
          <Text style={styles.label}>State</Text>
          <TextInput style={styles.input} placeholder="ST" placeholderTextColor={colors.mutedForeground} value={state} onChangeText={setState} maxLength={2} autoCapitalize="characters" />
        </View>
        <View style={{ width: spacing.sm }} />
        <View style={{ width: 100 }}>
          <Text style={styles.label}>ZIP</Text>
          <TextInput style={styles.input} placeholder="ZIP" placeholderTextColor={colors.mutedForeground} value={zip} onChangeText={setZip} keyboardType="numeric" maxLength={5} />
        </View>
      </View>
    </ScrollView>,

    // Step 2: Welcome
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
  row: { flexDirection: 'row' },
  flex: { flex: 1 },
  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  welcomeTitle: { fontFamily: fonts.bold, fontSize: fontSize['2xl'], color: colors.foreground, marginTop: spacing.lg },
  welcomeText: { fontFamily: fonts.regular, fontSize: fontSize.base, color: colors.mutedForeground, textAlign: 'center', lineHeight: 24, marginTop: spacing.md, paddingHorizontal: spacing.lg },
  bottomRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  backText: { fontFamily: fonts.medium, fontSize: fontSize.base, color: colors.mutedForeground },
  nextButton: { flexDirection: 'row', backgroundColor: colors.foreground, borderRadius: borderRadius.xl, paddingVertical: 14, paddingHorizontal: spacing.lg, alignItems: 'center' },
  nextButtonText: { fontFamily: fonts.semibold, fontSize: fontSize.base, color: colors.background },
});
