import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface RecurringOptionsProps {
  value: 'daily' | 'weekly' | 'monthly' | null;
  onChange: (value: 'daily' | 'weekly' | 'monthly' | null) => void;
}

const options = [
  { label: 'Daily', value: 'daily' as const },
  { label: 'Weekly', value: 'weekly' as const },
  { label: 'Monthly', value: 'monthly' as const },
];

export function RecurringOptions({ value, onChange }: RecurringOptionsProps) {
  return (
    <View>
      <Text style={styles.label}>Repeat</Text>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.option, !value && styles.selected]}
          onPress={() => onChange(null)}
        >
          <Text style={[styles.optionText, !value && styles.selectedText]}>None</Text>
        </TouchableOpacity>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.option, value === opt.value && styles.selected]}
            onPress={() => onChange(opt.value)}
          >
            <Text style={[styles.optionText, value === opt.value && styles.selectedText]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 16 },
  row: { flexDirection: 'row', gap: 8 },
  option: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, backgroundColor: '#F3F4F6' },
  selected: { backgroundColor: '#1E3A5F' },
  optionText: { fontSize: 14, color: '#374151' },
  selectedText: { color: '#FFFFFF' },
});
