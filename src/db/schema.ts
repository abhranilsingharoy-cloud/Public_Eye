import { pgTable, serial, text, integer, doublePrecision, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table synced from Firebase Auth
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Civic Issues and Reports table (formerly in issues.json)
export const issues = pgTable('issues', {
  id: text('id').primaryKey(), // e.g. "issue-1"
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(),
  status: text('status').notNull(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  reporter: text('reporter').notNull(),
  upvotes: integer('upvotes').default(0).notNull(),
  votedUsers: jsonb('voted_users').default([]).notNull(), // array of strings (emails)
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  aiCategorized: boolean('ai_categorized').default(false).notNull(),
  aiSeverity: text('ai_severity').default('medium').notNull(),
  media: jsonb('media').default([]).notNull(), // array of media objects
  aiSafetyTips: text('ai_safety_tips'),
  aiSuggestedAction: text('ai_suggested_action'),
  aiTags: jsonb('ai_tags').default([]).notNull(), // array of strings
  comments: jsonb('comments').default([]).notNull(), // array of comment objects
  verifications: jsonb('verifications').default([]).notNull(), // array of verification objects
  statusHistory: jsonb('status_history').default([]).notNull(), // array of status history objects
  verifiedAt: text('verified_at'),
  inProgressAt: text('in_progress_at'),
});

// SafeGuard Hub: Active or Historic SOS signals
export const safeguardSos = pgTable('safeguard_sos', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  logs: jsonb('logs').default([]).notNull(), // Array of console log strings
  status: text('status').notNull(), // 'active', 'resolved', 'canceled'
  createdAt: timestamp('created_at').defaultNow(),
});

// SafeGuard Hub: Safe Zone Check-ins
export const safeguardCheckins = pgTable('safeguard_checkins', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  zoneName: text('zone_name').notNull(),
  checkedInAt: timestamp('checked_in_at').defaultNow(),
});

// SafeGuard Hub: Pre-departure Companion Checklist items
export const safeguardChecklist = pgTable('safeguard_checklist', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  text: text('text').notNull(),
  done: boolean('done').default(false).notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sosAlerts: many(safeguardSos),
  checkins: many(safeguardCheckins),
  checklistItems: many(safeguardChecklist),
}));

export const safeguardSosRelations = relations(safeguardSos, ({ one }) => ({
  user: one(users, {
    fields: [safeguardSos.userId],
    references: [users.id],
  }),
}));

export const safeguardCheckinsRelations = relations(safeguardCheckins, ({ one }) => ({
  user: one(users, {
    fields: [safeguardCheckins.userId],
    references: [users.id],
  }),
}));

export const safeguardChecklistRelations = relations(safeguardChecklist, ({ one }) => ({
  user: one(users, {
    fields: [safeguardChecklist.userId],
    references: [users.id],
  }),
}));
