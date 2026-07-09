-- Kokoro Cafe — Menu seed data
-- Run AFTER schema.sql. Safe to re-run (clears existing menu data first).

delete from public.menu_items;
delete from public.menu_categories;

-- ========== Categories ==========
insert into public.menu_categories (name, slug, sort_order) values
  ('Hot / Cold Coffee', 'hot-cold-coffee', 1),
  ('Iced Coffee', 'iced-coffee', 2),
  ('Kokoro Mojitos', 'kokoro-mojitos', 3),
  ('Premium Smoothies', 'premium-smoothies', 4),
  ('Signature Shakes', 'signature-shakes', 5),
  ('Fruit Iced Teas', 'fruit-iced-teas', 6),
  ('Sundae Ice Creams', 'sundae-ice-creams', 7),
  ('Sandwiches', 'sandwiches', 8),
  ('Maggi', 'maggi', 9),
  ('Snacks', 'snacks', 10),
  ('Kokoro Combos', 'kokoro-combos', 11);

-- ========== Hot / Cold Coffee ==========
insert into public.menu_items (category_id, name, price_hot, price_cold, image_url, sort_order)
select id, v.name, v.price_hot, v.price_cold, 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop', v.sort_order
from public.menu_categories, (values
  ('Classic Coffee', 99, 119, 1),
  ('Americano', 99, 119, 2),
  ('Cappuccino', 119, 129, 3),
  ('Café Latte', 119, 129, 4),
  ('Mocha Latte', 149, 149, 5),
  ('Hazelnut Latte', 149, 149, 6),
  ('Caramel Latte', 149, 149, 7)
) as v(name, price_hot, price_cold, sort_order)
where slug = 'hot-cold-coffee';

-- ========== Iced Coffee ==========
insert into public.menu_items (category_id, name, price, image_url, sort_order)
select id, v.name, v.price, 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop', v.sort_order
from public.menu_categories, (values
  ('Iced Americano', 109, 1),
  ('Classic Cold Coffee', 129, 2),
  ('Iced Latte', 129, 3),
  ('Iced Mocha', 149, 4),
  ('Hazelnut Iced Latte', 149, 5),
  ('Caramel Iced Latte', 149, 6),
  ('Mango Iced Latte', 149, 7),
  ('Watermelon Iced Latte', 149, 8),
  ('Peach Iced Latte', 149, 9),
  ('Strawberry Iced Latte', 149, 10)
) as v(name, price, sort_order)
where slug = 'iced-coffee';

-- ========== Kokoro Mojitos ==========
insert into public.menu_items (category_id, name, price, image_url, sort_order)
select id, v.name, v.price, 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop', v.sort_order
from public.menu_categories, (values
  ('Kiwi Cooler', 89, 1),
  ('Green Apple Fizz', 89, 2),
  ('Orange Twist', 89, 3),
  ('Mango Mint Mojito', 99, 4),
  ('Pineapple Punch', 99, 5),
  ('Strawberry Sparkle', 99, 6),
  ('Peach Splash', 99, 7),
  ('Watermelon Wave', 99, 8),
  ('Blueberry Breeze', 109, 9),
  ('Litchi Lime Mojito', 109, 10),
  ('Chill Guava Mojito', 109, 11),
  ('Bubble Gum Mojito', 119, 12),
  ('Blue Lagoon Mojito', 119, 13)
) as v(name, price, sort_order)
where slug = 'kokoro-mojitos';

-- ========== Premium Smoothies ==========
insert into public.menu_items (category_id, name, price, image_url, sort_order)
select id, v.name, v.price, 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=300&fit=crop', v.sort_order
from public.menu_categories, (values
  ('Banana Delight', 119, 1),
  ('Mango Mania Shake', 139, 2),
  ('Tropical Kiwi Bliss', 139, 3),
  ('Pineapple Paradise', 139, 4),
  ('Green Apple Zing', 129, 5),
  ('Watermelon Fresh', 129, 6),
  ('Strawberry Splash', 139, 7),
  ('Peach Glow', 139, 8),
  ('Blueberry Bliss', 139, 9),
  ('Blackcurrant Crush', 149, 10)
) as v(name, price, sort_order)
where slug = 'premium-smoothies';

-- ========== Signature Shakes ==========
insert into public.menu_items (category_id, name, price, image_url, sort_order)
select id, v.name, v.price, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop', v.sort_order
from public.menu_categories, (values
  ('Banana Caramel Shake', 119, 1),
  ('Mango Mania Shake', 119, 2),
  ('Lime Velvet', 119, 3),
  ('Butterscotch Swirl', 129, 4),
  ('Strawberry Dream', 129, 5),
  ('Chocolate Fudge Shake', 129, 6),
  ('Blueberry Heaven', 129, 7),
  ('Rasmalai Royal', 149, 8),
  ('Kesar Badam Delight', 149, 9)
) as v(name, price, sort_order)
where slug = 'signature-shakes';

-- ========== Fruit Iced Teas ==========
insert into public.menu_items (category_id, name, price, image_url, sort_order)
select id, v.name, v.price, 'https://images.unsplash.com/photo-1499638673689-79a0b5115d87?w=400&h=300&fit=crop', v.sort_order
from public.menu_categories, (values
  ('Peach', 99, 1),
  ('Strawberry', 99, 2),
  ('Green Apple', 99, 3),
  ('Watermelon', 99, 4),
  ('Orange', 99, 5),
  ('Mango', 99, 6),
  ('Lemon', 109, 7),
  ('Blueberry', 109, 8)
) as v(name, price, sort_order)
where slug = 'fruit-iced-teas';

-- ========== Sundae Ice Creams ==========
insert into public.menu_items (category_id, name, price, image_url, sort_order)
select id, v.name, v.price, 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400&h=300&fit=crop', v.sort_order
from public.menu_categories, (values
  ('Vanilla Sundaes', 99, 1),
  ('Coffee Sundaes', 109, 2),
  ('Chocolate Brownie Sundaes', 119, 3),
  ('Berry Dazzle Sundaes', 119, 4),
  ('Butterscotch Sundaes', 109, 5),
  ('Strawberry Sundaes', 99, 6)
) as v(name, price, sort_order)
where slug = 'sundae-ice-creams';

-- ========== Sandwiches ==========
insert into public.menu_items (category_id, name, price, image_url, sort_order)
select id, v.name, v.price, 'https://images.unsplash.com/photo-1567234669003-dce7a7a88821?w=400&h=300&fit=crop', v.sort_order
from public.menu_categories, (values
  ('Cheese Toast', 99, 1),
  ('Veg Club Sandwich', 119, 2),
  ('Mushroom Sandwich', 149, 3),
  ('Paneer Corn Sandwich', 169, 4)
) as v(name, price, sort_order)
where slug = 'sandwiches';

-- ========== Maggi ==========
insert into public.menu_items (category_id, name, price, image_url, sort_order)
select id, v.name, v.price, 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400&h=300&fit=crop', v.sort_order
from public.menu_categories, (values
  ('Veg Maggi', 79, 1),
  ('Butter Maggi', 89, 2),
  ('Cheese Maggi', 99, 3)
) as v(name, price, sort_order)
where slug = 'maggi';

-- ========== Snacks ==========
insert into public.menu_items (category_id, name, price, image_url, sort_order)
select id, v.name, v.price, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop', v.sort_order
from public.menu_categories, (values
  ('Plain Fries', 79, 1),
  ('Crispy Corn', 99, 2),
  ('Peri Peri Fries', 99, 3),
  ('Cheese Fries', 119, 4)
) as v(name, price, sort_order)
where slug = 'snacks';

-- ========== Kokoro Combos ==========
insert into public.menu_items (category_id, name, description, price, image_url, sort_order)
select id, v.name, v.description, v.price, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop', v.sort_order
from public.menu_categories, (values
  ('Student Combo', 'Classic Coffee (Hot) + Veg Maggi', 158, 1),
  ('Evening Combo', 'Any Mojito + Plain Fries', 178, 2),
  ('Study Combo', 'Any Shake (up to ₹129) + Veg Maggi + Plain Fries', 267, 3),
  ('Buddy Combo', '2 Mojitos (up to ₹99 each) + Plain Fries', 247, 4),
  ('Date Combo', '2 Cold Coffees (any flavour up to ₹149 each) + Veg Club Sandwich', 397, 5),
  ('Kokoro Feast Combo', 'Any Shake (up to ₹129) + Mushroom Sandwich + Plain Fries', 337, 6)
) as v(name, description, price, sort_order)
where slug = 'kokoro-combos';
