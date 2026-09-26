// Build day/month boundaries in UTC so they line up with how the frontend sends
// dates. An <input type="date"> value like "2026-09-18" is parsed by
// `new Date("2026-09-18")` as UTC midnight — NOT local midnight. If report
// boundaries are built with local-time constructors (`new Date(y, m, d)`),
// the boundary can land hours away from the stored value depending on the
// server's timezone, which silently pushes matching records outside the
// $gte/$lte window. This was the root cause of the empty daily/weekly/category
// reports — the boundaries and the stored dates were being compared in two
// different "clocks".

function startOfDayUTC(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function endOfDayUTC(date = new Date()) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));
}

function startOfMonthUTC(year, month) {
  // month is 1-12
  return new Date(Date.UTC(year, month - 1, 1));
}

function endOfMonthUTC(year, month) {
  return new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
}

module.exports = { startOfDayUTC, endOfDayUTC, startOfMonthUTC, endOfMonthUTC };
