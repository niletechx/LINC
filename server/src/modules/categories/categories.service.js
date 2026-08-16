const categoriesRepo = require('./categories.repository');

async function getAllCategories() {
  const flat = await categoriesRepo.findAll();
  // Build tree structure: top-level categories with children nested
  const map = {};
  const roots = [];

  flat.forEach((cat) => { map[cat.id] = { ...cat, children: [] }; });
  flat.forEach((cat) => {
    if (cat.parent_id && map[cat.parent_id]) {
      map[cat.parent_id].children.push(map[cat.id]);
    } else {
      roots.push(map[cat.id]);
    }
  });
  return roots;
}

async function getCategoryById(id) {
  const cat = await categoriesRepo.findById(id);
  if (!cat) {
    const err = new Error('Category not found');
    err.statusCode = 404;
    throw err;
  }
  return cat;
}

async function seedCategories() {
  // Seed default LINC service categories if none exist
  const existing = await categoriesRepo.findAll();
  if (existing.length > 0) return { message: 'Categories already seeded', count: existing.length };

  const topLevel = [
    { name: 'Technology & Repair', slug: 'technology-repair', icon: '💻', description: 'Device repair, software, IT support' },
    { name: 'Home Services', slug: 'home-services', icon: '🏠', description: 'Plumbing, electrical, cleaning, maintenance' },
    { name: 'Education & Tutoring', slug: 'education-tutoring', icon: '📚', description: 'Tutoring, coaching, language lessons' },
    { name: 'Health & Wellness', slug: 'health-wellness', icon: '🏥', description: 'Healthcare, fitness, mental health' },
    { name: 'Transportation', slug: 'transportation', icon: '🚗', description: 'Delivery, moving, ride services' },
    { name: 'Creative & Design', slug: 'creative-design', icon: '🎨', description: 'Graphic design, photography, video' },
    { name: 'Business & Finance', slug: 'business-finance', icon: '💼', description: 'Accounting, legal, consulting' },
    { name: 'Food & Catering', slug: 'food-catering', icon: '🍽️', description: 'Catering, cooking, meal delivery' },
    { name: 'Beauty & Personal Care', slug: 'beauty-personal-care', icon: '💇', description: 'Haircuts, makeup, grooming' },
    { name: 'Events & Entertainment', slug: 'events-entertainment', icon: '🎉', description: 'Event planning, DJs, photography' },
  ];

  const results = [];
  for (const cat of topLevel) {
    const created = await categoriesRepo.createCategory(cat);
    results.push(created);
  }
  return { message: 'Categories seeded', count: results.length };
}

module.exports = { getAllCategories, getCategoryById, seedCategories };
