import { pgTable, text, uuid, date, integer } from 'drizzle-orm/pg-core';
import { createDeleteAndUpdateTimeStamps } from './utils-entities';
import { corporaTable } from './corpora.schema';
import { SettingEnum } from '@unic/shared/database-dto';
import { relations } from 'drizzle-orm';

export const eventTable = pgTable('events', {
  event_uuid: uuid('event_uuid').defaultRandom().primaryKey(),
  corpora_uuid: uuid('corpora_uuid')
    .notNull()
    .references(() => corporaTable.corpora_uuid),
  event_id: text('event_id'),
  event_date: date('event_date'),
  setting: text('setting').$type<SettingEnum>(),
  setting_specific: text('setting_specific'),
  topic_domain: text('topic_domain').array(),
  event_duration: text('event_duration'),
  event_token_gloss_count: integer('event_token_gloss_count'),

  ...createDeleteAndUpdateTimeStamps,
});

export const eventTableRelation = relations(eventTable, ({ one }) => ({
  corpora: one(corporaTable, {
    fields: [eventTable.corpora_uuid],
    references: [corporaTable.corpora_uuid],
  }),
}));
