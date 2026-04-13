import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, FlatList, StyleSheet, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';
import { colors, fonts, spacing, borderRadius, fontSize } from '../lib/theme';

export default function PrayerRequestScreen() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'board' | 'submit'>('board');
  const [name, setName] = useState(profile?.first_name || '');
  const [request, setRequest] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [needConversation, setNeedConversation] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch public prayer requests
  const { data: publicPrayers = [], isLoading: loadingPrayers } = useQuery({
    queryKey: ['public-prayers'],
    queryFn: async () => {
      const { data } = await supabase
        .from('prayer_requests')
        .select('*')
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .limit(50);
      return data ?? [];
    },
  });

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
      queryClient.invalidateQueries({ queryKey: ['public-prayers'] });
      setActiveTab('board');
    }
  };

  const renderPrayerCard = ({ item }: { item: any }) => (
    <View style={styles.prayerCard}>
      <View style={styles.prayerHeader}>
        <View style={styles.prayerAvatar}>
          <Text style={styles.prayerAvatarText}>{item.name?.[0]?.toUpperCase() || '?'}</Text>
        </View>
        <View style={styles.prayerMeta}>
          <Text style={styles.prayerName}>{item.name}</Text>
          <Text style={styles.prayerTime}>
            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
          </Text>
        </View>
      </View>
      <Text style={styles.prayerText}>{item.prayer_request}</Text>
      <View style={styles.prayerFooter}>
        <Ionicons name="heart-outline" size={16} color={colors.mutedForeground} />
        <Text style={styles.prayerFooterText}>Praying for you</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Prayer</Text>
      <Text style={styles.subtitle}>Lift each other up in prayer</Text>

      {/* Tabs */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'board' && styles.tabActive]}
          onPress={() => setActiveTab('board')}
        >
          <Ionicons name="people" size={14} color={activeTab === 'board' ? colors.foreground : colors.mutedForeground} />
          <Text style={[styles.tabText, activeTab === 'board' && styles.tabTextActive]}> Prayer Board</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'submit' && styles.tabActive]}
          onPress={() => setActiveTab('submit')}
        >
          <Ionicons name="create" size={14} color={activeTab === 'submit' ? colors.foreground : colors.mutedForeground} />
          <Text style={[styles.tabText, activeTab === 'submit' && styles.tabTextActive]}> Submit</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'board' ? (
        <>
          {loadingPrayers ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Loading prayers...</Text>
            </View>
          ) : publicPrayers.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="heart-outline" size={48} color={colors.mutedForeground} />
              <Text style={styles.emptyText}>No public prayer requests yet</Text>
              <Text style={styles.emptySubtext}>Be the first to share a prayer</Text>
              <TouchableOpacity style={styles.emptyButton} onPress={() => setActiveTab('submit')}>
                <Text style={styles.emptyButtonText}>Submit a Prayer</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={publicPrayers}
              keyExtractor={(item) => item.id}
              renderItem={renderPrayerCard}
              contentContainerStyle={{ paddingBottom: 20 }}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
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
              <Text style={styles.toggleDesc}>Share on the prayer board for others to pray with you</Text>
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
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontFamily: fonts.bold, fontSize: fontSize['2xl'], color: colors.foreground, paddingHorizontal: spacing.lg, marginTop: spacing.md },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSize.base, color: colors.mutedForeground, paddingHorizontal: spacing.lg, marginTop: spacing.xs, marginBottom: spacing.md },
  // Tabs
  tabRow: { flexDirection: 'row', marginHorizontal: spacing.lg, backgroundColor: colors.secondary, borderRadius: borderRadius.lg, padding: 4, marginBottom: spacing.md },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: borderRadius.md },
  tabActive: { backgroundColor: colors.card },
  tabText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.mutedForeground },
  tabTextActive: { color: colors.foreground },
  // Prayer Board
  prayerCard: { backgroundColor: colors.card, marginHorizontal: spacing.lg, marginBottom: spacing.sm, borderRadius: borderRadius.lg, padding: spacing.md },
  prayerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  prayerAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' },
  prayerAvatarText: { fontFamily: fonts.semibold, fontSize: fontSize.sm, color: colors.white },
  prayerMeta: { marginLeft: spacing.sm, flex: 1 },
  prayerName: { fontFamily: fonts.semibold, fontSize: fontSize.sm, color: colors.foreground },
  prayerTime: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.mutedForeground },
  prayerText: { fontFamily: fonts.regular, fontSize: fontSize.base, color: colors.foreground, lineHeight: 22 },
  prayerFooter: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  prayerFooterText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.mutedForeground, marginLeft: 6 },
  // Empty
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontFamily: fonts.regular, fontSize: fontSize.base, color: colors.mutedForeground, marginTop: spacing.md },
  emptySubtext: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.mutedForeground, marginTop: spacing.xs },
  emptyButton: { backgroundColor: colors.foreground, borderRadius: borderRadius.xl, paddingVertical: 12, paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  emptyButtonText: { fontFamily: fonts.semibold, fontSize: fontSize.sm, color: colors.background },
  // Submit form
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
