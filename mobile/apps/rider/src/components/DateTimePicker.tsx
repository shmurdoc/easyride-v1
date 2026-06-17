import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';

interface DateTimePickerProps {
  onSelect: (date: string, time: string) => void;
}

export function DateTimePicker({ onSelect }: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      label: d.toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric' }),
      value: d.toISOString().split('T')[0],
    };
  });

  const times = Array.from({ length: 24 * 4 }, (_, i) => {
    const h = Math.floor(i / 4);
    const m = (i % 4) * 15;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  });

  return (
    <View>
      <Text style={styles.label}>Select Date</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {dates.map((date) => (
          <TouchableOpacity
            key={date.value}
            style={[styles.dateItem, selectedDate === date.value && styles.selected]}
            onPress={() => setSelectedDate(date.value)}
          >
            <Text style={[styles.dateText, selectedDate === date.value && styles.selectedText]}>
              {date.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedDate && (
        <>
          <Text style={styles.label}>Select Time</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {times.map((time) => (
              <TouchableOpacity
                key={time}
                style={[styles.timeItem, selectedTime === time && styles.selected]}
                onPress={() => {
                  setSelectedTime(time);
                  onSelect(selectedDate, time);
                }}
              >
                <Text style={[styles.timeText, selectedTime === time && styles.selectedText]}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8, marginTop: 16 },
  dateItem: { paddingHorizontal: 16, paddingVertical: 10, marginRight: 8, borderRadius: 8, backgroundColor: '#F3F4F6' },
  timeItem: { paddingHorizontal: 14, paddingVertical: 8, marginRight: 6, borderRadius: 8, backgroundColor: '#F3F4F6' },
  selected: { backgroundColor: '#1E3A5F' },
  dateText: { fontSize: 14, color: '#374151' },
  timeText: { fontSize: 13, color: '#374151' },
  selectedText: { color: '#FFFFFF' },
});
