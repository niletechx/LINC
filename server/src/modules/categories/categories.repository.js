const supabase = require('../../config/supabase');

async function findAll() {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, description, icon, parent_id')
    .eq('is_active', true)
    .order('name');
  if (error) throw error;
  return data;
}

async function findById(id) {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, description, icon, parent_id')
    .eq('id', id)
    .eq('is_active', true)
    .single();
  if (error) throw error;
  return data;
}

async function findBySlug(slug) {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug, description, icon, parent_id')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function createCategory({ name, slug, description, icon, parent_id }) {
  const { data, error } = await supabase
    .from('categories')
    .insert({ name, slug, description, icon, parent_id })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function findByIds(ids = []) {
  const uniqueIds = [...new Set((ids || []).filter(Boolean))];
  if (uniqueIds.length === 0) return [];

  const { data, error } = await supabase
    .from('categories')
    .select('id')
    .in('id', uniqueIds)
    .eq('is_active', true);

  if (error) throw error;
  return data || [];
}

module.exports = { findAll, findById, findBySlug, createCategory, findByIds };
