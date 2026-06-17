import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = '@easyryde/offline_queue';

export interface QueuedRequest {
  id: string;
  method: string;
  url: string;
  data?: any;
  timestamp: number;
  retryCount: number;
}

class OfflineQueue {
  private queue: QueuedRequest[] = [];

  async init(): Promise<void> {
    const stored = await AsyncStorage.getItem(QUEUE_KEY);
    if (stored) this.queue = JSON.parse(stored);
  }

  async enqueue(request: Omit<QueuedRequest, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
    const entry: QueuedRequest = {
      ...request,
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
      retryCount: 0,
    };
    this.queue.push(entry);
    await this.persist();
  }

  async dequeue(id: string): Promise<void> {
    this.queue = this.queue.filter((r) => r.id !== id);
    await this.persist();
  }

  getAll(): QueuedRequest[] {
    return [...this.queue];
  }

  getPendingCount(): number {
    return this.queue.length;
  }

  private async persist(): Promise<void> {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
  }

  async clear(): Promise<void> {
    this.queue = [];
    await AsyncStorage.removeItem(QUEUE_KEY);
  }
}

export const offlineQueue = new OfflineQueue();
