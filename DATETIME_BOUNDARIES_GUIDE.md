# DateTime Boundaries Guide - Min/Max Time Support

This guide explains how to use the **absolute datetime boundaries** feature with `minTime` and `maxTime` props.

## How It Works

The `minTime` and `maxTime` props accept **Date objects** representing **absolute datetime boundaries**. This means:

- **minTime**: The earliest allowed datetime (e.g., January 1, 2024 at 10:00 PM)
- **maxTime**: The latest allowed datetime (e.g., January 31, 2024 at 8:00 PM)

Any time outside these boundaries will be **displayed in red** and **cannot be selected**.

## Example Scenario

```javascript
// Scenario: Allow selection from Jan 1, 2024 10:00 PM to Jan 31, 2024 8:00 PM

const minTime = new Date(2024, 0, 1, 22, 0); // January 1, 2024, 10:00 PM
const maxTime = new Date(2024, 0, 31, 20, 0); // January 31, 2024, 8:00 PM
```

**What happens:**

### January 1st (Start boundary)
- ✅ Hours 22 (10 PM) and 23 (11 PM) are **available**
- ❌ Hours 0-21 (12 AM - 9 PM) are **disabled (red)**

### January 2nd - 30th (Dates in between)
- ✅ **All hours (0-23) are available**
- No restrictions applied

### January 31st (End boundary)
- ✅ Hours 0-20 (12 AM - 8 PM) are **available**
- ❌ Hours 21-23 (9 PM - 11 PM) are **disabled (red)**

## Usage Examples

### Basic Usage

```jsx
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

function MyDateRangePicker() {
  const [state, setState] = useState([
    {
      startDate: new Date(2024, 0, 1, 22, 0), // Jan 1, 2024, 10 PM
      endDate: new Date(2024, 0, 31, 20, 0),   // Jan 31, 2024, 8 PM
      key: 'selection'
    }
  ]);

  const minTime = new Date(2024, 0, 1, 22, 0);  // Jan 1, 2024, 10:00 PM
  const maxTime = new Date(2024, 0, 31, 20, 0); // Jan 31, 2024, 8:00 PM

  return (
    <DateRange
      ranges={state}
      onChange={item => setState([item.selection])}
      showTimePicker={true}
      showHours={true}
      showMinutes={true}
      minTime={minTime}
      maxTime={maxTime}
    />
  );
}
```

### QueryCalendar Usage (dclimate-monorepo)

```tsx
import QueryCalendar from 'components/General/QueryCalendar';

function MyComponent() {
  const [calendarState, setCalendarState] = useState([
    {
      startDate: new Date(2024, 0, 1, 22, 0),
      endDate: new Date(2024, 0, 31, 20, 0),
      key: 'selection'
    }
  ]);

  // Define absolute datetime boundaries
  const minTime = new Date(2024, 0, 1, 22, 0);  // Jan 1, 10 PM
  const maxTime = new Date(2024, 0, 31, 20, 0); // Jan 31, 8 PM

  return (
    <QueryCalendar
      className="calendar"
      enabled
      onChange={setCalendarState}
      filterCalendar
      currentFormState={calendarState}
      minTime={minTime}
      maxTime={maxTime}
    />
  );
}
```

## Common Scenarios

### 1. Business Hours Across a Week

```javascript
// Monday 9 AM to Friday 5 PM
const minTime = new Date(2024, 0, 1, 9, 0);  // Monday, Jan 1, 9:00 AM
const maxTime = new Date(2024, 0, 5, 17, 0); // Friday, Jan 5, 5:00 PM

// Result:
// - Monday: Only 9 AM onwards available
// - Tuesday-Thursday: All hours available
// - Friday: Only up to 5 PM available
```

### 2. Event Duration (Single Day with Time Range)

```javascript
// Conference from 8 AM to 6 PM on Jan 15
const minTime = new Date(2024, 0, 15, 8, 0);  // Jan 15, 8:00 AM
const maxTime = new Date(2024, 0, 15, 18, 0); // Jan 15, 6:00 PM

// Result:
// - Jan 15: Only hours 8-18 available
// - Other dates: Not selectable (use minDate/maxDate for this)
```

### 3. Multi-Day Event with Specific Start/End Times

```javascript
// Weekend retreat: Friday 6 PM to Sunday 2 PM
const minTime = new Date(2024, 0, 12, 18, 0); // Friday, Jan 12, 6:00 PM
const maxTime = new Date(2024, 0, 14, 14, 0); // Sunday, Jan 14, 2:00 PM

// Result:
// - Friday (Jan 12): Only 6 PM - 11 PM available
// - Saturday (Jan 13): All hours available
// - Sunday (Jan 14): Only 12 AM - 2 PM available
```

### 4. Late Night Operations

```javascript
// Available from 8 PM Jan 1 to 4 AM Jan 2
const minTime = new Date(2024, 0, 1, 20, 0);  // Jan 1, 8:00 PM
const maxTime = new Date(2024, 0, 2, 4, 0);   // Jan 2, 4:00 AM

// Result:
// - Jan 1: Only 8 PM - 11 PM available
// - Jan 2: Only 12 AM - 4 AM available
```

## Props

### DateRange Component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `minTime` | `Date` | `undefined` | Absolute minimum datetime boundary |
| `maxTime` | `Date` | `undefined` | Absolute maximum datetime boundary |
| `showTimePicker` | `boolean` | `false` | Show/hide the time picker |
| `showHours` | `boolean` | `true` | Show/hide hour selection |
| `showMinutes` | `boolean` | `true` | Show/hide minute selection |

### QueryCalendar Component

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `minTime` | `Date` | `undefined` | Absolute minimum datetime (e.g., Jan 1, 2024 10:00 PM) |
| `maxTime` | `Date` | `undefined` | Absolute maximum datetime (e.g., Jan 31, 2024 8:00 PM) |
| `enabled` | `boolean` | `true` | Enable/disable the calendar |
| `filterCalendar` | `boolean` | `false` | Apply filter calendar styling |
| `currentFormState` | `any` | `undefined` | Current selected date range state |

## Visual Feedback

### Disabled Hours/Minutes
- **Text Color**: Red (`#dc3545`)
- **Background**: Light red (`rgba(220, 53, 69, 0.05)`)
- **Opacity**: 0.6
- **Cursor**: `not-allowed`
- **Behavior**: Not clickable

### Available Hours/Minutes
- **Text Color**: Normal (`#7d888d`)
- **Background**: Normal (hover: `#f4f5f7`)
- **Cursor**: `pointer`
- **Behavior**: Clickable

## Important Notes

1. **Date Objects Required**: Both `minTime` and `maxTime` must be JavaScript Date objects representing the exact datetime boundaries.

2. **Full DateTime Comparison**: The validation compares the full datetime (date + time), not just the time portion.

3. **Boundaries are Inclusive**: Times at exactly `minTime` and `maxTime` are selectable.

4. **Works with Date Restrictions**: You can combine `minTime`/`maxTime` with `minDate`/`maxDate` props to restrict both dates and times.

5. **Validation in UI and Handler**: Time restrictions are enforced both visually (red disabled items) and programmatically (change handler validates before applying).

6. **No Timezone Handling**: All dates use the browser's local timezone. Ensure your min/max dates are in the correct timezone.

## Creating DateTime Boundaries Dynamically

```javascript
// Example: Allow selection for next 7 days, 9 AM to 5 PM daily
const now = new Date();

// Start from tomorrow 9 AM
const minTime = new Date(now);
minTime.setDate(now.getDate() + 1);
minTime.setHours(9, 0, 0, 0);

// End 7 days later at 5 PM
const maxTime = new Date(now);
maxTime.setDate(now.getDate() + 7);
maxTime.setHours(17, 0, 0, 0);

// Result:
// - Tomorrow: 9 AM onwards
// - Days 2-6: All hours
// - Day 7: Up to 5 PM
```

## Troubleshooting

### Issue: All hours are disabled
**Cause**: `minTime` is after `maxTime`, or the selected date is outside the datetime range.
**Solution**: Verify that `minTime < maxTime` and the date you're viewing is within the range.

### Issue: Wrong hours disabled
**Cause**: Timezone mismatch or incorrect date object creation.
**Solution**: Use `console.log(minTime, maxTime)` to verify the exact datetimes you're creating.

### Issue: Changes not applying
**Cause**: The react-date-range library might not be updated.
**Solution**: Rebuild the library with `npm run build` in the react-date-range directory.

## Comparison: Old vs New Behavior

### ❌ Old (Incorrect) Behavior
```javascript
minTime = 9 AM
maxTime = 5 PM

// Every single day had 9 AM - 5 PM restrictions
// - Jan 1: 9 AM - 5 PM only
// - Jan 2: 9 AM - 5 PM only
// - Jan 3: 9 AM - 5 PM only
```

### ✅ New (Correct) Behavior
```javascript
minTime = new Date(2024, 0, 1, 9, 0)  // Jan 1, 9 AM
maxTime = new Date(2024, 0, 31, 17, 0) // Jan 31, 5 PM

// Absolute datetime boundaries
// - Jan 1: >= 9 AM
// - Jan 2-30: All hours available
// - Jan 31: <= 5 PM
```
