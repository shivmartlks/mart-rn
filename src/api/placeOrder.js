import { supabase } from "../lib/supabaseClient";


export async function placeOrder(user, addressId, paymentMode = "cod") {
  // 1. Load chosen address
  const { data: address } = await supabase
  .from("addresses")
  .select("address_line, phone, pincode, delivery_instructions, latitude, longitude")
  .eq("id", addressId)
  .single();

  if (!address) throw new Error("Address not found");

  // 2. Load cart
  const { data: cartItems } = await supabase
    .from("cart_items")
    .select("product_id, quantity, products(name, price)")
    .eq("user_id", user.id);

  if (!cartItems.length) throw new Error("Cart empty");

  // 3. Total
  const total = cartItems.reduce(
    (sum, i) => sum + i.quantity * i.products.price,
    0
  );

  // 4. JSON backup
  const jsonItems = cartItems.map(i => ({
    product_id: i.product_id,
    name: i.products.name,
    price: i.products.price,
    quantity: i.quantity
  }));

  // 5. Insert order
  const { data: order } = await supabase
  .from("orders")
  .insert({
    user_id: user.id,
    items: jsonItems,
    total_amount: total,
    address_line: address.address_line,
    phone: address.phone,
    pincode: address.pincode,
    delivery_instructions: address.delivery_instructions,
    latitude: address.latitude,
    longitude: address.longitude,
    payment_mode: paymentMode,
    status: "pending"
  })
  .select()
  .single();


  // 6. Insert order items
  await supabase.from("order_items").insert(
    cartItems.map(i => ({
      order_id: order.id,
      product_id: i.product_id,
      quantity: i.quantity,
      price_each: i.products.price
    }))
  );

  // 7. Clear cart
  await supabase.from("cart_items").delete().eq("user_id", user.id);

  return order.id;
}
