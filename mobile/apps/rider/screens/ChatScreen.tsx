import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth, useSocket } from '@easyryde/shared';
import { COLORS } from '@easyryde/shared';
import type { ChatMessage } from '@easyryde/shared';
import { generateId } from '@easyryde/shared';

export default function ChatScreen({ route }: any) {
  const { rideId, receiverId } = route.params;
  const { user, token } = useAuth();
  const { isConnected, emit, on, joinRoom, leaveRoom } = useSocket({ token: token || '' });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    joinRoom(`ride:${rideId}`);
    return () => leaveRoom(`ride:${rideId}`);
  }, [rideId]);

  useEffect(() => {
    if (!isConnected) return;
    const unsub1 = on('chat:message', (msg: any) => {
      setMessages((prev) => [...prev, msg as ChatMessage]);
    });
    const unsub2 = on('chat:history', (data: any) => {
      setMessages(data.messages || []);
    });
    return () => { unsub1(); unsub2(); };
  }, [isConnected]);

  const sendMessage = () => {
    if (!input.trim() || !user) return;

    const msg: ChatMessage = {
      id: generateId(),
      rideId,
      senderId: user.id,
      receiverId,
      message: input.trim(),
      timestamp: new Date().toISOString(),
    };

    emit('chat:send', {
      rideId,
      message: input.trim(),
      receiverId,
    });

    setMessages((prev) => [...prev, msg]);
    setInput('');
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMe = item.senderId === user?.id;
    return (
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
        <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>{item.message}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={!input.trim()}>
          <Text style={styles.sendText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray[50] },
  list: { padding: 16, paddingBottom: 8 },
  bubble: { maxWidth: '75%', borderRadius: 16, padding: 12, marginBottom: 8 },
  bubbleMe: { alignSelf: 'flex-end', backgroundColor: COLORS.primary },
  bubbleThem: { alignSelf: 'flex-start', backgroundColor: COLORS.gray[200] },
  bubbleText: { fontSize: 15, color: COLORS.gray[800] },
  bubbleTextMe: { color: COLORS.white },
  inputBar: {
    flexDirection: 'row', padding: 12, paddingBottom: 32,
    backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.gray[100],
  },
  input: {
    flex: 1, borderWidth: 1, borderColor: COLORS.gray[200], borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 8, fontSize: 15, maxHeight: 100,
  },
  sendButton: { backgroundColor: COLORS.primary, borderRadius: 20, paddingHorizontal: 20, justifyContent: 'center', marginLeft: 8 },
  sendText: { color: COLORS.white, fontWeight: '600' },
});
