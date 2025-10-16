import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Calendar from '../Calendar';
import TimePicker from '../TimePicker';
import { rangeShape } from '../DayCell';
import { findNextRangeIndex, generateStyles } from '../../utils';
import { isBefore, differenceInCalendarDays, addDays, min, isWithinInterval, max, setHours, setMinutes, getHours, getMinutes } from 'date-fns';
import classnames from 'classnames';
import coreStyles from '../../styles';

class DateRange extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      focusedRange: props.initialFocusedRange || [findNextRangeIndex(props.ranges), 0],
      preview: null,
    };
    this.styles = generateStyles([coreStyles, props.classNames]);
  }
  calcNewSelection = (value, isSingleValue = true) => {
    const focusedRange = this.props.focusedRange || this.state.focusedRange;
    const {
      ranges,
      onChange,
      maxDate,
      moveRangeOnFirstSelection,
      retainEndDateOnFirstSelection,
      disabledDates,
    } = this.props;
    const focusedRangeIndex = focusedRange[0];
    const selectedRange = ranges[focusedRangeIndex];
    if (!selectedRange || !onChange) return {};
    let { startDate, endDate } = selectedRange;
    const now = new Date();
    let nextFocusRange;
    if (!isSingleValue) {
      startDate = value.startDate;
      endDate = value.endDate;
    } else if (focusedRange[1] === 0) {
      // startDate selection
      const dayOffset = differenceInCalendarDays(endDate || now, startDate);
      const calculateEndDate = () => {
        if (moveRangeOnFirstSelection) {
          return addDays(value, dayOffset);
        }
        if (retainEndDateOnFirstSelection) {
          if (!endDate || isBefore(value, endDate)) {
            return endDate;
          }
          return value;
        }
        return value || now;
      };
      startDate = value;
      endDate = calculateEndDate();
      if (maxDate) endDate = min([endDate, maxDate]);
      nextFocusRange = [focusedRange[0], 1];
    } else {
      endDate = value;
    }

    // reverse dates if startDate before endDate
    let isStartDateSelected = focusedRange[1] === 0;
    if (isBefore(endDate, startDate)) {
      isStartDateSelected = !isStartDateSelected;
      [startDate, endDate] = [endDate, startDate];
    }

    const inValidDatesWithinRange = disabledDates.filter(disabledDate =>
      isWithinInterval(disabledDate, {
        start: startDate,
        end: endDate,
      })
    );

    if (inValidDatesWithinRange.length > 0) {
      if (isStartDateSelected) {
        startDate = addDays(max(inValidDatesWithinRange), 1);
      } else {
        endDate = addDays(min(inValidDatesWithinRange), -1);
      }
    }

    if (!nextFocusRange) {
      const nextFocusRangeIndex = findNextRangeIndex(this.props.ranges, focusedRange[0]);
      nextFocusRange = [nextFocusRangeIndex, 0];
    }
    return {
      wasValid: !(inValidDatesWithinRange.length > 0),
      range: { startDate, endDate },
      nextFocusRange: nextFocusRange,
    };
  };
  setSelection = (value, isSingleValue) => {
    const { onChange, ranges, onRangeFocusChange } = this.props;
    const focusedRange = this.props.focusedRange || this.state.focusedRange;
    const focusedRangeIndex = focusedRange[0];
    const selectedRange = ranges[focusedRangeIndex];
    if (!selectedRange) return;
    const newSelection = this.calcNewSelection(value, isSingleValue);

    // Preserve time from existing dates when changing date
    let { startDate, endDate } = newSelection.range;
    if (selectedRange.startDate && startDate) {
      const hours = getHours(selectedRange.startDate);
      const minutes = getMinutes(selectedRange.startDate);
      startDate = setMinutes(setHours(startDate, hours), minutes);
    }
    if (selectedRange.endDate && endDate) {
      const hours = getHours(selectedRange.endDate);
      const minutes = getMinutes(selectedRange.endDate);
      endDate = setMinutes(setHours(endDate, hours), minutes);
    }

    onChange({
      [selectedRange.key || `range${focusedRangeIndex + 1}`]: {
        ...selectedRange,
        startDate,
        endDate,
      },
    });
    this.setState({
      focusedRange: newSelection.nextFocusRange,
      preview: null,
    });
    onRangeFocusChange && onRangeFocusChange(newSelection.nextFocusRange);
  };
  handleRangeFocusChange = focusedRange => {
    this.setState({ focusedRange });
    this.props.onRangeFocusChange && this.props.onRangeFocusChange(focusedRange);
  };
  updatePreview = val => {
    if (!val) {
      this.setState({ preview: null });
      return;
    }
    const { rangeColors, ranges } = this.props;
    const focusedRange = this.props.focusedRange || this.state.focusedRange;
    const color = ranges[focusedRange[0]]?.color || rangeColors[focusedRange[0]] || color;
    this.setState({ preview: { ...val.range, color } });
  };
  handleTimeChange = (date, isStart) => {
    const { onChange, ranges, minTime, maxTime } = this.props;
    const focusedRange = this.props.focusedRange || this.state.focusedRange;
    const focusedRangeIndex = focusedRange[0];
    const selectedRange = ranges[focusedRangeIndex];
    if (!selectedRange) return;

    // Validate time is within min/max absolute datetime bounds
    if (minTime && typeof minTime === 'object' && date < minTime) {
      return; // Date is before minimum allowed datetime
    }

    if (maxTime && typeof maxTime === 'object' && date > maxTime) {
      return; // Date is after maximum allowed datetime
    }

    const key = selectedRange.key || `range${focusedRangeIndex + 1}`;
    onChange({
      [key]: {
        ...selectedRange,
        [isStart ? 'startDate' : 'endDate']: date,
      },
    });
  };

  render() {
    const {
      showTimePicker,
      showHours,
      showMinutes,
      ranges,
      minTime,
      maxTime,
      locale,
      ...calendarProps
    } = this.props;
    const focusedRange = this.props.focusedRange || this.state.focusedRange;
    const focusedRangeIndex = focusedRange[0];
    const selectedRange = ranges[focusedRangeIndex];
    const effectiveLocale = locale || Calendar.defaultProps.locale;

    return (
      <div className={this.styles.dateRangeWrapper}>
        <Calendar
          focusedRange={this.state.focusedRange}
          onRangeFocusChange={this.handleRangeFocusChange}
          preview={this.state.preview}
          onPreviewChange={value => {
            this.updatePreview(value ? this.calcNewSelection(value) : null);
          }}
          {...calendarProps}
          ranges={ranges}
          locale={effectiveLocale}
          displayMode="dateRange"
          className={classnames(this.props.className)}
          onChange={this.setSelection}
          updateRange={val => this.setSelection(val, false)}
          ref={target => {
            this.calendar = target;
          }}
        />
        {showTimePicker && selectedRange && (
          <div className={this.styles.timePickerContainer}>
            <div className={this.styles.timePickerSection}>
              <span className={this.styles.timePickerLabel}>Start Time</span>
              <TimePicker
                date={selectedRange.startDate}
                onChange={date => this.handleTimeChange(date, true)}
                showHours={showHours}
                showMinutes={showMinutes}
                disabled={selectedRange.disabled}
                minTime={minTime}
                maxTime={maxTime}
                styles={this.styles}
                ariaLabels={this.props.ariaLabels}
              />
            </div>
            <div className={this.styles.timePickerSection}>
              <span className={this.styles.timePickerLabel}>End Time</span>
              <TimePicker
                date={selectedRange.endDate}
                onChange={date => this.handleTimeChange(date, false)}
                showHours={showHours}
                showMinutes={showMinutes}
                disabled={selectedRange.disabled}
                minTime={minTime}
                maxTime={maxTime}
                styles={this.styles}
                ariaLabels={this.props.ariaLabels}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}

DateRange.defaultProps = {
  classNames: {},
  ranges: [],
  moveRangeOnFirstSelection: false,
  retainEndDateOnFirstSelection: false,
  rangeColors: ['#3d91ff', '#3ecf8e', '#fed14c'],
  disabledDates: [],
  showTimePicker: false,
  showHours: true,
  showMinutes: true,
  locale: Calendar.defaultProps.locale,
};

DateRange.propTypes = {
  ...Calendar.propTypes,
  onChange: PropTypes.func,
  onRangeFocusChange: PropTypes.func,
  className: PropTypes.string,
  ranges: PropTypes.arrayOf(rangeShape),
  moveRangeOnFirstSelection: PropTypes.bool,
  retainEndDateOnFirstSelection: PropTypes.bool,
  showTimePicker: PropTypes.bool,
  showHours: PropTypes.bool,
  showMinutes: PropTypes.bool,
  minTime: PropTypes.object, // Date object representing absolute minimum datetime
  maxTime: PropTypes.object, // Date object representing absolute maximum datetime
};

export default DateRange;
