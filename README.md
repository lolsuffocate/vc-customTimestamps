# vc-customTimestamps

This plugin allows you to customize the timestamps in chat messages and tooltips.

## Formats

- Cozy: The timestamp by your username when chat is in cozy mode.
- Compact: The timestamp to the left of messages when chat is in compact mode when you send multiple messages in cozy mode.
- Tooltip: The timestamp in the tooltip when hovering over a message.

### Placeholders

- **[calendar]**: Replaced with moment.js's calendar time, which dynamically adjusts based on the date.
- **[relative]**: Replaced with moment.js's relative time, such as "4 hours ago".

### Timeframes for Calendar Time

- **Same day**: Format for today's dates (e.g., "Today, 2:30 PM").
- **Last day**: Format for yesterday's dates (e.g., "Yesterday, 2:30 PM").
- **Last week**: Format for dates within the last week (e.g., "Monday, 2:30 PM").
- **Same else**: Format for older dates (e.g., "01/01/2024, 2:30 PM").

For more information on formatting options, refer to the [Moment.js formatting documentation](https://momentjs.com/docs/#/displaying/format/).
