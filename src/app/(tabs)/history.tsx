import { CalendarCheck, ChartBar } from 'phosphor-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DailySection } from '@/components/DailySection';
import { PocketPop } from '@/components/PocketPop';
import { useTabBarClearance } from '@/components/TabBar';
import { WeeklySection } from '@/components/WeeklySection';
import { themedStyles, useColors } from '@/theme/useTheme';
import { type } from '@/theme/typography';

type Section = 'daily' | 'weekly';

export default function HistoryScreen() {
  const colors = useColors();
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const tabClearance = useTabBarClearance();
  const [section, setSection] = useState<Section>('daily');
  const isDaily = section === 'daily';

  return (
    <PocketPop>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 8, paddingBottom: tabClearance },
        ]}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>History</Text>

        <View style={styles.segment}>
          <Pressable
            onPress={() => setSection('daily')}
            style={[styles.segmentBtn, isDaily && styles.segmentBtnActive]}>
            <CalendarCheck size={16} color={isDaily ? colors.green : colors.textMuted} />
            <Text style={[styles.segmentText, { color: isDaily ? colors.green : colors.textMuted }]}>
              Daily
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setSection('weekly')}
            style={[styles.segmentBtn, !isDaily && styles.segmentBtnActive]}>
            <ChartBar size={16} color={!isDaily ? colors.green : colors.textMuted} />
            <Text style={[styles.segmentText, { color: !isDaily ? colors.green : colors.textMuted }]}>
              Weekly
            </Text>
          </Pressable>
        </View>

        {isDaily ? <DailySection /> : <WeeklySection />}
      </ScrollView>
    </PocketPop>
  );
}

const useStyles = themedStyles((colors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: 20, paddingBottom: 32 },
  title: { ...type.screenTitle, color: colors.textPrimary, marginTop: 6, marginHorizontal: 2 },

  segment: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: colors.segmentBg,
    borderRadius: 16,
    padding: 5,
    marginTop: 12,
    marginBottom: 16,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: 13,
  },
  segmentBtnActive: {
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  segmentText: { ...type.statValue },
}));
