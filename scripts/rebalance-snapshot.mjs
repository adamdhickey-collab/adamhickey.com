#!/usr/bin/env node
/* rebalance-snapshot.mjs -- save one reading of the Citi Bike feed for the
 * rebalancing cockpit to fall back on.
 *
 *   node scripts/rebalance-snapshot.mjs     writes prototype/rebalance-snapshot.js
 *
 * The page reads the live feed in the reader's browser. This file is what it
 * reads instead in three cases: the feed does not answer, the address carries
 * ?snapshot, or the browser is driven by automation (navigator.webdriver),
 * which is every check in scripts/. The checks need the same stations on
 * every run, or resting.mjs and the rest would measure a different page each
 * time and their counts would stop meaning anything.
 *
 * One reading, joined and trimmed: the two GBFS files (station_information,
 * which barely changes, and station_status, which changes every minute) go
 * in as one row per station with only the fields rebalance-cockpit.js reads.
 * Rows are arrays rather than objects, in the order FIELDS names, so the file
 * is about a third of what the feed sends. The id is the station's short
 * name ("6140.05"), not the feed's 36-character one: the snapshot only has
 * to tell its own rows apart, and it is a quarter smaller for it. `updated`
 * is the feed's own
 * last_updated, and the page treats it as "now" when it plays the snapshot,
 * so every age on screen is the age it had when the reading was taken.
 *
 * WHY A SCRIPT AND NOT A JSON FILE. The page loads it with `defer`, so it
 * has run before DOMContentLoaded, and on a saved reading the cockpit
 * renders before that event too. Four of the browser checks load a page to
 * DOMContentLoaded and press at once; as a fetched JSON file the reading
 * arrived after they had pressed, and they measured a page with no cockpit
 * in it. The cost is that every reader downloads it, about 45 KB over the
 * wire, which also makes the fallback instant when the feed is down.
 *
 * Retake it whenever the page's copy refers to what the snapshot shows; the
 * page says the date on screen either way. */
import fs from 'node:fs';

const FEED = 'https://gbfs.lyft.com/gbfs/2.3/bkn/en';
const OUT = 'prototype/rebalance-snapshot.js';
const FIELDS = ['id', 'name', 'lat', 'lon', 'capacity', 'bikes', 'ebikes', 'disabled', 'docks', 'renting', 'reported'];

const get = async (name) => {
  const res = await fetch(`${FEED}/${name}.json`);
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  return res.json();
};

const [info, status] = await Promise.all([get('station_information'), get('station_status')]);
const byId = new Map(status.data.stations.map((s) => [s.station_id, s]));
const rows = [];
for (const s of info.data.stations) {
  const st = byId.get(s.station_id);
  if (!st || !s.capacity) continue;
  rows.push([
    s.short_name || s.station_id, s.name,
    Math.round(s.lat * 1e5) / 1e5, Math.round(s.lon * 1e5) / 1e5,
    s.capacity, st.num_bikes_available, st.num_ebikes_available || 0,
    st.num_bikes_disabled || 0, st.num_docks_available,
    st.is_installed && st.is_renting ? 1 : 0, st.last_reported,
  ]);
}
const data = JSON.stringify({ source: `${FEED}/`, updated: status.last_updated, fields: FIELDS, stations: rows });
fs.writeFileSync(OUT, `/* One saved reading of ${FEED}/, written by scripts/rebalance-snapshot.mjs. */\nwindow.REBALANCE_SNAPSHOT = ${data};\n`);
console.log(`${OUT}: ${rows.length} stations, reading of ${new Date(status.last_updated * 1000).toISOString()}, ${(fs.statSync(OUT).size / 1024).toFixed(0)} KB`);
