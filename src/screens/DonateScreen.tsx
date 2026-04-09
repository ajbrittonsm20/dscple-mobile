import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useStripe } from '@stripe/stripe-react-native';
import * as Haptics from 'expo-haptics';
import { supabase } from '../lib/supabase';
import { useAuth } from '../providers/AuthProvider';
import { colors, fonts, spacing, borderRadius, fontSize } from '../lib/theme';
import { PRESET_AMOUNTS, causeConfig } from '../lib/constants';

export default function DonateScreen({ navigation }: any) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [amount, setAmount] = useState('');
  const [cause, setCause] = useState('');
  const [donorName, setDonorName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCausePicker, setShowCausePicker] = useState(false);
  const [activeTab, setActiveTab] = useState<'give' | 'causes'>('give');

  const { data: donations = [] } = useQuery({
    queryKey: ['donations'],
    queryFn: async () => {
      const { data } = await supabase.from('donations').select('*').order('created_at', { ascending: false });
      return data ?? [];
    },
  });

  const totalRaised = donations.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);

  const causeSummary = donations.reduce((acc: any, d: any) => {
    if (!acc[d.cause]) acc[d.cause] = { total: 0, count: 0 };
    acc[d.cause].total += d.amount || 0;
    acc[d.cause].count += 1;
    return acc;
  }, {});

  const handleDonate = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please select or enter a donation amount');
      return;
    }
    if (!cause) {
      Alert.alert('Error', 'Please choose a cause to support');
      return;
    }

    setLoading(true);
    try {
      // Get payment intent from edge function
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: { amount: parseFloat(amount), cause },
      });

      if (error || !data?.clientSecret) {
        throw new Error(data?.error || 'Failed to create payment');
      }

      // Initialize the Payment Sheet
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: data.clientSecret,
        merchantDisplayName: 'DSCPLE',
        customerId: data.customerId,
        customerEphemeralKeySecret: data.ephemeralKey,
        defaultBillingDetails: { name: donorName || undefined },
        style: 'alwaysLight',
      });

      if (initError) {
        throw new Error(initError.message);
      }

      // Present the Payment Sheet
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        if (paymentError.code === 'Canceled') {
          // User cancelled — do nothing
          setLoading(false);
          return;
        }
        throw new Error(paymentError.message);
      }

      // Payment succeeded — record donation
      await supabase.from('donations').insert({
        user_id: user?.id,
        amount: parseFloat(amount),
        cause,
        donor_name: isAnonymous ? '' : donorName,
        is_anonymous: isAnonymous,
        message,
        status: 'succeeded',
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Thank You!', 'Your donation has been received. God bless you!');
      setAmount('');
      setCause('');
      setDonorName('');
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['donations'] });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Payment failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Give</Text>
        <Text style={styles.subtitle}>Your generosity makes a difference</Text>

        {/* Total Raised */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Raised</Text>
          <Text style={styles.totalAmount}>${totalRaised.toLocaleString()}</Text>
          <Text style={styles.totalCount}>{donations.length} donations from our community</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'give' && styles.tabActive]}
            onPress={() => setActiveTab('give')}
          >
            <Ionicons name="heart" size={14} color={activeTab === 'give' ? colors.foreground : colors.mutedForeground} />
            <Text style={[styles.tabText, activeTab === 'give' && styles.tabTextActive]}> Give</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'causes' && styles.tabActive]}
            onPress={() => setActiveTab('causes')}
          >
            <Ionicons name="bar-chart" size={14} color={activeTab === 'causes' ? colors.foreground : colors.mutedForeground} />
            <Text style={[styles.tabText, activeTab === 'causes' && styles.tabTextActive]}> Causes</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'give' ? (
          <>
            {/* Amount Selection */}
            <Text style={styles.label}>Select Amount</Text>
            <View style={styles.amountGrid}>
              {PRESET_AMOUNTS.map((preset) => (
                <TouchableOpacity
                  key={preset}
                  style={[styles.amountButton, amount === String(preset) && styles.amountButtonActive]}
                  onPress={() => setAmount(String(preset))}
                >
                  <Text style={[styles.amountButtonText, amount === String(preset) && styles.amountButtonTextActive]}>
                    ${preset}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.customAmountRow}>
              <Text style={styles.dollarSign}>$</Text>
              <TextInput
                style={styles.customAmountInput}
                placeholder="Custom amount"
                placeholderTextColor={colors.mutedForeground}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
            </View>

            {/* Cause Selection */}
            <Text style={styles.label}>Choose a Cause</Text>
            <TouchableOpacity style={styles.causePicker} onPress={() => setShowCausePicker(!showCausePicker)}>
              <Text style={cause ? styles.causePickerText : styles.causePickerPlaceholder}>
                {cause ? causeConfig[cause]?.label : 'Select a cause to support'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>

            {showCausePicker && (
              <View style={styles.causeList}>
                {Object.entries(causeConfig).map(([key, config]) => (
                  <TouchableOpacity
                    key={key}
                    style={[styles.causeItem, cause === key && styles.causeItemActive]}
                    onPress={() => { setCause(key); setShowCausePicker(false); }}
                  >
                    <Ionicons name={config.icon as any} size={18} color={cause === key ? colors.primary : colors.foreground} />
                    <Text style={[styles.causeItemText, cause === key && styles.causeItemTextActive]}>{config.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Anonymous Toggle */}
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Donate anonymously</Text>
              <Switch value={isAnonymous} onValueChange={setIsAnonymous} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.white} />
            </View>

            {!isAnonymous && (
              <>
                <Text style={styles.label}>Your Name</Text>
                <TextInput style={styles.input} placeholder="Enter your name" placeholderTextColor={colors.mutedForeground} value={donorName} onChangeText={setDonorName} />
              </>
            )}

            <Text style={styles.label}>Message (optional)</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Leave a prayer or encouraging word..."
              placeholderTextColor={colors.mutedForeground}
              value={message}
              onChangeText={setMessage}
              multiline
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.donateButton, loading && { opacity: 0.6 }]}
              onPress={handleDonate}
              disabled={loading}
            >
              <Ionicons name="heart" size={18} color={colors.background} style={{ marginRight: 8 }} />
              <Text style={styles.donateButtonText}>{loading ? 'Processing...' : `Donate${amount ? ` $${amount}` : ''}`}</Text>
            </TouchableOpacity>
          </>
        ) : (
          /* Causes Tab */
          Object.entries(causeSummary).length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="heart-outline" size={48} color={colors.mutedForeground} />
              <Text style={styles.emptyText}>No donations yet. Be the first!</Text>
            </View>
          ) : (
            Object.entries(causeSummary)
              .sort(([, a]: any, [, b]: any) => b.total - a.total)
              .map(([causeKey, data]: [string, any]) => (
                <View key={causeKey} style={styles.causeCard}>
                  <Ionicons name={(causeConfig[causeKey]?.icon as any) || 'heart'} size={24} color={colors.primary} />
                  <View style={styles.causeCardInfo}>
                    <Text style={styles.causeCardName}>{causeConfig[causeKey]?.label || causeKey}</Text>
                    <Text style={styles.causeCardMeta}>{data.count} donors</Text>
                  </View>
                  <Text style={styles.causeCardAmount}>${data.total.toLocaleString()}</Text>
                </View>
              ))
          )
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  title: { fontFamily: fonts.bold, fontSize: fontSize['2xl'], color: colors.foreground, paddingHorizontal: spacing.lg, marginTop: spacing.md },
  subtitle: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.mutedForeground, paddingHorizontal: spacing.lg, marginTop: spacing.xs, marginBottom: spacing.md },
  totalCard: { backgroundColor: colors.primary, borderRadius: borderRadius.xl, padding: spacing.lg, marginHorizontal: spacing.lg, marginBottom: spacing.md, alignItems: 'center' },
  totalLabel: { fontFamily: fonts.medium, fontSize: fontSize.xs, color: colors.primaryForeground, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.7 },
  totalAmount: { fontFamily: fonts.bold, fontSize: fontSize['3xl'], color: colors.primaryForeground, marginTop: spacing.xs },
  totalCount: { fontFamily: fonts.regular, fontSize: fontSize.xs, color: colors.primaryForeground, opacity: 0.6, marginTop: spacing.xs },
  tabRow: { flexDirection: 'row', marginHorizontal: spacing.lg, backgroundColor: colors.secondary, borderRadius: borderRadius.lg, padding: 4, marginBottom: spacing.lg },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: borderRadius.md },
  tabActive: { backgroundColor: colors.card },
  tabText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.mutedForeground },
  tabTextActive: { color: colors.foreground },
  label: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.foreground, paddingHorizontal: spacing.lg, marginBottom: spacing.sm, marginTop: spacing.sm },
  amountGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, gap: spacing.sm },
  amountButton: { width: '31%', paddingVertical: 12, borderRadius: borderRadius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  amountButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  amountButtonText: { fontFamily: fonts.medium, fontSize: fontSize.sm, color: colors.foreground },
  amountButtonTextActive: { color: colors.primaryForeground },
  customAmountRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, marginHorizontal: spacing.lg, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, marginTop: spacing.sm },
  dollarSign: { fontFamily: fonts.medium, fontSize: fontSize.base, color: colors.mutedForeground },
  customAmountInput: { flex: 1, paddingVertical: 12, marginLeft: spacing.sm, fontFamily: fonts.regular, fontSize: fontSize.base, color: colors.foreground },
  causePicker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.card, marginHorizontal: spacing.lg, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: 14 },
  causePickerText: { fontFamily: fonts.regular, fontSize: fontSize.base, color: colors.foreground },
  causePickerPlaceholder: { fontFamily: fonts.regular, fontSize: fontSize.base, color: colors.mutedForeground },
  causeList: { marginHorizontal: spacing.lg, backgroundColor: colors.card, borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border, marginTop: spacing.xs, overflow: 'hidden' },
  causeItem: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  causeItemActive: { backgroundColor: colors.accent },
  causeItemText: { fontFamily: fonts.regular, fontSize: fontSize.base, color: colors.foreground },
  causeItemTextActive: { fontFamily: fonts.medium, color: colors.primary },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, marginTop: spacing.md },
  toggleLabel: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.foreground },
  input: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: borderRadius.lg, paddingHorizontal: spacing.md, paddingVertical: 14, fontFamily: fonts.regular, fontSize: fontSize.base, color: colors.foreground, marginHorizontal: spacing.lg },
  donateButton: { flexDirection: 'row', backgroundColor: colors.foreground, borderRadius: borderRadius.xl, paddingVertical: 18, alignItems: 'center', justifyContent: 'center', marginHorizontal: spacing.lg, marginTop: spacing.lg },
  donateButtonText: { fontFamily: fonts.semibold, fontSize: fontSize.base, color: colors.background },
  causeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, marginHorizontal: spacing.lg, marginBottom: spacing.sm, borderRadius: borderRadius.lg, padding: spacing.md },
  causeCardInfo: { flex: 1, marginLeft: spacing.md },
  causeCardName: { fontFamily: fonts.semibold, fontSize: fontSize.base, color: colors.foreground },
  causeCardMeta: { fontFamily: fonts.regular, fontSize: fontSize.sm, color: colors.mutedForeground, marginTop: 2 },
  causeCardAmount: { fontFamily: fonts.bold, fontSize: fontSize.lg, color: colors.primary },
  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontFamily: fonts.regular, fontSize: fontSize.base, color: colors.mutedForeground, marginTop: spacing.md },
});
