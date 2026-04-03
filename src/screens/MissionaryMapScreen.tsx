import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { colors, fonts, spacing, borderRadius, fontSize } from '../lib/theme';

// Note: react-native-maps requires native build (not available in Expo Go for all features)
// Using a placeholder until native build is configured
export default function MissionaryMapScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const { data: missionaries = [], isLoading } = useQuery({
    queryKey: ['missionaries'],
    queryFn: async () => {
      const { data } = await supabase
        .from('missionaries')
        .select('*')
        .not('latitude', 'is', null);
      return data ?? [];
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.title}>Missionary Map</Text>
        <View style={{ width: 24 }} />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1 }} />
      ) : (
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map" size={64} color={colors.mutedForeground} />
          <Text style={styles.placeholderTitle}>Map View</Text>
          <Text style={styles.placeholderText}>
            {missionaries.length} missionaries with locations
          </Text>
          <Text style={styles.placeholderNote}>
            Native map will render in device builds
          </Text>

          {/* List fallback */}
          {missionaries.map((m: any) => (
            <View key={m.id} style={styles.locationItem}>
              <Ionicons name="location" size={16} color={colors.primary} />
              <Text style={styles.locationName}>{m.name}</Text>
              <Text style={styles.locationPlace}>{m.location}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingBottom: spacing.md, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontFamily: fonts.bold, fontSize: fontSize.xl, color: colors.foreground },
  mapPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  placeholderTitle: { fontFamily: fonts.semibold, fontSize: fontSize.lg, color: colors.foreground, marginTop: spacing.md },
  placeholderText: { fontFamily: fonts.regular, fontSize: fontSize.base, color: colors.mutedForeground, marginTop: spacing.xs },
  placeholderNote: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.mutedForeground, marginTop: spacing.xs, fontStyle: 'italic' },
  locationItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md, backgroundColor: colors.card, padding: spacing.md, borderRadius: borderRadius.lg, width: '100%' },
  locationName: { fontFamily: fonts.semibold, fontSize: fontSize.sm, color: colors.foreground, flex: 1 },
  locationPlace: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.mutedForeground },
});
