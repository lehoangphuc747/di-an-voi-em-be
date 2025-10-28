import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dwjfnlppidvmtggieztd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3amZubHBwaWR2bXRnZ2llenRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNTg5NzksImV4cCI6MjA3NDczNDk3OX0.GnR-CVFXx5jSufKmJqZxMf1nYn3UTRAkEjM2t6lQZVg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);