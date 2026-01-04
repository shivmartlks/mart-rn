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

  // 2️⃣ Load cart (base rows, try to include products via relationship)
  const { data: cartItemsRaw, error: cartErr } = await supabase
    .from("cart_items")
    .select("product_id, quantity, products(name, price)")
    .eq("user_id", user.id);

  if (cartErr || !cartItemsRaw || cartItemsRaw.length === 0)
    throw new Error("Cart empty");

  // Normalize: ensure each cart row has a products object with numeric price
  const cartItems = cartItemsRaw.map((i) => ({
    ...i,
    products: i.products || null,
  }));

  // If some cart rows lack products (e.g. RLS prevented join), try to fetch product data
  const missingIds = Array.from(
    new Set(cartItems.filter((c) => !c.products).map((c) => c.product_id))
  );
  if (missingIds.length) {
    // Try to fetch via store_inventory relation (may be readable)
    try {
      const { data: invRows } = await supabase
        .from("store_inventory")
        .select("product_id, products(id, name, price)")
        .in("product_id", missingIds);
      const prodMap = {};
      (invRows || []).forEach((r) => {
        if (r?.products) prodMap[r.product_id] = r.products;
      });
      // For any still missing, fetch from products table directly
      const stillMissing = missingIds.filter((id) => !prodMap[id]);
      if (stillMissing.length) {
        const { data: prodRows } = await supabase
          .from("products")
          .select("id, name, price")
          .in("id", stillMissing);
        (prodRows || []).forEach((p) => (prodMap[p.id] = p));
      }
      // Merge into cartItems
      for (let idx = 0; idx < cartItems.length; idx++) {
        const it = cartItems[idx];
        if (!it.products && prodMap[it.product_id]) {
          cartItems[idx] = {
            ...it,
            products: {
              ...(prodMap[it.product_id] || {}),
            },
          };
        }
      }
    } catch (e) {
      // ignore and continue — later validation will catch missing product prices
    }
  }

  // Ensure numeric prices (fallback to 0)
  cartItems.forEach((i) => {
    if (i.products) {
      i.products.price = Number(i.products.price) || 0;
    }
  });

  // 3️⃣ Total
  const total = cartItems.reduce(
    (sum, i) => sum + i.quantity * (i.products?.price || 0),
    0
  );

  // 4️⃣ JSON backup
  const jsonItems = cartItems.map((i) => ({
    product_id: i.product_id,
    name: i.products?.name || null,
    price: i.products?.price || 0,
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
      price_each: i.products?.price || 0,
    }))
  );

  if (itemsErr) throw itemsErr;

  // 7️⃣ Decrement stock via RPC (atomic)
  for (const i of cartItems) {
    const productId = i.product_id;
    const qty = Number(i.quantity);
    if (!Number.isInteger(qty)) throw new Error("Invalid quantity type");

    const { data: rpcResult, error: rpcErr } = await supabase.rpc(
      "decrement_stock",
      { p_product_id: productId, p_qty: qty }
    );

    if (rpcErr) throw rpcErr;

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
