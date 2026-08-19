const bcrypt = require('bcryptjs');

// In-memory mock database
const db = {
  users: [
    {
      id: '1',
      email: 'yonas.molla@email.com',
      password_hash: bcrypt.hashSync('password123', 10),
      full_name: 'Yonas Molla',
      username: 'yonas_m',
      phone: '+251911223344',
      location_city: 'Addis Ababa',
      avatar_url: null,
      bio: 'Software engineer & tech enthusiast',
      is_admin: false,
      is_active: true,
      email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      email: 'samuel.girma@email.com',
      password_hash: bcrypt.hashSync('password123', 10),
      full_name: 'Samuel Girma',
      username: 'samuel_g',
      phone: '+251922334455',
      location_city: 'Addis Ababa',
      avatar_url: null,
      bio: 'Professional certified electrician',
      is_admin: false,
      is_active: true,
      email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '3',
      email: 'abebe.kebede@email.com',
      password_hash: bcrypt.hashSync('password123', 10),
      full_name: 'Abebe Kebede',
      username: 'abebe_k',
      phone: '+251933445566',
      location_city: 'Addis Ababa',
      avatar_url: null,
      bio: 'Senior plumber & sanitary engineer',
      is_admin: false,
      is_active: true,
      email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  provider_profiles: [
    {
      id: '1',
      user_id: '3',
      headline: 'Senior Plumber & Pipe Fitter',
      bio: 'Over 8 years experience fixing plumbing, water pumps, drainage and home renovations across Addis Ababa.',
      hourly_rate: 350,
      currency: 'ETB',
      location_city: 'Bole, Addis Ababa',
      location_lat: 8.995,
      location_lng: 38.789,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.9,
      total_reviews: 48,
      completed_jobs: 124,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      users: {
        id: '3',
        full_name: 'Abebe Kebede',
        username: 'abebe_k',
        avatar_url: null,
        location_city: 'Bole, Addis Ababa',
      },
    },
    {
      id: '2',
      user_id: '2',
      headline: 'Certified Electrician & Tech Specialist',
      bio: 'Master electrician for residential & commercial electrical systems, emergency fixes, and solar setups.',
      hourly_rate: 400,
      currency: 'ETB',
      location_city: 'Kazanchis, Addis Ababa',
      location_lat: 9.015,
      location_lng: 38.765,
      availability_status: 'available',
      is_verified: true,
      avg_rating: 4.8,
      total_reviews: 32,
      completed_jobs: 89,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      users: {
        id: '2',
        full_name: 'Samuel Girma',
        username: 'samuel_g',
        avatar_url: null,
        location_city: 'Kazanchis, Addis Ababa',
      },
    },
  ],
  categories: [
    { id: '1', name: 'Plumbing & Repairs', slug: 'plumbing', description: 'Pipe fix, leaks, drainage', icon: '🔧', parent_id: null, is_active: true },
    { id: '2', name: 'Cleaning & Housekeeping', slug: 'cleaning', description: 'Deep clean, maid services', icon: '🧹', parent_id: null, is_active: true },
    { id: '3', name: 'Electrical Work', slug: 'electric', description: 'Wiring, fixtures, appliances', icon: '⚡', parent_id: null, is_active: true },
    { id: '4', name: 'IT & Tech Support', slug: 'it-tech', description: 'Hardware, software, networking', icon: '💻', parent_id: null, is_active: true },
    { id: '5', name: 'Tutoring & Lessons', slug: 'tutoring', description: 'Academic and skills tutoring', icon: '📚', parent_id: null, is_active: true },
    { id: '6', name: 'Transport & Moving', slug: 'transport', description: 'Driver, freight, relocation', icon: '🚗', parent_id: null, is_active: true },
  ],
  services: [
    {
      id: '1',
      provider_id: '1',
      title: 'Leak Detection & Pipe Repair',
      description: 'Emergency repair for water pipes, taps, faucets and kitchen/bathroom drains.',
      price_type: 'hourly',
      price_amount: 350,
      currency: 'ETB',
      category_id: '1',
      is_active: true,
      is_available: true,
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      provider_id: '1',
      title: 'Full Bathroom Pipe Fitting',
      description: 'Complete sanitary fitting and water pump setup with warranty.',
      price_type: 'fixed',
      price_amount: 1800,
      currency: 'ETB',
      category_id: '1',
      is_active: true,
      is_available: true,
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      provider_id: '2',
      title: 'Short Circuit & Breaker Box Diagnostic',
      description: 'Rapid troubleshooting of power trips, switch replacements, and safety checks.',
      price_type: 'hourly',
      price_amount: 400,
      currency: 'ETB',
      category_id: '3',
      is_active: true,
      is_available: true,
      created_at: new Date().toISOString(),
    },
    {
      id: '4',
      provider_id: '2',
      title: 'Laptop Hardware & Screen Repair',
      description: 'Original screen replacement, keyboard repair, battery & SSD upgrades for laptops.',
      price_type: 'fixed',
      price_amount: 1500,
      currency: 'ETB',
      category_id: '4',
      is_active: true,
      is_available: true,
      created_at: new Date().toISOString(),
    },
    {
      id: '5',
      provider_id: '1',
      title: '3-Bedroom Apartment Deep Cleaning',
      description: 'Comprehensive sanitization, floor scrubbing, kitchen degreasing, and window washing.',
      price_type: 'fixed',
      price_amount: 1200,
      currency: 'ETB',
      category_id: '2',
      is_active: true,
      is_available: true,
      created_at: new Date().toISOString(),
    },
  ],
  requests: [
    {
      id: '1',
      user_id: '1',
      title: 'Emergency Pipe Leak Under Kitchen Sink',
      description: 'Water dripping rapidly under the kitchen sink cabinet. Need an urgent repair.',
      budget_min: 300,
      budget_max: 600,
      currency: 'ETB',
      location_city: 'Bole, Addis Ababa',
      urgency: 'urgent',
      status: 'open',
      created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
      id: '2',
      user_id: '1',
      title: 'MacBook Pro Screen Glitch Repair',
      description: 'Screen has horizontal lines flickering after a minor fall. Need diagnostic and replacement.',
      budget_min: 1500,
      budget_max: 3000,
      currency: 'ETB',
      location_city: 'Sarbet, Addis Ababa',
      urgency: 'high',
      status: 'open',
      created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
      id: '3',
      user_id: '1',
      title: '3-Bedroom Apartment Deep Cleaning',
      description: 'Moving into a new apartment near Bole Medhanealem. Full deep cleaning needed before Sunday.',
      budget_min: 1000,
      budget_max: 1800,
      currency: 'ETB',
      location_city: 'Addis Ababa',
      urgency: 'medium',
      status: 'open',
      created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
  ],
  bookings: [
    {
      id: '1',
      requester_id: '1',
      service_id: '1',
      entity_type: 'provider',
      entity_id: '1',
      scheduled_at: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
      duration_hours: 2,
      agreed_price: 700,
      currency: 'ETB',
      notes: 'Pipe leak in the kitchen cabinet',
      status: 'confirmed',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date().toISOString(),
      users: { id: '1', full_name: 'Yonas Molla', username: 'yonas_m', avatar_url: null },
      services: { id: '1', title: 'Leak Detection & Pipe Repair', price_amount: 350, currency: 'ETB', provider_id: '1' },
    },
    {
      id: '2',
      requester_id: '1',
      service_id: '5',
      entity_type: 'provider',
      entity_id: '2',
      scheduled_at: new Date(Date.now() + 86400000 * 2).toISOString(),
      duration_hours: 4,
      agreed_price: 1200,
      currency: 'ETB',
      notes: 'Deep cleaning before weekend move-in',
      status: 'upcoming',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date().toISOString(),
      users: { id: '1', full_name: 'Yonas Molla', username: 'yonas_m', avatar_url: null },
      services: { id: '5', title: '3-Bedroom Apartment Deep Cleaning', price_amount: 1200, currency: 'ETB', provider_id: '2' },
    },
    {
      id: '3',
      requester_id: '1',
      service_id: '4',
      entity_type: 'provider',
      entity_id: '2',
      scheduled_at: new Date(Date.now() - 86400000 * 5).toISOString(),
      duration_hours: 2,
      agreed_price: 1500,
      currency: 'ETB',
      notes: 'Screen replacement completed',
      status: 'completed',
      created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
      updated_at: new Date().toISOString(),
      users: { id: '1', full_name: 'Yonas Molla', username: 'yonas_m', avatar_url: null },
      services: { id: '4', title: 'Laptop Hardware & Screen Repair', price_amount: 1500, currency: 'ETB', provider_id: '2' },
    },
  ],
  conversations: [
    {
      id: '1',
      participant_a_type: 'user',
      participant_a_id: '1',
      participant_b_type: 'provider',
      participant_b_id: '1',
      booking_id: '1',
      last_message_at: new Date().toISOString(),
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  messages: [
    {
      id: '1',
      conversation_id: '1',
      sender_type: 'provider',
      sender_id: '2',
      content: 'Hello Yonas! I saw your plumbing repair request. I can be at your place in Bole around 3:00 PM.',
      has_ai_mention: false,
      ai_response: null,
      is_read: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    {
      id: '2',
      conversation_id: '1',
      sender_type: 'user',
      sender_id: '1',
      content: 'Great, thank you! The leak is under the main sink cabinet.',
      has_ai_mention: false,
      ai_response: null,
      is_read: true,
      created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
      id: '3',
      conversation_id: '1',
      sender_type: 'provider',
      sender_id: '2',
      content: 'Perfect, I will bring the replacement joints. See you shortly!',
      has_ai_mention: false,
      ai_response: null,
      is_read: true,
      created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    },
  ],
  reviews: [
    {
      id: '1',
      booking_id: '3',
      reviewer_id: '1',
      target_entity_type: 'provider',
      target_entity_id: '2',
      entity_type: 'provider',
      entity_id: '2',
      rating: 5,
      comment: 'Replaced my laptop display with great precision. Honest pricing and genuine parts!',
      is_visible: true,
      created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      reviewer: { id: '1', full_name: 'Yonas Molla', username: 'yonas_m' },
    },
    {
      id: '2',
      booking_id: '1',
      reviewer_id: '1',
      target_entity_type: 'provider',
      target_entity_id: '1',
      entity_type: 'provider',
      entity_id: '1',
      rating: 5,
      comment: 'Abebe arrived on time and fixed our pipe leak under 45 minutes. Clean and professional.',
      is_visible: true,
      created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
      reviewer: { id: '1', full_name: 'Yonas Molla', username: 'yonas_m' },
    },
  ],
  notifications: [
    {
      id: '1',
      user_id: '1',
      type: 'booking_confirmed',
      title: 'Booking Confirmed!',
      body: 'Samuel Girma confirmed your plumbing repair for today at 3:00 PM.',
      data: { booking_id: '1' },
      is_read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    },
    {
      id: '2',
      user_id: '1',
      type: 'escrow_hold',
      title: 'Escrow Protected 🛡️',
      body: 'Your 700 ETB deposit is safely held in LINC Escrow until job satisfaction.',
      data: { booking_id: '1' },
      is_read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: '3',
      user_id: '1',
      type: 'message_received',
      title: 'New Message',
      body: 'Samuel Girma: "Perfect, I will bring the replacement joints."',
      data: { conversation_id: '1' },
      is_read: true,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
  verification_requests: [],
  businesses: [],
  organizations: [],
  ai_conversations: [],
  ai_messages: [],
  escrow_transactions: [],
};

function parseCondition(condStr) {
  if (condStr.includes('.and.')) {
    const subConds = condStr.split('.and.').map(parseCondition);
    return (item) => subConds.every((fn) => fn(item));
  }

  const parts = condStr.split('.');
  if (parts.length < 3) return () => true;

  const col = parts[0];
  const op = parts[1];
  const rawVal = parts.slice(2).join('.');
  const cleanVal = rawVal.replace(/^%|%$/g, '');

  return (item) => {
    const v = item[col];
    if (v === undefined || v === null) return false;
    const strV = String(v).toLowerCase();
    const strTarget = cleanVal.toLowerCase();

    switch (op) {
      case 'eq':
        return strV === strTarget;
      case 'neq':
        return strV !== strTarget;
      case 'ilike':
      case 'like':
        return strV.includes(strTarget);
      case 'gte':
        return Number(v) >= Number(rawVal);
      case 'lte':
        return Number(v) <= Number(rawVal);
      case 'gt':
        return Number(v) > Number(rawVal);
      case 'lt':
        return Number(v) < Number(rawVal);
      default:
        return true;
    }
  };
}

class MockQueryBuilder {
  constructor(table) {
    this.table = table;
    if (!db[table]) db[table] = [];
    this.filters = [];
    this._isSingle = false;
    this._isMaybeSingle = false;
    this._selectFields = '*';
    this._insertData = null;
    this._updateData = null;
    this._isDelete = false;
    this._limit = null;
    this._orderField = null;
    this._orderAsc = true;
  }

  select(fields = '*') {
    this._selectFields = fields;
    return this;
  }

  insert(data) {
    this._insertData = Array.isArray(data) ? data : [data];
    return this;
  }

  update(data) {
    this._updateData = data;
    return this;
  }

  upsert(data, options = {}) {
    const items = Array.isArray(data) ? data : [data];
    const conflictCol = options.onConflict || 'id';
    const cols = conflictCol.split(',').map((c) => c.trim());

    if (!db[this.table]) db[this.table] = [];

    const results = [];
    for (const item of items) {
      const idx = db[this.table].findIndex((row) =>
        cols.every((c) => String(row[c] || '').toLowerCase() === String(item[c] || '').toLowerCase())
      );
      if (idx >= 0) {
        Object.assign(db[this.table][idx], item, { updated_at: new Date().toISOString() });
        results.push(db[this.table][idx]);
      } else {
        const newRow = {
          id: item.id || String(Date.now() + Math.floor(Math.random() * 1000)),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
          ...item,
        };
        db[this.table].push(newRow);
        results.push(newRow);
      }
    }
    this._insertData = results;
    return this;
  }

  delete() {
    this._isDelete = true;
    return this;
  }

  eq(col, val) {
    this.filters.push((item) => {
      const v = item[col];
      if (v === undefined || v === null) return val === null || val === undefined;
      if (typeof val === 'boolean') return Boolean(v) === val;
      return String(v).toLowerCase() === String(val).toLowerCase();
    });
    return this;
  }

  neq(col, val) {
    this.filters.push((item) => String(item[col]) !== String(val));
    return this;
  }

  in(col, vals) {
    const set = new Set((vals || []).map((v) => String(v).toLowerCase()));
    this.filters.push((item) => set.has(String(item[col] || '').toLowerCase()));
    return this;
  }

  or(filterStr) {
    if (!filterStr) return this;
    const conditions = filterStr.split(',').map((s) => s.trim()).filter(Boolean);
    const matchers = conditions.map(parseCondition);
    this.filters.push((item) => matchers.some((fn) => fn(item)));
    return this;
  }

  ilike(col, pattern) {
    const clean = String(pattern || '').replace(/^%|%$/g, '').toLowerCase();
    this.filters.push((item) => {
      const v = item[col];
      if (v === undefined || v === null) return false;
      return String(v).toLowerCase().includes(clean);
    });
    return this;
  }

  like(col, pattern) {
    return this.ilike(col, pattern);
  }

  gte(col, val) {
    this.filters.push((item) => {
      const v = item[col];
      if (v === undefined || v === null) return false;
      return Number(v) >= Number(val);
    });
    return this;
  }

  lte(col, val) {
    this.filters.push((item) => {
      const v = item[col];
      if (v === undefined || v === null) return false;
      return Number(v) <= Number(val);
    });
    return this;
  }

  gt(col, val) {
    this.filters.push((item) => {
      const v = item[col];
      if (v === undefined || v === null) return false;
      return Number(v) > Number(val);
    });
    return this;
  }

  lt(col, val) {
    this.filters.push((item) => {
      const v = item[col];
      if (v === undefined || v === null) return false;
      return Number(v) < Number(val);
    });
    return this;
  }

  is(col, val) {
    this.filters.push((item) => {
      const v = item[col];
      if (val === null) return v === null || v === undefined;
      return v === val;
    });
    return this;
  }

  contains(col, val) {
    this.filters.push((item) => {
      const v = item[col];
      if (!v) return false;
      if (Array.isArray(v)) {
        if (Array.isArray(val)) return val.every((x) => v.includes(x));
        return v.includes(val);
      }
      return String(v).includes(String(val));
    });
    return this;
  }

  order(field, { ascending = true } = {}) {
    this._orderField = field;
    this._orderAsc = ascending;
    return this;
  }

  limit(count) {
    this._limit = count;
    return this;
  }

  single() {
    this._isSingle = true;
    return this._execute();
  }

  maybeSingle() {
    this._isMaybeSingle = true;
    return this._execute();
  }

  then(resolve, reject) {
    return this._execute().then(resolve, reject);
  }

  async _execute() {
    let rows = db[this.table] || [];

    // 1. Insert
    if (this._insertData) {
      const inserted = [];
      for (const item of this._insertData) {
        const row = {
          id: item.id || String(Date.now() + Math.floor(Math.random() * 1000)),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
          ...item,
        };
        if (!db[this.table].some((r) => r.id === row.id)) {
          db[this.table].push(row);
        }
        inserted.push(row);
      }
      const res = this._isSingle ? inserted[0] : inserted;
      return { data: res, error: null };
    }

    // 2. Filter
    let result = rows.filter((item) => {
      for (const filter of this.filters) {
        if (!filter(item)) return false;
      }
      return true;
    });

    // 3. Update
    if (this._updateData) {
      for (const item of result) {
        Object.assign(item, this._updateData, { updated_at: new Date().toISOString() });
      }
      return { data: result, error: null };
    }

    // 4. Delete
    if (this._isDelete) {
      db[this.table] = rows.filter((item) => !result.includes(item));
      return { data: result, error: null };
    }

    // 5. Order
    if (this._orderField) {
      result.sort((a, b) => {
        const va = a[this._orderField];
        const vb = b[this._orderField];
        if (va < vb) return this._orderAsc ? -1 : 1;
        if (va > vb) return this._orderAsc ? 1 : -1;
        return 0;
      });
    }

    // 6. Limit
    if (this._limit !== null) {
      result = result.slice(0, this._limit);
    }

    // 7. Single / MaybeSingle
    if (this._isSingle) {
      if (result.length === 0) {
        return { data: null, error: { code: 'PGRST116', message: 'Row not found' } };
      }
      return { data: result[0], error: null };
    }

    if (this._isMaybeSingle) {
      return { data: result[0] || null, error: null };
    }

    return { data: result, error: null };
  }
}

const mockSupabase = {
  from(tableName) {
    return new MockQueryBuilder(tableName);
  },
};

module.exports = { mockSupabase, db };
