import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';
import { colors, fonts, spacing, borderRadius, fontSize } from '../lib/theme';

export default function ProfileScreen() {
  const { user, profile, signOut } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  // Fetch user's subscription
  const { data: subscription } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();
      return data;
    },
  });

  // Fetch user's donation history
  const { data: donations = [] } = useQuery({
    queryKey: ['my-donations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('donations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);
      return data ?? [];
    },
  });

  const totalDonated = donations.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          await signOut();
          setLoggingOut(false);
        },
      },
    ]);
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'To cancel your monthly giving, please contact our team and we\'ll take care of it for you.',
      [
        { text: 'OK', style: 'cancel' },
        {
          text: 'Contact Team',
          onPress: () => Linking.openURL('mailto:andrew@colab.so?subject=Cancel%20DSCPLE%20Subscription'),
        },
      ]
    );
  };

  const handleContact = () => {
    Linking.openURL('mailto:andrew@colab.so?subject=DSCPLE%20App%20-%20Contact');
  };

  const initials = profile?.first_name
    ? `${profile.first_name[0]}${profile.last_name?.[0] ?? ''}`
    : '?';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Profile</Text>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.profileName}>
            {profile?.first_name} {profile?.last_name}
          </Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
        </View>

        {/* Giving Summary */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>${totalDonated.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Given</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{donations.length}</Text>
            <Text style={styles.statLabel}>Donations</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {subscription ? `$${subscription.amount}/mo` : 'None'}
            </Text>
            <Text style={styles.statLabel}>Monthly</Text>
          </View>
        </View>

        {/* Subscription Section */}
        <Text style={styles.sectionTitle}>Monthly Giving</Text>
        {subscription ? (
          <View style={styles.menuCard}>
            <View style={styles.menuRow}>
              <Ionicons name="heart" size={20} color={colors.primary} />
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>Active Subscription</Text>
                <Text style={styles.menuDesc}>${subscription.amount}/month</Text>
              </View>
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>Active</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelSubscription}>
              <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.menuCard}>
            <View style={styles.menuRow}>
              <Ionicons name="heart-outline" size={20} color={colors.mutedForeground} />
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>No Active Subscription</Text>
                <Text style={styles.menuDesc}>Set up monthly giving to support the mission</Text>
              </View>
            </View>
          </View>
        )}

        {/* Menu Items */}
        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuRow} onPress={handleContact}>
            <Ionicons name="mail-outline" size={20} color={colors.foreground} />
            <View style={styles.menuInfo}>
              <Text style={styles.menuLabel}>Contact Us</Text>
              <Text style={styles.menuDesc}>Message our team</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuRow} onPress={() => Linking.openURL('https://dscple.com')}>
            <Ionicons name="globe-outline" size={20} color={colors.foreground} />
            <View style={styles.menuInfo}>
              <Text style={styles.menuLabel}>Visit Website</Text>
              <Text style={styles.menuDesc}>dscple.com</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          <Ionicons name="log-out-outline" size={20} color="#D32F2F" />
          <Text style={styles.logoutText}>{loggingOut ? 'Logging out...' : 'Log Out'}</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>DSCPLE v1.0.0</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontFamily: fonts.bold, fontSize: fontSize['2xl'], color: colors.foreground, paddingHorizontal: spacing.lg, marginTop: spacing.md, marginBottom: spacing.md },
  // Profile Card
  profileCard: { alignItems: 'center', paddingVertical: spacing.lg },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  avatarText: { fontFamily: fonts.bold, fontSize: fontSize['2xl'], color: colors.white },
  profileName: { fontFamily: fonts.bold, fontSize: fontSize.xl, color: colors.foreground },
  profileEmail: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.mutedForeground, marginTop: 4 },
  // Stats
  statsRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.lg },
  statCard: { flex: 1, backgroundColor: colors.card, borderRadius: borderRadius.lg, padding: spacing.md, alignItems: 'center' },
  statValue: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.foreground },
  statLabel: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.mutedForeground, marginTop: 4 },
  // Sections
  sectionTitle: { fontFamily: fonts.semibold, fontSize: fontSize.sm, color: colors.mutedForeground, paddingHorizontal: spacing.lg, marginBottom: spacing.sm, marginTop: spacing.sm, textTransform: 'uppercase', letterSpacing: 1 },
  // Menu
  menuCard: { backgroundColor: colors.card, marginHorizontal: spacing.lg, borderRadius: borderRadius.lg, marginBottom: spacing.sm, overflow: 'hidden' },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.md },
  menuInfo: { flex: 1, marginLeft: spacing.md },
  menuLabel: { fontFamily: fonts.medium, fontSize: fontSize.base, color: colors.foreground },
  menuDesc: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.mutedForeground, marginTop: 2 },
  activeBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: borderRadius.full },
  activeBadgeText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: '#2E7D32' },
  cancelButton: { borderTopWidth: 1, borderTopColor: colors.border, padding: spacing.md, alignItems: 'center' },
  cancelButtonText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: '#D32F2F' },
  // Logout
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: spacing.lg, marginTop: spacing.lg, paddingVertical: 16, backgroundColor: colors.card, borderRadius: borderRadius.lg },
  logoutText: { fontFamily: fonts.semibold, fontSize: fontSize.base, color: '#D32F2F', marginLeft: spacing.sm },
  // Version
  versionText: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.mutedForeground, textAlign: 'center', marginTop: spacing.lg },
});
