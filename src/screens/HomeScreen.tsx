import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';
import { colors, fonts, spacing, borderRadius, fontSize } from '../lib/theme';
import { categoryImages } from '../lib/constants';
import DevotionalCard from '../components/DevotionalCard';

export default function HomeScreen({ navigation }: any) {
  const { profile } = useAuth();

  const { data: devotionals = [], isLoading } = useQuery({
    queryKey: ['devotionals'],
    queryFn: async () => {
      const { data } = await supabase
        .from('devotionals')
        .select('*')
        .order('date', { ascending: false })
        .limit(10);
      return data ?? [];
    },
  });

  const todaysDevotional = devotionals[0];
  const pastDevotionals = devotionals.slice(1, 4);
  const initials = profile?.first_name
    ? `${profile.first_name[0]}${profile.last_name?.[0] ?? ''}`
    : '?';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/images/logo-header.png')}
            style={styles.headerLogo}
            contentFit="contain"
          />
          <TouchableOpacity style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </TouchableOpacity>
        </View>

        {/* Hero */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Live It Every Day</Text>
          <View style={styles.heroLinks}>
            <Text style={styles.heroLink}>Mission</Text>
            <Text style={styles.heroDot}> · </Text>
            <Text style={styles.heroLink}>Devotional</Text>
            <Text style={styles.heroDot}> · </Text>
            <Text style={styles.heroLink}>Prayer</Text>
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : todaysDevotional ? (
          <>
            {/* Today's Devotional */}
            <TouchableOpacity
              style={styles.todayCard}
              onPress={() => navigation.navigate('DevotionalDetail', { devotional: todaysDevotional })}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: todaysDevotional.image_url || categoryImages[todaysDevotional.category] || categoryImages.faith }}
                style={styles.todayImage}
                contentFit="cover"
              />
              <View style={styles.todayOverlay}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{todaysDevotional.category}</Text>
                </View>
                <Text style={styles.todayTitle}>{todaysDevotional.title}</Text>
                <Text style={styles.todayRef}>{todaysDevotional.scripture_reference}</Text>
              </View>
            </TouchableOpacity>

            {/* Verse of the Day */}
            <View style={styles.verseCard}>
              <Text style={styles.verseLabel}>Verse of the Day</Text>
              <Text style={styles.verseText}>"{todaysDevotional.scripture_text}"</Text>
              <Text style={styles.verseRef}>— {todaysDevotional.scripture_reference}</Text>
            </View>

            {/* Past Readings */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Past Readings</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Saved')}>
                <Ionicons name="bookmark-outline" size={20} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            {pastDevotionals.map((d: any) => (
              <DevotionalCard
                key={d.id}
                devotional={d}
                onPress={() => navigation.navigate('DevotionalDetail', { devotional: d })}
              />
            ))}
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={48} color={colors.mutedForeground} />
            <Text style={styles.emptyText}>No devotionals yet</Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  headerLogo: { width: 120, height: 28 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.foreground, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontFamily: fonts.semibold, fontSize: fontSize.sm, color: colors.background },
  heroSection: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  heroTitle: { fontFamily: fonts.bold, fontSize: fontSize['3xl'], color: colors.foreground },
  heroLinks: { flexDirection: 'row', marginTop: spacing.xs },
  heroLink: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.mutedForeground },
  heroDot: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.mutedForeground },
  todayCard: { marginHorizontal: spacing.lg, borderRadius: borderRadius.xl, overflow: 'hidden', height: 220 },
  todayImage: { width: '100%', height: '100%' },
  todayOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: spacing.lg, backgroundColor: 'rgba(0,0,0,0.35)' },
  categoryBadge: { backgroundColor: 'rgba(255,255,255,0.25)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: borderRadius.full, marginBottom: spacing.sm },
  categoryBadgeText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.white, textTransform: 'capitalize' },
  todayTitle: { fontFamily: fonts.bold, fontSize: fontSize.xl, color: colors.white },
  todayRef: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  verseCard: { margin: spacing.lg, backgroundColor: colors.card, borderRadius: borderRadius.xl, padding: spacing.lg },
  verseLabel: { fontFamily: fonts.semibold, fontSize: fontSize.xs, color: colors.primary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm },
  verseText: { fontFamily: fonts.regular, fontSize: fontSize.base, color: colors.foreground, fontStyle: 'italic', lineHeight: 24 },
  verseRef: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.mutedForeground, marginTop: spacing.sm },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  sectionTitle: { fontFamily: fonts.semibold, fontSize: fontSize.lg, color: colors.foreground },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontFamily: fonts.regular, fontSize: fontSize.base, color: colors.mutedForeground, marginTop: spacing.md },
});
