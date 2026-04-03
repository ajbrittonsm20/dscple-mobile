import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { colors, fonts, spacing, borderRadius, fontSize } from '../lib/theme';
import DevotionalCard from '../components/DevotionalCard';

export default function DevotionalsScreen({ navigation }: any) {
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

  const filtered = useMemo(() => {
    if (!search.trim()) return devotionals;
    const q = search.toLowerCase();
    return devotionals.filter((d: any) =>
      d.title.toLowerCase().includes(q) || d.scripture_reference.toLowerCase().includes(q)
    );
  }, [devotionals, search]);

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
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontFamily: fonts.regular, fontSize: fontSize.base, color: colors.mutedForeground, marginTop: spacing.md },
});
