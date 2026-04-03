import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';
import { colors, fonts, spacing, borderRadius, fontSize } from '../lib/theme';
import { categoryImages } from '../lib/constants';
import DevotionalCard from '../components/DevotionalCard';
import { Image } from 'expo-image';

export default function DevotionalsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  const { data: devotionals = [], isLoading } = useQuery({
    queryKey: ['devotionals'],
    queryFn: async () => {
      const { data } = await supabase
        .from('devotionals')
        .select('*')
        .order('date', { ascending: false })
        .limit(50);
      return data ?? [];
    },
  });

  const { data: savedDevotionals = [] } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: async () => {
      if (!user) return [];
      const { data: bookmarks } = await supabase
        .from('bookmarks')
        .select('devotional_id')
        .eq('user_id', user.id);
      if (!bookmarks?.length) return [];
      const ids = bookmarks.map((b: any) => b.devotional_id);
      const { data: devos } = await supabase
        .from('devotionals')
        .select('*')
        .in('id', ids)
        .order('date', { ascending: false });
      return devos ?? [];
    },
  });

  const filtered = useMemo(() => {
    if (!search.trim()) return devotionals;
    const q = search.toLowerCase();
    return devotionals.filter((d: any) =>
      d.title.toLowerCase().includes(q) || d.scripture_reference.toLowerCase().includes(q)
    );
  }, [devotionals, search]);

  const renderHeader = () => (
    <View>
      {/* Saved Section */}
      {savedDevotionals.length > 0 && !search.trim() && (
        <View style={styles.savedSection}>
          <View style={styles.savedHeader}>
            <Ionicons name="bookmark" size={16} color={colors.primary} />
            <Text style={styles.savedTitle}>Saved</Text>
            <Text style={styles.savedCount}>{savedDevotionals.length}</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.savedScroll}>
            {savedDevotionals.map((d: any) => (
              <TouchableOpacity
                key={d.id}
                style={styles.savedCard}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('DevotionalDetail', { devotional: d })}
              >
                <Image
                  source={{ uri: d.image_url || categoryImages[d.category] || categoryImages.faith }}
                  style={styles.savedImage}
                  contentFit="cover"
                />
                <Text style={styles.savedCardTitle} numberOfLines={2}>{d.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Devotionals</Text>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={colors.mutedForeground} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title or scripture..."
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* List */}
      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item: any) => item.id}
          ListHeaderComponent={renderHeader}
          renderItem={({ item }) => (
            <DevotionalCard
              devotional={item}
              onPress={() => navigation.navigate('DevotionalDetail', { devotional: item })}
            />
          )}
          contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: 20 }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="book-outline" size={48} color={colors.mutedForeground} />
              <Text style={styles.emptyText}>No devotionals found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontFamily: fonts.bold, fontSize: fontSize['2xl'], color: colors.foreground, paddingHorizontal: spacing.lg, marginTop: spacing.md },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, paddingVertical: 12, marginLeft: spacing.sm, fontFamily: fonts.regular, fontSize: fontSize.base, color: colors.foreground },
  // Saved section
  savedSection: { marginBottom: spacing.md },
  savedHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  savedTitle: { fontFamily: fonts.semibold, fontSize: fontSize.lg, color: colors.foreground },
  savedCount: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.mutedForeground, backgroundColor: colors.secondary, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, overflow: 'hidden' },
  savedScroll: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  savedCard: { width: 130, borderRadius: borderRadius.lg, overflow: 'hidden', backgroundColor: colors.card },
  savedImage: { width: 130, height: 90, borderTopLeftRadius: borderRadius.lg, borderTopRightRadius: borderRadius.lg },
  savedCardTitle: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.foreground, padding: spacing.sm, lineHeight: 16 },
  // Empty
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontFamily: fonts.regular, fontSize: fontSize.base, color: colors.mutedForeground, marginTop: spacing.md },
});
