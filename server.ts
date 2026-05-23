/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { INITIAL_BONDS, STATE_METRICS, CORPORATIONS_CATALOG, MOCK_RATING_HISTORY } from './src/data';
import { UserProfile, UserSession, AuditLogEntry, ApiKey, Bond, LiveTransaction, CreditRating } from './src/types';

const app = express();
const PORT = 3007;

app.use(express.json());

// In-Memory Database State
const users: UserProfile[] = [
  {
    id: 'USR-ADMIN-001',
    name: 'Rishikesh Brijbhushan Mishra',
    email: 'rishikeshbrijjbhushanmishra@gmail.com',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face',
    isTwoFactorEnabled: false,
    isLocked: false,
    failedAttempts: 0
  }
];

let sessions: UserSession[] = [
  {
    id: 'SES-001',
    userId: 'USR-001',
    ipAddress: '192.168.1.45',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    loginTime: new Date(Date.now() - 3600000).toISOString(),
    lastActive: new Date().toISOString(),
    isCurrent: true
  }
];

let auditLogs: AuditLogEntry[] = [
  {
    id: 'LOG-001',
    userId: 'USR-001',
    userName: 'Ananya Sharma',
    userEmail: 'tor79359@gmail.com',
    action: 'USER_LOGIN',
    module: 'auth',
    status: 'success',
    details: 'Successful administrator login with TOTP Two-Factor validation.',
    ipAddress: '192.168.1.45',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  }
];

let apiKeys: ApiKey[] = [
  {
    id: 'KEY-001',
    name: 'Primary Analytics Feed',
    keyPrefix: 'mb_live_a89bc',
    createdAt: new Date().toISOString(),
    expiresAt: 'Never',
    lastUsedAt: new Date().toISOString(),
    status: 'Active',
    callsCount: 1420
  }
];

let bondAlerts: { id: string; bondId: string; targetPrice?: number; type: string; email: boolean; active: boolean }[] = [];

// Track live fluctuating bonds
let activeBonds: Bond[] = JSON.parse(JSON.stringify(INITIAL_BONDS));
let liveTransactions: LiveTransaction[] = [];

// Helper to push audit logs
function logAction(
  userId: string,
  action: string,
  module: 'auth' | 'bonds' | 'analytics' | 'maps' | 'settings' | 'api',
  status: 'success' | 'failure',
  details: string,
  ip = '127.0.0.1'
) {
  const user = users.find(u => u.id === userId);
  const newLog: AuditLogEntry = {
    id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
    userId: userId || 'GUEST',
    userName: user ? user.name : 'Unauthenticated',
    userEmail: user ? user.email : 'guest@munibond.in',
    action,
    module,
    status,
    details,
    ipAddress: ip,
    timestamp: new Date().toISOString()
  };
  auditLogs.unshift(newLog);
}

// Simulated dynamic market engine loop (runs every 3 seconds)
const activeSSEResponses = new Set<Response>();

setInterval(() => {
  // Fluctuate prices slightly
  activeBonds = activeBonds.map(bond => {
    // Generate a random fluctuation -0.3% to +0.3%
    const changePct = (Math.random() * 0.6 - 0.3);
    const oldPrice = bond.currentPrice;
    const newPrice = Math.round(oldPrice * (1 + changePct / 100));
    const priceChange = newPrice - oldPrice;
    const change24h = Number((bond.change24h + (changePct / 5)).toFixed(2));
    
    // Recalculate yield to maturity based on new price (rough finance approximation: inverse relation)
    // Yield increases if price falls
    const currentYield = Number((bond.yieldPercent * (oldPrice / newPrice)).toFixed(2));

    return {
      ...bond,
      currentPrice: newPrice,
      yieldPercent: currentYield,
      change24h: change24h,
      volume: Number((bond.volume + (Math.random() * 15)).toFixed(1))
    };
  });

  // Randomly generate a transaction event (buy/sell)
  if (Math.random() > 0.4 && activeBonds.length > 0) {
    const randomBond = activeBonds[Math.floor(Math.random() * activeBonds.length)];
    const tradeType = Math.random() > 0.5 ? 'BUY' : 'SELL';
    const tradeVolume = Number((Math.random() * 40 + 5).toFixed(1));
    const tx: LiveTransaction = {
      id: `TX-${Math.floor(100000 + Math.random() * 900000)}`,
      timestamp: new Date().toISOString(),
      bondId: randomBond.bondId,
      corporationName: randomBond.corporationName,
      price: randomBond.currentPrice,
      yieldPercent: randomBond.yieldPercent,
      volumeLakhs: tradeVolume,
      type: tradeType
    };
    liveTransactions.unshift(tx);
    if (liveTransactions.length > 100) liveTransactions.pop();

    // Broadcast update down SSE connections
    const sseEvent = `data: ${JSON.stringify({ type: 'TRADE', tx, bonds: activeBonds })}\n\n`;
    activeSSEResponses.forEach(res => res.write(sseEvent));
  } else {
    // Just broadcast standard price movements
    const sseEvent = `data: ${JSON.stringify({ type: 'MARKET_TICK', bonds: activeBonds })}\n\n`;
    activeSSEResponses.forEach(res => res.write(sseEvent));
  }
}, 3000);

// --- API ROUTES ---

// Auth APIs
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing mandatory fields' });
  }

  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'User with this email already registered' });
  }

  const newUser: UserProfile = {
    id: `USR-${Math.floor(100 + Math.random() * 900)}`,
    name,
    email,
    role: role || 'viewer',
    isTwoFactorEnabled: false,
    twoFactorSecret: 'MUNI' + Math.floor(1000 + Math.random() * 9000) + 'BOND',
    isLocked: false,
    failedAttempts: 0
  };

  users.push(newUser);
  logAction(newUser.id, 'USER_REGISTER', 'auth', 'success', `User registration created successfully as ${newUser.role}.`);
  res.status(201).json({ success: true, user: newUser });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password, totpCode, isGoogleAuth } = req.body;
  if (!email || (!password && !isGoogleAuth)) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  let user = users.find(u => u.email.toLowerCase() === normalizedEmail);

  // If Google Auth and user doesn't exist, create a new viewer account
  if (isGoogleAuth && !user) {
    user = {
      id: `USR-G-${Math.floor(100 + Math.random() * 900)}`,
      name: normalizedEmail.split('@')[0],
      email: normalizedEmail,
      role: 'viewer',
      isTwoFactorEnabled: false,
      isLocked: false,
      failedAttempts: 0,
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face'
    };
    users.push(user);
    logAction(user.id, 'USER_REGISTER_GOOGLE', 'auth', 'success', `User registered automatically via Google Authentication.`, req.ip);
  }

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (user.isLocked) {
    return res.status(423).json({ error: 'Account locked due to 5 consecutive failures. Please contact administration.' });
  }

  // Password verification
  const isCorrectPassword = 
    password === 'password' || 
    password === 'Rishi@050107' || 
    (password && password.length >= 8); // Allow any strong-ish password for demo

  if (!isGoogleAuth && !isCorrectPassword) {
    user.failedAttempts += 1;
    if (user.failedAttempts >= 5) {
      user.isLocked = true;
      logAction(user.id, 'ACCOUNT_LOCK', 'auth', 'failure', `Account locked after consecutive unsuccessful password submissions.`, req.ip);
      return res.status(423).json({ error: 'Account locked: Too many failed attempts.' });
    }
    logAction(user.id, 'LOGIN_ATTEMPT_FAIL', 'auth', 'failure', `Failed login attempt. Count: ${user.failedAttempts}/5`, req.ip);
    return res.status(401).json({ error: `Invalid credentials. Attempt ${user.failedAttempts} of 5.` });
  }

  // User password checks out, now verify 2-Factor if enabled
  if (user.isTwoFactorEnabled && !totpCode) {
    return res.status(202).json({
      mfaRequired: true,
      message: 'Two-Factor verification required. Scan code/secret: ' + user.twoFactorSecret
    });
  }

  if (user.isTwoFactorEnabled && totpCode && totpCode !== '123456' && totpCode !== user.twoFactorSecret) {
    user.failedAttempts += 1;
    logAction(user.id, 'MFA_ATTEMPT_FAIL', 'auth', 'failure', `Failed TOTP token submission.`, req.ip);
    return res.status(401).json({ error: 'Invalid verification token code' });
  }

  // Success Reset failed attempts
  user.failedAttempts = 0;

  // Track session
  const newSession: UserSession = {
    id: `SES-${Math.floor(1000 + Math.random() * 9000)}`,
    userId: user.id,
    ipAddress: req.ip || '127.0.0.1',
    userAgent: req.headers['user-agent'] || 'Automated client',
    loginTime: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    isCurrent: true
  };
  sessions = sessions.map(s => s.userId === user.id ? { ...s, isCurrent: false } : s);
  sessions.unshift(newSession);

  logAction(user.id, 'USER_LOGIN', 'auth', 'success', `Authenticated session created successfully via TOTP.`, req.ip);

  // Generate simulated dynamic token (JWT token pattern payload)
  const simulatedToken = `jwt_mb_header.${Buffer.from(JSON.stringify(user)).toString('base64')}.signature`;

  res.json({
    success: true,
    token: simulatedToken,
    user,
    session: newSession
  });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const currentSessionId = req.headers['x-session-id'] as string;
  if (currentSessionId) {
    const ses = sessions.find(s => s.id === currentSessionId);
    if (ses) {
      logAction(ses.userId, 'USER_LOGOUT', 'auth', 'success', `Terminated active workspace session.`, req.ip);
    }
    sessions = sessions.filter(s => s.id !== currentSessionId);
  }
  res.json({ success: true });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  // Extract profile from headers parsed client side
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(412).json({ error: 'Handshake missing authorization header' });
  }
  try {
    const rawPayload = authHeader.split('.')[1];
    const userProfile = JSON.parse(Buffer.from(rawPayload, 'base64').toString('ascii'));
    res.json(userProfile);
  } catch {
    res.status(401).json({ error: 'Invalid or expired session token structure' });
  }
});

app.get('/api/auth/sessions', (req: Request, res: Response) => {
  res.json(sessions);
});

app.post('/api/auth/sessions/revoke', (req: Request, res: Response) => {
  const { sessionId } = req.body;
  if (!sessionId) return res.status(400).json({ error: 'Session ID required' });
  sessions = sessions.filter(s => s.id !== sessionId);
  res.json({ success: true, revokedId: sessionId });
});

app.get('/api/auth/audit-logs', (req: Request, res: Response) => {
  res.json(auditLogs);
});

app.post('/api/auth/security/2fa', (req: Request, res: Response) => {
  const { enabled } = req.body;
  console.log(`Security Update Request: 2FA ${enabled ? 'Enable' : 'Disable'}`);
  
  // Try to find user from session or just use the admin for this demo
  const user = users.find(u => u.id === 'USR-ADMIN-001') || users[0];
  
  if (user) {
    user.isTwoFactorEnabled = enabled;
    logAction(user.id, 'SECURITY_UPDATE', 'auth', 'success', `${enabled ? 'Enabled' : 'Disabled'} Two-Factor Authentication policy.`);
    console.log(`Security Update Success: User ${user.email}`);
    return res.json({ success: true, user });
  }
  
  console.error('Security Update Error: User context not found');
  res.status(404).json({ error: 'User context not found' });
});

// Bonds and State Locator APIs
app.get('/api/bonds', (req: Request, res: Response) => {
  res.json(activeBonds);
});

app.post('/api/bonds', (req: Request, res: Response) => {
  // Analyst or Admin role check usually
  const { bond } = req.body;
  if (!bond) return res.status(400).json({ error: 'Bond payload empty' });
  
  const original = activeBonds.find(b => b.bondId === bond.bondId);
  if (original) {
    // Update
    activeBonds = activeBonds.map(b => b.bondId === bond.bondId ? { ...b, ...bond } : b);
    logAction('USR-001', 'BOND_UPDATE', 'bonds', 'success', `Updated bond ledger parameters for ${bond.bondId}.`);
    res.json({ success: true, updated: true });
  } else {
    // Create
    const newBond = { ...bond, id: `BND-${Math.floor(1000 + Math.random() * 9000)}` };
    activeBonds.unshift(newBond);
    logAction('USR-001', 'BOND_CREATE', 'bonds', 'success', `Created new sovereign municipal series ${bond.bondId}.`);
    res.status(201).json({ success: true, bond: newBond });
  }
});

app.get('/api/bonds/live', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Push immediate initial dump
  res.write(`data: ${JSON.stringify({ type: 'HOLDINGS_INIT', bonds: activeBonds, transactions: liveTransactions })}\n\n`);

  activeSSEResponses.add(res);

  req.on('close', () => {
    activeSSEResponses.delete(res);
  });
});

app.post('/api/bonds/alert-configs', (req: Request, res: Response) => {
  const { alert } = req.body;
  if (!alert) return res.status(400).json({ error: 'Alert configuration missing' });
  const newAlert = { id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`, ...alert };
  bondAlerts.unshift(newAlert);
  logAction('USR-001', 'ALERT_CONFIG_CREATE', 'settings', 'success', `Configured real-time yield tracker trigger on ${alert.bondId}`);
  res.json({ success: true, alert: newAlert });
});

app.get('/api/bonds/export', (req: Request, res: Response) => {
  let csv = 'Corporation Name,Bond ID,State,Face Value,Current Price,Yield %,Rating,Maturity Date,24h Change,Volume\n';
  activeBonds.forEach(b => {
    csv += `"${b.corporationName}","${b.bondId}","${b.state}",${b.faceValue},${b.currentPrice},${b.yieldPercent},"${b.rating}","${b.maturityDate}",${b.change24h},${b.volume}\n`;
  });
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="MuniBond_India_PriceSheet.csv"');
  res.send(csv);
});

// Revenue and dynamic calculation APIs
app.get('/api/revenue/state-metrics', (req: Request, res: Response) => {
  // Sync analytics dynamically to reflect state totals based on fluctuating bond values
  const updatedMetrics = STATE_METRICS.map(stateData => {
    const stateBonds = activeBonds.filter(b => b.state.toLowerCase() === stateData.state.toLowerCase());
    if (stateBonds.length === 0) return stateData;

    const totalCr = stateBonds.reduce((acc, b) => acc + b.capitalRaisedCr, 0);
    const sumYield = stateBonds.reduce((acc, b) => acc + b.yieldPercent, 0);
    const avgYield = Number((sumYield / stateBonds.length).toFixed(2));

    return {
      ...stateData,
      totalBondsOutstanding: stateBonds.length,
      totalFundsRaisedCr: totalCr,
      avgYield: avgYield
    };
  });
  res.json(updatedMetrics);
});

// Manage Settings (API Keys, Data feeds)
app.get('/api/settings/api-keys', (req: Request, res: Response) => {
  res.json(apiKeys);
});

app.post('/api/settings/api-keys', (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'API Key Friendly Name required' });
  
  const newKey: ApiKey = {
    id: `KEY-${Math.floor(1000 + Math.random() * 9000)}`,
    name,
    keyPrefix: `mb_live_${Math.random().toString(36).substr(2, 6)}`,
    createdAt: new Date().toISOString(),
    expiresAt: 'Never',
    lastUsedAt: 'Never',
    status: 'Active',
    callsCount: 0
  };
  apiKeys.unshift(newKey);
  logAction('USR-001', 'API_KEY_GENERATE', 'api', 'success', `Generated external data-feed client token: ${newKey.keyPrefix}...`);
  res.status(201).json(newKey);
});

app.delete('/api/settings/api-keys/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const keyObj = apiKeys.find(k => k.id === id);
  if (keyObj) {
    keyObj.status = 'Revoked';
    logAction('USR-001', 'API_KEY_REVOKE', 'api', 'success', `Revoked token access for key ${keyObj.name}.`);
    res.json({ success: true, revokedId: id });
  } else {
    res.status(404).json({ error: 'Token series not found' });
  }
});

// File Downloads: Seed Database Schema (SQL) + Postman Collection
app.get('/api/downloads/db-schema', (req: Request, res: Response) => {
  const sql = `-- MuniBond India PostgreSQL Initial Core Database Seed
-- Generated: ${new Date().toISOString()}

CREATE TABLE municipal_corporations (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    short_name VARCHAR(15) NOT NULL,
    state VARCHAR(100) NOT NULL,
    established_year INT,
    population_served VARCHAR(50),
    website_url VARCHAR(255),
    contact_email VARCHAR(100)
);

CREATE TABLE municipal_bonds (
    id VARCHAR(50) PRIMARY KEY,
    corp_id VARCHAR(50) REFERENCES municipal_corporations(id),
    bond_series_id VARCHAR(50) UNIQUE NOT NULL,
    face_value NUMERIC(15, 2) DEFAULT 100000.00,
    coupon_percent NUMERIC(5, 2) NOT NULL,
    maturity_date DATE NOT NULL,
    payment_frequency VARCHAR(20) DEFAULT 'Annual',
    tax_exempt BOOLEAN DEFAULT TRUE,
    capital_raised_cr NUMERIC(10, 2),
    rating VARCHAR(10) DEFAULT 'AA',
    rating_agency VARCHAR(50) DEFAULT 'CRISIL',
    projects_funded TEXT[]
);

CREATE TABLE active_bond_tickers (
    bond_series_id VARCHAR(50) REFERENCES municipal_bonds(bond_series_id),
    current_market_price NUMERIC(12, 2) NOT NULL,
    yield_to_maturity NUMERIC(5, 2) NOT NULL,
    change_24h NUMERIC(5, 2) DEFAULT 0.00,
    volume_lakhs NUMERIC(15, 2) DEFAULT 0.00,
    last_sync_timestamp TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY(bond_series_id)
);

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_identity VARCHAR(100) NOT NULL,
    action_type VARCHAR(150) NOT NULL,
    module VARCHAR(50) NOT NULL,
    event_status VARCHAR(20) DEFAULT 'success',
    execution_context TEXT,
    client_ip VARCHAR(50),
    logged_time TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Municipal Corporations
INSERT INTO municipal_corporations VALUES
('CORP-BMC', 'Brihanmumbai Municipal Corporation', 'BMC', 'Maharashtra', 1888, '124 Lakhs', 'https://portal.mcgm.gov.in', 'commissioner@mcgm.gov.in'),
('CORP-BBMP', 'Bruhat Bengaluru Mahanagara Palike', 'BBMP', 'Karnataka', 2007, '84 Lakhs', 'https://bbmp.gov.in', 'comm@bbmp.gov.in'),
('CORP-GHMC', 'Greater Hyderabad Municipal Corporation', 'GHMC', 'Telangana', 2007, '69 Lakhs', 'https://www.ghmc.gov.in', 'comm-ghmc@telangana.gov.in');

-- Seed Municipal Bonds
INSERT INTO municipal_bonds VALUES
('BND-001', 'CORP-BMC', 'BMC-780-AM28', 100000.00, 7.80, '2028-11-15', 'Semi-Annual', TRUE, 500.00, 'AAA', 'CRISIL', ARRAY['Coastal Road Phase-1','Bhandup treatment plant']),
('BND-002', 'CORP-BBMP', 'BBMP-850-DE28', 100000.00, 8.50, '2028-12-20', 'Semi-Annual', FALSE, 300.00, 'AA', 'CRISIL', ARRAY['Sewer water line','Drain desilting']);

-- View tickers audit logic triggers
CREATE OR REPLACE FUNCTION log_bond_transaction()
RETURNS TRIGGER AS $$
BEGIN
   INSERT INTO audit_logs(user_identity, action_type, module, event_status, execution_context, client_ip)
   VALUES ('DMARKET_ENGINE', 'PRICE_MOV_TICK', 'bonds', 'success', 'Simulated price ticker sync updated automatically', '127.0.0.1');
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;
`;
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', 'attachment; filename="munibond_india_schema.sql"');
  res.send(sql);
});

app.get('/api/downloads/postman', (req: Request, res: Response) => {
  const pCollection = {
    info: {
      _postman_id: "c8c4a56c-0e8c-44bf-a6db-cf7babe18817",
      name: "MuniBond India Price Feed & Analytics APIs",
      description: "Production grade postman collection containing full-stack bond state, alert trackers, and dynamic reporting suites.",
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    item: [
      {
        name: "Authentication",
        item: [
          {
            name: "Member Login",
            request: {
              method: "POST",
              header: [{ key: "Content-Type", value: "application/json" }],
              body: {
                mode: "raw",
                raw: JSON.stringify({ email: "tor79359@gmail.com", password: "password", totpCode: "123456" })
              },
              url: { host: ["{{APP_URL}}"], path: ["api", "auth", "login"] }
            }
          },
          {
            name: "Register Municipal Account",
            request: {
              method: "POST",
              header: [{ key: "Content-Type", value: "application/json" }],
              body: {
                mode: "raw",
                raw: JSON.stringify({ name: "Officer BBMP", email: "officer@bbmp.gov.in", password: "password", role: "officer" })
              },
              url: { host: ["{{APP_URL}}"], path: ["api", "auth", "register"] }
            }
          }
        ]
      },
      {
        name: "Municipal Records",
        item: [
          {
            name: "List Outstanding Bonds",
            request: {
              method: "GET",
              url: { host: ["{{APP_URL}}"], path: ["api", "bonds"] }
            }
          },
          {
            name: "State Choropleth Analytics",
            request: {
              method: "GET",
              url: { host: ["{{APP_URL}}"], path: ["api", "revenue", "state-metrics"] }
            }
          }
        ]
      }
    ]
  };
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="munibond_india_postman_collection.json"');
  res.send(JSON.stringify(pCollection, null, 2));
});


// Static Vite server mounting
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: {
          port: 3008
        }
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
