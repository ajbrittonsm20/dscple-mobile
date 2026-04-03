import React, { useState, useMemo } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { supabase } from '../lib/supabase';
import { colors, fonts, spacing, borderRadius, fontSize } from '../lib/theme';
import DevotionalCard from '../components/DevotionalCard';

const MONTHS = [
  'all', 'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
] as const;

export default function DevotionalsScreen({ navigation }: any) {
  const [search, setSearch] = useState('');
  const [activeMonth, setActiveMonth] = useState<string>('all');

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
    let result = devotionals;
    if (activeMonth !== 'all') {
      const monthIndex = MONTHS.indexOf(activeMonth as any);
      result = result.filter((d: any) => {
        const date = new Date(d.date);
        return date.getMonth() + 1 === monthIndex;
      });
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((d: any) =>
        d.title.toLowerCase().includes(q) || d.scripture_reference.toLowerCase().includes(q)
      );
    }
    return result;
  }, [devotionals, activeMonth, search]);

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

      {/* Month Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillsContainer} contentContainerStyle={styles.pillsContent}>
        {MONTHS.map((month) => (
          <TouchableOpacity
            key={month}
            style={[styles.pill, activeMonth === month && styles.pillActive]}
            onPress={() => setActiveMonth(month)}
          >
            <Text style={[styles.pillText, activeMonth === month && styles.pillTextActive]}>
              {month === 'all' ? 'All' : month.charAt(0).toUpperCase() + month.slice(1, 3)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
          contentContainerStyle={{ paddingBottom: 20 }}
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
  pillsContainer: { marginTop: spacing.md, maxHeight: 44 },
  pillsContent: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: borderRadius.full, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  pillActive: { backgroundColor: colors.foreground, borderColor: colors.foreground },
  pillText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.foreground },
  pillTextActive: { color: colors.background },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontFamily: fonts.regular, fontSize: fontSize.base, color: colors.mutedForeground, marginTop: spacing.md },
});
