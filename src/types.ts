/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'analyst' | 'viewer' | 'officer';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  isTwoFactorEnabled: boolean;
  twoFactorSecret?: string;
  isLocked: boolean;
  failedAttempts: number;
  establishedCorporation?: string; // For Corp Officers only
}

export interface UserSession {
  id: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  loginTime: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  module: 'auth' | 'bonds' | 'analytics' | 'maps' | 'settings' | 'api';
  status: 'success' | 'failure';
  details: string;
  ipAddress: string;
  timestamp: string;
}

export type CreditRating = 'AAA' | 'AA+' | 'AA' | 'AA-' | 'A+' | 'A' | 'BBB+';
export type RatingAgency = 'CRISIL' | 'ICRA' | 'CARE' | 'INDIA RATINGS';
export type CorpCategory = 'Metro' | 'Tier-2' | 'Tier-3';

export interface Bond {
  id: string;
  corporationName: string;
  shortName: string;
  state: string;
  bondId: string;
  faceValue: number;
  currentPrice: number;
  yieldPercent: number;
  rating: CreditRating;
  ratingAgency: RatingAgency;
  maturityDate: string;
  change24h: number;
  volume: number; // Volume in Lakhs (INR)
  category: CorpCategory;
  couponPercent: number;
  paymentFrequency: 'Annual' | 'Semi-Annual';
  taxStatus: 'Tax-Free' | 'Taxable';
  projectsFunded: string[];
  capitalRaisedCr: number; // Crores (INR)
  description: string;
  allTimeHigh: number;
  allTimeLow: number;
}

export interface RatingHistory {
  date: string;
  rating: CreditRating;
  agency: RatingAgency;
  outlook: 'Stable' | 'Positive' | 'Negative';
}

export interface BondPriceHistoryPoint {
  time: string; // 1D/1W/1M formats
  price: number;
  yield: number;
}

export interface StateMetrics {
  state: string;
  totalBondsOutstanding: number;
  totalFundsRaisedCr: number;
  avgYield: number;
  corporationsCount: number;
  riskFactor: number; // 1 to 5 (Heatmap density)
  defaultProbabilityPercent: number;
}

export interface LiveTransaction {
  id: string;
  timestamp: string;
  bondId: string;
  corporationName: string;
  price: number;
  yieldPercent: number;
  volumeLakhs: number;
  type: 'BUY' | 'SELL';
}

export interface AlertConfiguration {
  id: string;
  bondId: string;
  targetPrice?: number;
  targetYield?: number;
  type: 'PRICE_ABOVE' | 'PRICE_BELOW' | 'YIELD_ABOVE' | 'YIELD_BELOW' | 'RATING_CHANGE';
  email: boolean;
  sms: boolean;
  active: boolean;
}

export interface NotificationSettings {
  emailPriceAlert: boolean;
  emailRatingChange: boolean;
  emailNewIssuance: boolean;
  emailCouponPayment: boolean;
  smsPriceAlert: boolean;
  smsRatingChange: boolean;
  smsCouponPayment: boolean;
  pushPriceAlert: boolean;
  pushNewIssuance: boolean;
}

export interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  expiresAt: string | 'Never';
  lastUsedAt: string;
  status: 'Active' | 'Revoked';
  callsCount: number;
}

export interface DataSource {
  id: string;
  providerName: string;
  endpointUrl: string;
  status: 'Connected' | 'Degraded' | 'Disconnected';
  refreshIntervalSeconds: number;
  lastSyncTime: string;
  webhookUrl?: string;
}

export interface WatchlistItem {
  bondId: string;
  addedAt: string;
}
