import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';
import { colors, fonts, spacing, fontSize } from '../lib/theme';
import DevotionalCard from '../components/DevotionalCard';

export default function SavedScreen({ navigation }: any) {
  const { user } = useAuth();

  const { data: savedDevotionals = [], isLoading } = useQuery({
    queryKey: ['bookmarks'],
    queryFn: async () => {
      if (!user) return [];
      const { data: bookmarks } = await supabase
        .from('bookmarks')
        .select('devotional_id')
        .eq('user_id', user.id);
      if (!bookmarks?.length) return [];
      const ids = bookmarks.map((b: any) => b.devotional_id);
      const { data: devotionals } = await supabase
        .from('devotionals')
        .select('*')
        .in('id', ids)
        .order('date', { ascending: false });
      return devotionals ?? [];
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.title}>Saved</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={savedDevotionals}
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
              <Ionicons name="bookmark-outline" size={48} color={colors.mutedForeground} />
              <Text style={styles.emptyTitle}>No saved devotionals</Text>
              <Text style={styles.emptySubtitle}>Tap the bookmark icon on any devotional to save it here</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  title: { fontFamily: fonts.bold, fontSize: fontSize.xl, color: colors.foreground },
  emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: spacing.xl },
  emptyTitle: { fontFamily: fonts.semibold, fontSize: fontSize.lg, color: colors.foreground, marginTop: spacing.md },
  emptySubtitle: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.mutedForeground, textAlign: 'center', marginTop: spacing.xs },
});
