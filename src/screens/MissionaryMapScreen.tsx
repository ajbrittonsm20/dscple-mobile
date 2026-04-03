import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import MapView, { Marker, Callout } from 'react-native-maps';
import { supabase } from '../lib/supabase';
import { colors, fonts, spacing, borderRadius, fontSize } from '../lib/theme';

export default function MissionaryMapScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const { data: missionaries = [], isLoading } = useQuery({
    queryKey: ['missionaries-map'],
    queryFn: async () => {
      const { data } = await supabase
        .from('missionaries')
        .select('*')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);
      return data ?? [];
    },
  });

  useEffect(() => {
    if (missionaries.length > 0 && mapRef.current) {
      const coords = missionaries.map((m: any) => ({
        latitude: parseFloat(m.latitude),
        longitude: parseFloat(m.longitude),
      }));
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(coords, {
          edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
          animated: true,
        });
      }, 500);
    }
  }, [missionaries]);

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
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: 20,
            longitude: 0,
            latitudeDelta: 120,
            longitudeDelta: 120,
          }}
        >
          {missionaries.map((m: any) => (
            <Marker
              key={m.id}
              coordinate={{
                latitude: parseFloat(m.latitude),
                longitude: parseFloat(m.longitude),
              }}
              pinColor={colors.primary}
            >
              <Callout
                tooltip={false}
                onPress={() => navigation.navigate('MissionaryDetail', { id: m.id })}
              >
                <View style={styles.callout}>
                  <Text style={styles.calloutName}>{m.name}</Text>
                  {m.location && (
                    <Text style={styles.calloutLocation}>{m.location}</Text>
                  )}
                  <Text style={styles.calloutTap}>Tap to view profile →</Text>
                </View>
              </Callout>
            </Marker>
          ))}
        </MapView>
      )}

      {/* Legend */}
      {!isLoading && (
        <View style={[styles.legend, { bottom: insets.bottom + spacing.lg }]}>
          <Ionicons name="location" size={14} color={colors.primary} />
          <Text style={styles.legendText}>
            {missionaries.length} {missionaries.length === 1 ? 'location' : 'locations'}
          </Text>
        </View>
      )}
    </View>
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
    paddingBottom: spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 10,
  },
  title: {
    fontFamily: fonts.bold,
    fontSize: fontSize.xl,
    color: colors.foreground,
  },
  map: {
    flex: 1,
  },
  callout: {
    minWidth: 150,
    maxWidth: 220,
    padding: spacing.sm,
  },
  calloutName: {
    fontFamily: fonts.semibold,
    fontSize: fontSize.sm,
    color: colors.foreground,
    marginBottom: 2,
  },
  calloutLocation: {
    fontFamily: fonts.regular,
    fontSize: fontSize.xs,
    color: colors.mutedForeground,
    marginBottom: 4,
  },
  calloutTap: {
    fontFamily: fonts.medium,
    fontSize: fontSize.xs,
    color: colors.primary,
    marginTop: 2,
  },
  legend: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendText: {
    fontFamily: fonts.medium,
    fontSize: fontSize.sm,
    color: colors.foreground,
  },
});
