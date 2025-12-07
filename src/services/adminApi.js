import { supabase } from "../services/supabase";

// Get auth user
export async function getUser() {
  return await supabase.auth.getUser();
}

// Get categories
export async function fetchCategories() {
  return await supabase.from("product_categories").select("*").order("name");
}

// Get sub categories
export async function fetchSubCategories() {
  return supabase
  .from("product_subcategories")
  .select("*")
  .order("name");
}

// export async function fetchSubCategories(categoryId) {
//   return supabase
//     .from("subcategories")
//     .select("*")
//     .eq("category_id", categoryId)
//     .order("name");
// }

// export async function fetchGroups(subcategoryId) {
//   return supabase
//     .from("product_groups")
//     .select("*")
//     .eq("subcategory_id", subcategoryId)
//     .order("name");
// }

// Get groups
export async function fetchGroups() {
  return supabase.from('product_groups').select('*')
}

// export async function fetchProducts(groupIds) {
//   return supabase
//     .from("products")
//     .select("*")
//     .in("group_id", groupIds)
//     .order("name");
// }

// Get products
export async function fetchProducts() {
  return supabase
  .from("products")
  .select("*")
  .order("name");
}

// Fetch cart
export async function fetchCart(user) {
  return supabase
      .from("cart_items")
      .select(
        `
        id,
        quantity,
        product_id,
        products (
          id, name, price, mrp, image_url, stock_unit, stock_type
        )
      `
      )
      .eq("user_id", user.id);
}

// Load cart
export async function fetchCartUser(user) {
  return supabase
  .from("cart_items")
  .select("id, quantity, products(name, price, image_url)")
  .eq("user_id", user.id);
}



