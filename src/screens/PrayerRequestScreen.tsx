import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';
import { colors, fonts, spacing, borderRadius, fontSize } from '../lib/theme';

export default function PrayerRequestScreen() {
  const { user, profile } = useAuth();
  const [name, setName] = useState(profile?.first_name || '');
  const [request, setRequest] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [needConversation, setNeedConversation] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !request.trim()) {
      Alert.alert('Error', 'Please enter your name and prayer request');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('prayer_requests').insert({
      user_id: user?.id,
      name: name.trim(),
      prayer_request: request.trim(),
      visibility: isPublic ? 'public' : 'private',
      need_conversation: needConversation,
    });
    setLoading(false);
    if (error) {
      Alert.alert('Error', 'Failed to submit prayer request');
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Submitted', 'Your prayer request has been received. We are praying with you.');
      setRequest('');
      setNeedConversation(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Prayer Request</Text>
        <Text style={styles.subtitle}>Share your prayer needs with us</Text>

        {/* Name */}
        <Text style={styles.label}>Your Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          placeholderTextColor={colors.mutedForeground}
          value={name}
          onChangeText={setName}
        />

        {/* Prayer Request */}
        <Text style={styles.label}>Prayer Request</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Share your prayer request..."
          placeholderTextColor={colors.mutedForeground}
          value={request}
          onChangeText={setRequest}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />

        {/* Toggles */}
        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>Make Public</Text>
            <Text style={styles.toggleDesc}>Allow others to pray with you</Text>
          </View>
          <Switch
            value={isPublic}
            onValueChange={setIsPublic}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Text style={styles.toggleLabel}>Need Conversation</Text>
            <Text style={styles.toggleDesc}>A team member will reach out</Text>
          </View>
          <Switch
            value={needConversation}
            onValueChange={setNeedConversation}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.white}
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Ionicons name="send" size={18} color={colors.background} style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>{loading ? 'Submitting...' : 'Submit Prayer Request'}</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontFamily: fonts.bold, fontSize: fontSize['2xl'], color: colors.foreground, paddingHorizontal: spacing.lg, marginTop: spacing.md },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSize.base, color: colors.mutedForeground, paddingHorizontal: spacing.lg, marginTop: spacing.xs, marginBottom: spacing.lg },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.foreground, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontFamily: fonts.regular,
    fontSize: fontSize.base,
    color: colors.foreground,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  textArea: { height: 140 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  toggleInfo: { flex: 1 },
  toggleLabel: { fontFamily: fonts.medium, fontSize: fontSize.base, color: colors.foreground },
  toggleDesc: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.mutedForeground, marginTop: 2 },
  button: {
    flexDirection: 'row',
    backgroundColor: colors.foreground,
    borderRadius: borderRadius.xl,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontFamily: fonts.semibold, fontSize: fontSize.base, color: colors.background },
});
