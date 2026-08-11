// Format/parse using LOCAL date components (never UTC) so the calendar day
// the user clicks is the exact day sent to the API. `Date#toISOString()`
// converts to UTC, which shifts the date backward for any user in a
// positive UTC offset (e.g. Vietnam, UTC+7) and adds a non-zero
// time-of-day that some backends reject outright. Likewise, parsing a
// plain "yyyy-MM-dd" string with `new Date(str)` is interpreted as UTC
// midnight per spec, which can shift the displayed day backward for
// negative UTC offsets. Both directions here stay in local time.
export const toDateOnlyString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseDateOnlyString = (value: string): Date | undefined => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) {
    return undefined;
  }
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
};
