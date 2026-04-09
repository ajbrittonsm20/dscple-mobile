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

// Daily verse - rotates based on the day of the year
const DAILY_VERSES = [
  { text: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.', ref: 'Jeremiah 29:11' },
  { text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.', ref: 'Proverbs 3:5-6' },
  { text: 'I can do all this through him who gives me strength.', ref: 'Philippians 4:13' },
  { text: 'The Lord is my shepherd, I lack nothing.', ref: 'Psalm 23:1' },
  { text: 'Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.', ref: 'Joshua 1:9' },
  { text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.', ref: 'Romans 8:28' },
  { text: 'The Lord is my light and my salvation—whom shall I fear? The Lord is the stronghold of my life—of whom shall I be afraid?', ref: 'Psalm 27:1' },
  { text: 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.', ref: 'Isaiah 40:31' },
  { text: 'Cast all your anxiety on him because he cares for you.', ref: '1 Peter 5:7' },
  { text: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.', ref: 'Philippians 4:6' },
  { text: 'Come to me, all you who are weary and burdened, and I will give you rest.', ref: 'Matthew 11:28' },
  { text: 'The Lord your God is in your midst, a mighty one who will save; he will rejoice over you with gladness; he will quiet you by his love.', ref: 'Zephaniah 3:17' },
  { text: 'Have I not commanded you? Be strong and courageous. Do not be frightened, and do not be dismayed, for the Lord your God is with you wherever you go.', ref: 'Joshua 1:9' },
  { text: 'But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control.', ref: 'Galatians 5:22-23' },
  { text: 'He heals the brokenhearted and binds up their wounds.', ref: 'Psalm 147:3' },
  { text: 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you.', ref: 'Isaiah 41:10' },
  { text: 'Delight yourself in the Lord, and he will give you the desires of your heart.', ref: 'Psalm 37:4' },
  { text: 'The name of the Lord is a fortified tower; the righteous run to it and are safe.', ref: 'Proverbs 18:10' },
  { text: 'God is our refuge and strength, an ever-present help in trouble.', ref: 'Psalm 46:1' },
  { text: 'For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.', ref: 'John 3:16' },
  { text: 'The steadfast love of the Lord never ceases; his mercies never come to an end; they are new every morning; great is your faithfulness.', ref: 'Lamentations 3:22-23' },
  { text: 'Be still, and know that I am God.', ref: 'Psalm 46:10' },
  { text: 'If God is for us, who can be against us?', ref: 'Romans 8:31' },
  { text: 'The Lord is close to the brokenhearted and saves those who are crushed in spirit.', ref: 'Psalm 34:18' },
  { text: 'His grace is sufficient for you, for his power is made perfect in weakness.', ref: '2 Corinthians 12:9' },
  { text: 'This is the day the Lord has made; let us rejoice and be glad in it.', ref: 'Psalm 118:24' },
  { text: 'In their hearts humans plan their course, but the Lord establishes their steps.', ref: 'Proverbs 16:9' },
  { text: 'The Lord will fight for you; you need only to be still.', ref: 'Exodus 14:14' },
  { text: 'Love is patient, love is kind. It does not envy, it does not boast, it is not proud.', ref: '1 Corinthians 13:4' },
  { text: 'Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.', ref: 'John 14:27' },
  { text: 'Create in me a pure heart, O God, and renew a steadfast spirit within me.', ref: 'Psalm 51:10' },
];

function getDailyVerse() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return DAILY_VERSES[dayOfYear % DAILY_VERSES.length];
}

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
            {(() => {
              const dailyVerse = getDailyVerse();
              return (
                <View style={styles.verseCard}>
                  <Text style={styles.verseLabel}>Verse of the Day</Text>
                  <Text style={styles.verseText}>"{dailyVerse.text}"</Text>
                  <Text style={styles.verseRef}>— {dailyVerse.ref}</Text>
                </View>
              );
            })()}

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
