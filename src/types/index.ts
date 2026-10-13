export type Category = {
  slug: string;
  name: string;
  sort: number;
  image_url: string | null;
};

export type Product = {
  id: string;
  slug: string;
  category_slug: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string | null;
  specs: Record<string, string>;
  is_active: boolean;
  created_at: string;
};

export type OrderStatus = "pending" | "paid" | "shipping" | "delivered" | "cancelled";

export type OrderItem = {
  id: string;
  product_id: string | null;
  product_name: string;
  image_url: string | null;
  price: number;
  quantity: number;
};

export type Order = {
  id: string;
  order_no: string;
  user_id: string;
  order_name: string;
  items_price: number;
  shipping_fee: number;
  total_price: number;
  status: OrderStatus;
  recipient: string;
  phone: string;
  address: string;
  memo: string | null;
  payment_key: string | null;
  created_at: string;
  paid_at: string | null;
  order_items?: OrderItem[];
};

export type Profile = {
  id: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  role: "user" | "admin";
  email: string;
};
