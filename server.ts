import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'nutrisnap-secret-key';
const PORT = 3000;

// Initialize Database
const db = new Database('nutrisnap.db');
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    weight REAL,
    height REAL,
    goal_weight REAL,
    diet_goal TEXT DEFAULT 'balanced'
  );

  -- Ensure a default user exists
  INSERT OR IGNORE INTO users (id, email, password, name) VALUES (1, 'user@example.com', 'password', 'Guest User');

  CREATE TABLE IF NOT EXISTS meals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    image_url TEXT,
    items TEXT, -- JSON string
    calories REAL,
    protein REAL,
    carbs REAL,
    fat REAL,
    fiber REAL,
    vitamins TEXT, -- JSON string
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );

  CREATE TABLE IF NOT EXISTS water_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  );
`);

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Ensure uploads directory exists
  const uploadsDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
  }
  app.use('/uploads', express.static(uploadsDir));

  const DEFAULT_USER_ID = 1;

  // --- API Routes ---

  // Profile
  app.get('/api/profile', (req: any, res) => {
    const user = db.prepare('SELECT id, email, name, weight, height, goal_weight, diet_goal FROM users WHERE id = ?').get(DEFAULT_USER_ID);
    res.json(user);
  });

  app.put('/api/profile', (req: any, res) => {
    const { name, weight, height, goal_weight, diet_goal } = req.body;
    db.prepare('UPDATE users SET name = ?, weight = ?, height = ?, goal_weight = ?, diet_goal = ? WHERE id = ?')
      .run(name, weight, height, goal_weight, diet_goal, DEFAULT_USER_ID);
    res.json({ success: true });
  });

  // Meals
  app.get('/api/meals', (req: any, res) => {
    const meals = db.prepare('SELECT * FROM meals WHERE user_id = ? ORDER BY timestamp DESC').all(DEFAULT_USER_ID);
    res.json(meals.map((m: any) => ({
      ...m,
      items: JSON.parse(m.items || '[]'),
      vitamins: JSON.parse(m.vitamins || '{}')
    })));
  });

  app.post('/api/meals', (req: any, res) => {
    const { type, image_url, items, calories, protein, carbs, fat, fiber, vitamins } = req.body;
    const stmt = db.prepare(`
      INSERT INTO meals (user_id, type, image_url, items, calories, protein, carbs, fat, fiber, vitamins)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      DEFAULT_USER_ID,
      type,
      image_url,
      JSON.stringify(items),
      calories,
      protein,
      carbs,
      fat,
      fiber,
      JSON.stringify(vitamins)
    );
    res.json({ id: info.lastInsertRowid });
  });

  // Water
  app.get('/api/water', (req: any, res) => {
    const logs = db.prepare("SELECT * FROM water_logs WHERE user_id = ? AND date(timestamp) = date('now')").all(DEFAULT_USER_ID);
    res.json(logs);
  });

  app.post('/api/water', (req: any, res) => {
    const { amount } = req.body;
    db.prepare('INSERT INTO water_logs (user_id, amount) VALUES (?, ?)').run(DEFAULT_USER_ID, amount);
    res.json({ success: true });
  });

  // Image Upload (Base64 for simplicity in this environment)
  app.post('/api/upload', (req: any, res) => {
    const { image } = req.body; // base64
    if (!image) return res.status(400).json({ error: 'No image provided' });

    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const filename = `meal-${Date.now()}.jpg`;
    const filepath = path.join(uploadsDir, filename);

    fs.writeFileSync(filepath, base64Data, 'base64');
    res.json({ url: `/uploads/${filename}` });
  });

  // --- Vite Integration ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
