@@ .. @@
 -- Foreign key constraints
 ALTER TABLE inbox_items
 ADD CONSTRAINT inbox_items_user_id_fkey 
-FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
+FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;