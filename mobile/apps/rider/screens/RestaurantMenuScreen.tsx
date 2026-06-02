import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { foodDelivery } from '@easyryde/shared';
import { COLORS, formatCurrency } from '@easyryde/shared';
import type { Restaurant, RestaurantCategory, MenuItem, CartItem } from '@easyryde/shared';

export default function RestaurantMenuScreen({ route, navigation }: any) {
  const { restaurantId } = route.params;
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<RestaurantCategory[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadMenu(); }, [restaurantId]);

  async function loadMenu() {
    try {
      const data = await foodDelivery.restaurant(restaurantId);
      setRestaurant(data);
      setCategories(data.categories || []);
    } catch {} finally { setLoading(false); }
  }

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map((c) =>
          c.menuItem.id === itemId ? { ...c, quantity: c.quantity - 1 } : c
        );
      }
      return prev.filter((c) => c.menuItem.id !== itemId);
    });
  };

  const getCartTotal = () => cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  const getCartCount = () => cart.reduce((sum, item) => sum + item.quantity, 0);

  const goToCheckout = () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Add items to your cart first');
      return;
    }
    navigation.navigate('FoodCheckout', {
      restaurantId: restaurant?.id,
      restaurantName: restaurant?.name,
      cart,
      subtotal: getCartTotal(),
      deliveryFee: restaurant?.delivery_fee || 0,
    });
  };

  const renderMenuItem = ({ item }: { item: MenuItem }) => {
    const cartItem = cart.find((c) => c.menuItem.id === item.id);
    const quantity = cartItem?.quantity || 0;

    return (
      <View style={styles.menuItem}>
        <View style={styles.menuItemInfo}>
          <Text style={styles.menuItemName}>{item.name}</Text>
          {item.description && <Text style={styles.menuItemDesc} numberOfLines={2}>{item.description}</Text>}
          <Text style={styles.menuItemPrice}>{formatCurrency(item.price)}</Text>
          <View style={styles.menuItemTags}>
            {item.is_vegetarian && <Text style={styles.tag}>🌱 Veg</Text>}
            {item.is_vegan && <Text style={styles.tag}>🌿 Vegan</Text>}
            {item.spice_level > 0 && <Text style={styles.tag}>🌶️ x{item.spice_level}</Text>}
          </View>
        </View>
        <View style={styles.menuItemActions}>
          {quantity > 0 ? (
            <View style={styles.quantityControls}>
              <TouchableOpacity style={styles.qtyButton} onPress={() => removeFromCart(item.id)}>
                <Text style={styles.qtyButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{quantity}</Text>
              <TouchableOpacity style={styles.qtyButton} onPress={() => addToCart(item)}>
                <Text style={styles.qtyButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.addButton} onPress={() => addToCart(item)}>
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.restaurantName}>{restaurant?.name}</Text>
        <Text style={styles.restaurantInfo}>
          ⭐ {restaurant?.rating?.toFixed(1)} • {restaurant?.estimated_delivery_minutes}min • {restaurant?.delivery_fee > 0 ? formatCurrency(restaurant.delivery_fee) : 'Free delivery'}
        </Text>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item: category }) => (
          <View>
            <Text style={styles.categoryName}>{category.name}</Text>
            <FlatList
              data={category.menu_items}
              keyExtractor={(item) => item.id}
              renderItem={renderMenuItem}
              scrollEnabled={false}
            />
          </View>
        )}
        contentContainerStyle={styles.list}
      />

      {cart.length > 0 && (
        <TouchableOpacity style={styles.cartButton} onPress={goToCheckout}>
          <Text style={styles.cartButtonText}>
            View Cart ({getCartCount()}) • {formatCurrency(getCartTotal())}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.gray[50] },
  header: { padding: 24, paddingBottom: 12, backgroundColor: COLORS.white },
  restaurantName: { fontSize: 24, fontWeight: 'bold', color: COLORS.gray[800] },
  restaurantInfo: { fontSize: 14, color: COLORS.gray[500], marginTop: 4 },
  list: { padding: 24 },
  categoryName: { fontSize: 18, fontWeight: '600', color: COLORS.gray[700], marginBottom: 12, marginTop: 8 },
  menuItem: {
    flexDirection: 'row', backgroundColor: COLORS.white, borderRadius: 12,
    padding: 16, marginBottom: 8,
  },
  menuItemInfo: { flex: 1 },
  menuItemName: { fontSize: 15, fontWeight: '600', color: COLORS.gray[800] },
  menuItemDesc: { fontSize: 13, color: COLORS.gray[400], marginTop: 4 },
  menuItemPrice: { fontSize: 15, fontWeight: '600', color: COLORS.primary, marginTop: 8 },
  menuItemTags: { flexDirection: 'row', gap: 8, marginTop: 4 },
  tag: { fontSize: 12, color: COLORS.gray[500] },
  menuItemActions: { justifyContent: 'center', marginLeft: 12 },
  addButton: { backgroundColor: COLORS.primary, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 8 },
  addButtonText: { color: COLORS.white, fontWeight: '600' },
  quantityControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyButton: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.gray[100], justifyContent: 'center', alignItems: 'center' },
  qtyButtonText: { fontSize: 16, fontWeight: '600', color: COLORS.gray[700] },
  qtyText: { fontSize: 16, fontWeight: '600', color: COLORS.gray[800] },
  cartButton: {
    backgroundColor: COLORS.primary, margin: 24, marginTop: 0, borderRadius: 16,
    padding: 16, alignItems: 'center',
  },
  cartButtonText: { color: COLORS.white, fontSize: 16, fontWeight: '600' },
  empty: { textAlign: 'center', color: COLORS.gray[400], marginTop: 40 },
});
