import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { colors, fonts, spacing, borderRadius, fontSize } from '../lib/theme';

export default function MissionScreen({ navigation }: any) {
  const { data: missionaries = [], isLoading } = useQuery({
    queryKey: ['missionaries'],
    queryFn: async () => {
      const { data } = await supabase.from('missionaries').select('*').order('name');
      return data ?? [];
    },
  });

  const missionaryList = missionaries.filter((m: any) => m.type === 'missionary');
  const nonprofitList = missionaries.filter((m: any) => m.type === 'nonprofit');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Our Mission</Text>
          <TouchableOpacity onPress={() => navigation.navigate('DonateMain')}>
            <Text style={styles.donateLink}>Donate</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.missionText}>
          DSCPLE exists to make disciples of all nations by supporting missionaries and faith-based
          nonprofits around the world. 100% of your giving goes directly to the mission field.
        </Text>

        {isLoading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Missionaries */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Missionaries</Text>
              <TouchableOpacity onPress={() => navigation.navigate('MissionaryMap')}>
                <Text style={styles.viewMapLink}>View Map</Text>
              </TouchableOpacity>
            </View>

            {missionaryList.map((m: any) => (
              <TouchableOpacity key={m.id} style={styles.personCard} activeOpacity={0.7} onPress={() => navigation.navigate('MissionaryDetail', { id: m.id })}>
                {m.image_url ? (
                  <Image source={{ uri: m.image_url }} style={styles.personImage} contentFit="cover" />
                ) : (
                  <View style={styles.personPlaceholder}>
                    <Ionicons name="person" size={20} color={colors.mutedForeground} />
                  </View>
                )}
                <View style={styles.personInfo}>
                  <Text style={styles.personName}>{m.name}</Text>
                  {m.location && <Text style={styles.personLocation}>{m.location}</Text>}
                  {m.description && <Text style={styles.personDesc} numberOfLines={2}>{m.description}</Text>}
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
              </TouchableOpacity>
            ))}

            {/* Non Profits */}
            {nonprofitList.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { paddingHorizontal: spacing.lg, marginTop: spacing.lg }]}>Non Profits</Text>
                {nonprofitList.map((m: any) => (
                  <TouchableOpacity key={m.id} style={styles.personCard} activeOpacity={0.7} onPress={() => navigation.navigate('MissionaryDetail', { id: m.id })}>
                    {m.image_url ? (
                      <Image source={{ uri: m.image_url }} style={styles.personImage} contentFit="cover" />
                    ) : (
                      <View style={styles.personPlaceholder}>
                        <Ionicons name="business" size={20} color={colors.mutedForeground} />
                      </View>
                    )}
                    <View style={styles.personInfo}>
                      <Text style={styles.personName}>{m.name}</Text>
                      {m.location && <Text style={styles.personLocation}>{m.location}</Text>}
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.mutedForeground} />
                  </TouchableOpacity>
                ))}
              </>
            )}
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  title: { fontFamily: fonts.bold, fontSize: fontSize['2xl'], color: colors.foreground },
  donateLink: { fontFamily: fonts.semibold, fontSize: fontSize.sm, color: colors.primary },
  missionText: { fontFamily: fonts.regular, fontSize: fontSize.base, color: colors.foreground, lineHeight: 24, paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  sectionTitle: { fontFamily: fonts.semibold, fontSize: fontSize.lg, color: colors.foreground },
  viewMapLink: { fontFamily: fonts.semibold, fontSize: fontSize.sm, color: colors.primary },
  personCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, marginHorizontal: spacing.lg, marginBottom: spacing.sm, borderRadius: borderRadius.lg, padding: spacing.md },
  personImage: { width: 48, height: 48, borderRadius: 24 },
  personPlaceholder: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.secondary, justifyContent: 'center', alignItems: 'center' },
  personInfo: { flex: 1, marginLeft: spacing.md },
  personName: { fontFamily: fonts.semibold, fontSize: fontSize.base, color: colors.foreground },
  personLocation: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.mutedForeground, marginTop: 2 },
  personDesc: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.mutedForeground, marginTop: 4 },
});
