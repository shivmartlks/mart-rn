import { supabase } from "../services/supabase";

/**
 * Add a product to the cart.
 * @param {string} productId - The ID of the product to add.
 * @param {string} userId - The ID of the user adding the product.
 * @returns {Promise<{ success: boolean, error?: string }>} - Result of the operation.
 */
export async function addToCart(productId, userId) {
  try {
    // Check if the product already exists in the cart
    const { data: existingItem, error: fetchError } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .maybeSingle();

    if (fetchError && fetchError.code !== "PGRST116") {
      // Ignore "Row not found" error (PGRST116), handle other errors
      throw fetchError;
    }

    if (existingItem) {
      // If the product exists, increment the quantity
      const { error: updateError } = await supabase
        .from("cart_items")
        .update({ quantity: existingItem.quantity + 1 })
        .eq("id", existingItem.id);

      if (updateError) throw updateError;
    } else {
      // If the product doesn't exist, insert a new row
      const { error: insertError } = await supabase
        .from("cart_items")
        .insert({
          user_id: userId,
          product_id: productId,
          quantity: 1,
        });

      if (insertError) throw insertError;
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// ✅ Decrement or remove if zero
export async function removeFromCart(productId, userId) {
  if (!userId) return { error: "Not logged in" };

  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("product_id", productId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!existing) return { success: true };

  if (existing.quantity > 1) {
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity - 1 })
      .eq("id", existing.id);
    return { success: !error, error };
  } else {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", existing.id);
    return { success: !error, error };
  }
}

// ✅ Get user cart count
export async function getCartCount(userId) {
  if (!userId) return 0;
  const { data } = await supabase
    .from("cart_items")
    .select("quantity")
    .eq("user_id", userId);
  return data?.reduce((sum, i) => sum + i.quantity, 0) || 0;
}
