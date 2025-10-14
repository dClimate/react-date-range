# Min/Max Time Support for DateRange Component

This document explains how to use the new min/max time support feature that makes unavailable dates and hours appear in red.

## Features Added

1. **minTime and maxTime props** - Control which hours and minutes are available for selection
2. **Red styling for disabled dates** - Dates marked as disabled (via `disabledDates` prop) now appear in red
3. **Red styling for disabled hours/minutes** - Time slots outside the min/max range appear in red
4. **Click prevention** - Users cannot select disabled time slots

## Usage

### Basic Example with Time Constraints

```jsx
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

function MyDateRangePicker() {
  const [state, setState] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection'
    }
  ]);

  return (
    <DateRange
      ranges={state}
      onChange={item => setState([item.selection])}
      showTimePicker={true}
      showHours={true}
      showMinutes={true}
      // Only allow times between 9:00 AM and 5:30 PM
      minTime={new Date(2024, 0, 1, 9, 0)}  // 9:00 AM
      maxTime={new Date(2024, 0, 1, 17, 30)} // 5:30 PM
    />
  );
}
```

### Using Number Format (Total Minutes)

You can also specify time as total minutes since midnight:

```jsx
<DateRange
  ranges={state}
  onChange={item => setState([item.selection])}
  showTimePicker={true}
  minTime={540}   // 9:00 AM (9 * 60 = 540 minutes)
  maxTime={1050}  // 5:30 PM (17 * 60 + 30 = 1050 minutes)
/>
```

### Combining with Disabled Dates

Disabled dates will now appear in red:

```jsx
const disabledDates = [
  new Date(2024, 0, 15),  // January 15, 2024
  new Date(2024, 0, 25),  // January 25, 2024
];

<DateRange
  ranges={state}
  onChange={item => setState([item.selection])}
  disabledDates={disabledDates}
  showTimePicker={true}
  minTime={new Date(2024, 0, 1, 8, 0)}
  maxTime={new Date(2024, 0, 1, 18, 0)}
/>
```

## Props

### DateRange Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `minTime` | `Date \| number` | `undefined` | Minimum allowed time. Can be a Date object or total minutes since midnight |
| `maxTime` | `Date \| number` | `undefined` | Maximum allowed time. Can be a Date object or total minutes since midnight |
| `showTimePicker` | `boolean` | `false` | Show/hide the time picker |
| `showHours` | `boolean` | `true` | Show/hide hour selection |
| `showMinutes` | `boolean` | `true` | Show/hide minute selection |

## Visual Feedback

### Disabled Dates (Calendar)
- Background: Light red (`rgba(220, 53, 69, 0.1)`)
- Text color: Red (`#dc3545`)
- Opacity: 0.7
- Not clickable

### Disabled Time Slots (Time Picker)
- Text color: Red (`#dc3545`)
- Background: Light red (`rgba(220, 53, 69, 0.05)`)
- Opacity: 0.6
- Cursor: `not-allowed`
- Not clickable

## Examples

### Business Hours (9 AM - 5 PM)

```jsx
<DateRange
  ranges={state}
  onChange={item => setState([item.selection])}
  showTimePicker={true}
  minTime={new Date(2024, 0, 1, 9, 0)}
  maxTime={new Date(2024, 0, 1, 17, 0)}
/>
```

### Late Night Hours (8 PM - 2 AM)

```jsx
<DateRange
  ranges={state}
  onChange={item => setState([item.selection])}
  showTimePicker={true}
  minTime={new Date(2024, 0, 1, 20, 0)}  // 8 PM
  maxTime={new Date(2024, 0, 2, 2, 0)}   // 2 AM next day
/>
```

### 30-Minute Intervals with Restrictions

```jsx
<DateRange
  ranges={state}
  onChange={item => setState([item.selection])}
  showTimePicker={true}
  showMinutes={true}
  minTime={new Date(2024, 0, 1, 10, 30)}  // 10:30 AM
  maxTime={new Date(2024, 0, 1, 15, 45)}  // 3:45 PM
/>
```

## Styling Customization

If you want to customize the red color for disabled items, you can override the CSS:

```css
/* Custom disabled date styling */
.rdrDayDisabled {
  background-color: rgba(255, 0, 0, 0.1) !important;
}

.rdrDayDisabled .rdrDayNumber span {
  color: #ff0000 !important;
}

/* Custom disabled time slot styling */
.rdrTimeWheelItemDisabled {
  color: #ff0000 !important;
  background: rgba(255, 0, 0, 0.05) !important;
}
```

## How It Works

1. **Date Validation**: The existing `disabledDates` prop continues to work as before, but now disabled dates are styled in red instead of gray.

2. **Time Validation**:
   - When `minTime` or `maxTime` is set, the TimePicker component calculates which hours and minutes should be disabled
   - Hours outside the range are disabled completely
   - Minutes are context-aware (e.g., if current hour is the min hour, only minutes before the min minute are disabled)

3. **Click Prevention**:
   - Disabled time slots cannot be clicked
   - The `handleTimeChange` method validates the time before allowing the change
   - Invalid times are silently rejected (no change occurs)

## Browser Support

This feature works in all modern browsers that support:
- CSS rgba colors
- CSS opacity
- ES6+ JavaScript features

## Notes

- The date/time validation is performed both in the UI (preventing clicks) and in the change handler (preventing programmatic changes)
- Time validation is inclusive (min and max times are selectable)
- When using Date objects for `minTime`/`maxTime`, only the hours and minutes are used; date portion is ignored
- The red styling uses Bootstrap's standard danger color (`#dc3545`) for consistency
