import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Share, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';
import { colors, fonts, spacing, borderRadius, fontSize } from '../lib/theme';
import { categoryImages } from '../lib/constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = 320;

export default function DevotionalDetailScreen({ route, navigation }: any) {
  const { devotional } = route.params;
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  // Render text with **bold** markdown support
  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return (
      <Text style={styles.bodyText}>
        {parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <Text key={i} style={styles.boldText}>{part.slice(2, -2)}</Text>;
          }
          return part;
        })}
      </Text>
    );
  };

  const imageUri = devotional.image_url || categoryImages[devotional.category] || categoryImages.faith;
  const dateStr = format(new Date(devotional.date), 'MMMM d, yyyy');

  // Check if bookmarked
  const { data: bookmark } = useQuery({
    queryKey: ['bookmark', devotional.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('devotional_id', devotional.id)
        .maybeSingle();
      return data;
    },
  });

  const isBookmarked = !!bookmark;

  const toggleBookmark = useMutation({
    mutationFn: async () => {
      if (!user) return;
      if (isBookmarked) {
        await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('devotional_id', devotional.id);
      } else {
        await supabase.from('bookmarks').insert({ user_id: user.id, devotional_id: devotional.id });
      }
    },
    onSuccess: () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      queryClient.invalidateQueries({ queryKey: ['bookmark', devotional.id] });
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${devotional.title}\n\n"${devotional.scripture_text}"\n— ${devotional.scripture_reference}\n\nShared from DSCPLE`,
      });
    } catch {}
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: imageUri }} style={styles.heroImage} contentFit="cover" />
          <View style={styles.heroGradient} />

          {/* Top Buttons */}
          <View style={[styles.topBar, { paddingTop: insets.top + spacing.sm }]}>
            <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={22} color={colors.white} />
            </TouchableOpacity>
            <View style={styles.topBarRight}>
              <TouchableOpacity style={styles.iconButton} onPress={() => toggleBookmark.mutate()}>
                <Ionicons name={isBookmarked ? 'bookmark' : 'bookmark-outline'} size={22} color={colors.white} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
                <Ionicons name="share-outline" size={22} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Hero Text */}
          <View style={styles.heroText}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{devotional.category}</Text>
            </View>
            <Text style={styles.heroTitle}>{devotional.title}</Text>
            <Text style={styles.heroDate}>{dateStr}</Text>
          </View>
        </View>

        {/* Scripture */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Scripture</Text>
          <Text style={styles.scriptureRef}>{devotional.scripture_reference}</Text>
          {devotional.scripture_text && (
            <Text style={styles.scriptureText}>"{devotional.scripture_text}"</Text>
          )}
        </View>

        {/* Reflection */}
        {devotional.reflection && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Reflection</Text>
            {renderFormattedText(devotional.reflection)}
          </View>
        )}

        {/* Prayer */}
        {devotional.prayer && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Prayer</Text>
            {renderFormattedText(devotional.prayer)}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  heroContainer: { width: SCREEN_WIDTH, height: HERO_HEIGHT },
  heroImage: { width: '100%', height: '100%' },
  heroGradient: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.md },
  topBarRight: { flexDirection: 'row', gap: spacing.sm },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  heroText: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.lg },
  categoryBadge: { backgroundColor: 'rgba(255,255,255,0.25)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: borderRadius.full, marginBottom: spacing.sm },
  categoryBadgeText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.white, textTransform: 'capitalize' },
  heroTitle: { fontFamily: fonts.bold, fontSize: fontSize['2xl'], color: colors.white },
  heroDate: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  sectionLabel: { fontFamily: fonts.semibold, fontSize: fontSize.xs, color: colors.primary, textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm },
  scriptureRef: { fontFamily: fonts.semibold, fontSize: fontSize.lg, color: colors.foreground, marginBottom: spacing.sm },
  scriptureText: { fontFamily: fonts.regular, fontSize: fontSize.base, color: colors.foreground, fontStyle: 'italic', lineHeight: 26 },
  bodyText: { fontFamily: fonts.regular, fontSize: fontSize.base, color: colors.foreground, lineHeight: 26 },
  boldText: { fontFamily: fonts.bold, fontSize: fontSize.base, color: colors.foreground },
});
