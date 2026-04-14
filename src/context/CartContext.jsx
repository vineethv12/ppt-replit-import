import { createContext, useContext, useState, useCallback } from "react";

const CartContext = createContext(null);

function parsePrice(priceStr) {
  return Number(priceStr.replace(/[₹,]/g, ""));
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const addItem = useCallback((product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          priceNum: parsePrice(product.price),
          img: product.img || product.hero,
          qty: 1,
        },
      ];
    });
    setCartOpen(true);
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQty = useCallback((id, delta) => {
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const cartCount = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.priceNum * i.qty, 0);

  return (
    <CartContext.Provider
      value={{ items, cartOpen, setCartOpen, addItem, removeItem, updateQty, clearCart, cartCount, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
