import { supabase } from "./supabase";

export async function placeOrder(user, addressId, paymentMode = "cod") {
  // 1️⃣ Load address
  const { data: address, error: addrErr } = await supabase
    .from("addresses")
    .select(
      "address_line, phone, pincode, delivery_instructions, latitude, longitude"
    )
    .eq("id", addressId)
    .single();

  if (addrErr || !address) throw new Error("Address not found");

  // 2️⃣ Load cart
  const { data: cartItems, error: cartErr } = await supabase
    .from("cart_items")
    .select("product_id, quantity, products(name, price)")
    .eq("user_id", user.id);

  if (cartErr || !cartItems.length) throw new Error("Cart empty");

  // 3️⃣ Total
  const total = cartItems.reduce(
    (sum, i) => sum + i.quantity * i.products.price,
    0
  );

  // 4️⃣ JSON backup
  const jsonItems = cartItems.map((i) => ({
    product_id: i.product_id,
    name: i.products.name,
    price: i.products.price,
    quantity: i.quantity,
  }));

  // 5️⃣ Insert into orders
  const { data: order, error: orderErr } = await supabase
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
      status: "pending",
    })
    .select()
    .single();

  if (orderErr) throw orderErr;

  // 6️⃣ Insert order_items
  const { error: itemsErr } = await supabase.from("order_items").insert(
    cartItems.map((i) => ({
      order_id: order.id,
      product_id: i.product_id,
      quantity: i.quantity,
      price_each: i.products.price,
    }))
  );

  if (itemsErr) throw itemsErr;

  // 7️⃣ Decrement stock for each product using secure RPC (atomic)
  for (const i of cartItems) {
    const productId = i.product_id;
    const qty = Number(i.quantity);
    if (!Number.isInteger(qty)) throw new Error("Invalid quantity type");

    const { data: rpcResult, error: rpcErr } = await supabase.rpc(
      "decrement_stock",
      { p_product_id: productId, p_qty: qty }
    );

    if (rpcErr) throw rpcErr;

    // rpcResult expected to be json/record with success flag
    const ok =
      rpcResult &&
      (rpcResult.success === true || rpcResult?.["success"] === true);
    if (!ok) {
      const msg =
        rpcResult?.message || "Insufficient stock for one or more items";
      throw new Error(msg);
    }
  }

  // 8️⃣ Clear cart
  await supabase.from("cart_items").delete().eq("user_id", user.id);

  return order.id;
}
