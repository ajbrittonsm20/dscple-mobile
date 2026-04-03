import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { colors, fonts, spacing, borderRadius, fontSize } from '../lib/theme';
import { categoryImages } from '../lib/constants';

interface DevotionalCardProps {
  devotional: {
    id: string;
    title: string;
    date: string;
    category: string;
    scripture_reference: string;
    image_url?: string;
  };
  onPress: () => void;
  variant?: 'default' | 'featured';
}

export default function DevotionalCard({ devotional, onPress, variant = 'default' }: DevotionalCardProps) {
  const imageUri = devotional.image_url || categoryImages[devotional.category] || categoryImages.faith;
  const dateStr = format(new Date(devotional.date), 'MMM d, yyyy');

  if (variant === 'featured') {
    return (
      <TouchableOpacity style={styles.featuredCard} onPress={onPress} activeOpacity={0.9}>
        <Image source={{ uri: imageUri }} style={styles.featuredImage} contentFit="cover" />
        <View style={styles.featuredOverlay}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{devotional.category}</Text>
          </View>
          <Text style={styles.featuredTitle}>{devotional.title}</Text>
          <Text style={styles.featuredRef}>{devotional.scripture_reference}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Image source={{ uri: imageUri }} style={styles.thumbnail} contentFit="cover" />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>{devotional.title}</Text>
        <Text style={styles.cardRef}>{devotional.scripture_reference}</Text>
        <Text style={styles.cardDate}>{dateStr}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  thumbnail: { width: 56, height: 56, borderRadius: borderRadius.md },
  cardContent: { flex: 1, marginLeft: spacing.md },
  cardTitle: { fontFamily: fonts.semibold, fontSize: fontSize.base, color: colors.foreground },
  cardRef: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.mutedForeground, marginTop: 2 },
  cardDate: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.mutedForeground, marginTop: 2 },
  // Featured variant
  featuredCard: { marginHorizontal: spacing.lg, borderRadius: borderRadius.xl, overflow: 'hidden', height: 200, marginBottom: spacing.md },
  featuredImage: { width: '100%', height: '100%' },
  featuredOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: spacing.lg, backgroundColor: 'rgba(0,0,0,0.35)' },
  badge: { backgroundColor: 'rgba(255,255,255,0.25)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: borderRadius.full, marginBottom: spacing.sm },
  badgeText: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.white, textTransform: 'capitalize' },
  featuredTitle: { fontFamily: fonts.bold, fontSize: fontSize.xl, color: colors.white },
  featuredRef: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
});
