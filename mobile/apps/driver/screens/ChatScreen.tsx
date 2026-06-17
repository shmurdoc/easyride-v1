import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, FlatList, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth, useSocket, COLORS, GRADIENTS, SPACING, RADIUS } from '@easyryde/shared';
import { GradientText } from '@easyryde/shared';
import type { ChatMessage, DriverRoute } from '@easyryde/shared';

export default function ChatScreen({ route }: { route: DriverRoute<'Chat'> }) {
  const { rideId, receiverId } = route.params;
  const { user, token } = useAuth();
  const { isConnected, emit, on, joinRoom, leaveRoom } = useSocket({ token: token || '' });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => { joinRoom(`ride:${rideId}`); return () => leaveRoom(`ride:${rideId}`); }, [rideId]);

  useEffect(() => {
    if (!isConnected) return;
    const unsubs = [
      on('chat:message', (msg: any) => setMessages((prev) => [...prev, msg as ChatMessage])),
      on('chat:history', (data: any) => setMessages(data.messages || [])),
    ];
    return () => { unsubs.forEach(u => u()); };
  }, [isConnected]);

  const sendMessage = () => {
    if (!input.trim() || !user) return;
    emit('chat:send', { rideId, message: input.trim(), receiverId });
    setMessages((prev) => [...prev, { id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`, rideId, senderId: user.id, receiverId, message: input.trim(), timestamp: new Date().toISOString() }]);
    setInput('');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <LinearGradient colors={[COLORS.bgGradientStart, COLORS.bgGradientEnd]} style={{ flex: 1 }}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: SPACING.base, paddingBottom: SPACING.sm }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          renderItem={({ item }) => {
            const isMe = item.senderId === user?.id;
            return (
              <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                <GradientText colors={isMe ? ['#0a0a0a', '#0a0a0a'] : GRADIENTS.primary} style={{ fontSize: 18, fontWeight: '400', lineHeight: 27 }}>{item.message}</GradientText>
              </View>
            );
          }}
        />
        <LinearGradient colors={[COLORS.surface, COLORS.surfaceElevated]} style={styles.inputBar}>
          <TextInput style={styles.input} value={input} onChangeText={setInput} placeholder="Type a message..." placeholderTextColor={COLORS.textMuted} multiline />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={!input.trim()}>
            <GradientText colors={['#0a0a0a', '#0a0a0a']} style={{ fontSize: 18, fontWeight: '600', lineHeight: 27 }}>Send</GradientText>
          </TouchableOpacity>
        </LinearGradient>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  bubble: { maxWidth: '75%', borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.sm },
  bubbleMe: { alignSelf: 'flex-end', backgroundColor: COLORS.primary },
  bubbleThem: { alignSelf: 'flex-start', backgroundColor: COLORS.glass, borderWidth: 1, borderColor: COLORS.glassBorder },
  inputBar: {
    flexDirection: 'row', padding: SPACING.md, paddingBottom: 32,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  input: {
    flex: 1, borderWidth: 1, borderColor: COLORS.glassBorder, backgroundColor: COLORS.glass, borderRadius: 20,
    paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm, fontSize: 15, maxHeight: 100, color: COLORS.text,
  },
  sendButton: { backgroundColor: COLORS.primary, borderRadius: 20, paddingHorizontal: 20, justifyContent: 'center', marginLeft: SPACING.sm },
});
