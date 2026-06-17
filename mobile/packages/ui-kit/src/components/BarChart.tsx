import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BarData {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarData[];
  height?: number;
  barColor?: string;
  highlightColor?: string;
  highlightIndex?: number;
  formatValue?: (v: number) => string;
}

export function BarChart({
  data,
  height = 200,
  barColor = '#1E3A5F',
  highlightColor = '#F59E0B',
  highlightIndex,
  formatValue = (v) => `R${v}`,
}: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <View style={styles.container}>
      <View style={[styles.chart, { height }]}>
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * (height - 20);
          const isHighlight = index === highlightIndex;
          return (
            <View key={index} style={styles.barContainer}>
              <Text style={styles.value}>{formatValue(item.value)}</Text>
              <View
                style={[
                  styles.bar,
                  {
                    height: barHeight,
                    backgroundColor: isHighlight ? highlightColor : barColor,
                  },
                ]}
              />
              <Text style={styles.label}>{item.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 8 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around' },
  barContainer: { alignItems: 'center', flex: 1 },
  bar: { width: 24, borderRadius: 4, minHeight: 4 },
  value: { fontSize: 10, color: '#6B7280', marginBottom: 4 },
  label: { fontSize: 10, color: '#6B7280', marginTop: 4 },
});
