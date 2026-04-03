import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { colors, fonts, spacing, borderRadius, fontSize } from '../lib/theme';

export default function MissionaryDetailScreen({ route, navigation }: any) {
  const { id } = route.params;

  const { data: missionary, isLoading } = useQuery({
    queryKey: ['missionary', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('missionaries')
        .select('*')
        .eq('id', id)
        .single();
      return data;
    },
  });

  if (isLoading || !missionary) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isMissionary = missionary.type === 'missionary';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isMissionary ? 'Missionary' : 'Organization'}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Profile Image */}
        <View style={styles.imageContainer}>
          {missionary.image_url ? (
            <Image
              source={{ uri: missionary.image_url }}
              style={styles.profileImage}
              contentFit="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons
                name={isMissionary ? 'person' : 'business'}
                size={48}
                color={colors.mutedForeground}
              />
            </View>
          )}
        </View>

        {/* Name & Location */}
        <View style={styles.infoSection}>
          <Text style={styles.name}>{missionary.name}</Text>

          <View style={styles.typeBadge}>
            <Ionicons
              name={isMissionary ? 'person' : 'business'}
              size={14}
              color={colors.primary}
            />
            <Text style={styles.typeText}>
              {isMissionary ? 'Missionary' : 'Non-Profit'}
            </Text>
          </View>

          {missionary.location && (
            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color={colors.primary} />
              <Text style={styles.locationText}>{missionary.location}</Text>
            </View>
          )}
        </View>

        {/* Description */}
        {missionary.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionLabel}>About</Text>
            <Text style={styles.description}>{missionary.description}</Text>
          </View>
        )}

        {/* Website */}
        {missionary.website_url && (
          <TouchableOpacity
            style={styles.websiteButton}
            onPress={() => Linking.openURL(missionary.website_url)}
          >
            <Ionicons name="globe-outline" size={18} color={colors.primary} />
            <Text style={styles.websiteText}>Visit Website</Text>
            <Ionicons name="open-outline" size={16} color={colors.primary} />
          </TouchableOpacity>
        )}

        {/* Support Button */}
        <TouchableOpacity
          style={styles.supportButton}
          onPress={() => navigation.navigate('Give', { screen: 'DonateMain' })}
        >
          <Ionicons name="heart" size={18} color="#FFFFFF" />
          <Text style={styles.supportButtonText}>Support This Mission</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.lg,
    color: colors.foreground,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.base,
    color: colors.mutedForeground,
  },
  imageContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  name: {
    fontFamily: fonts.bold,
    fontSize: fontSize['2xl'],
    color: colors.foreground,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginBottom: spacing.sm,
  },
  typeText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  locationText: {
    fontFamily: fonts.regular,
    fontSize: fontSize.base,
    color: colors.mutedForeground,
  },
  descriptionSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.lg,
    color: colors.foreground,
    marginBottom: spacing.sm,
  },
  description: {
    fontFamily: fonts.regular,
    fontSize: fontSize.base,
    color: colors.foreground,
    lineHeight: 24,
  },
  websiteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  websiteText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.base,
    color: colors.primary,
    flex: 1,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
  },
  supportButtonText: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.base,
    color: '#FFFFFF',
  },
});
