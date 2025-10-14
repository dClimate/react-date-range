import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { setHours, setMinutes, getHours, getMinutes, startOfDay } from 'date-fns';

class TimeWheel extends Component {
  handleClick = (value) => {
    const { isDisabled } = this.props;
    if (!isDisabled || !isDisabled(value)) {
      this.props.onChange(value);
    }
  };

  render() {
    const { value, max, disabled, styles, isDisabled } = this.props;
    const items = Array.from({ length: max }, (_, i) => i);

    return (
      <div className={classnames(styles.timeWheel, { [styles.timeWheelDisabled]: disabled })}>
        <div className={styles.timeWheelScroller}>
          {items.map((item) => {
            const itemDisabled = isDisabled && isDisabled(item);
            return (
              <div
                key={item}
                onClick={disabled || itemDisabled ? undefined : () => this.handleClick(item)}
                className={classnames(styles.timeWheelItem, {
                  [styles.timeWheelItemActive]: item === value,
                  [styles.timeWheelItemDisabled]: itemDisabled,
                })}
                style={itemDisabled ? { color: '#dc3545', opacity: 0.6, cursor: 'not-allowed' } : undefined}>
                {String(item).padStart(2, '0')}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

class TimePicker extends Component {
  handleHourChange = (hour) => {
    const { date, onChange } = this.props;
    const newDate = setHours(date || new Date(), hour);
    onChange && onChange(newDate);
  };

  handleMinuteChange = (minute) => {
    const { date, onChange } = this.props;
    const newDate = setMinutes(date || new Date(), minute);
    onChange && onChange(newDate);
  };

  isHourDisabled = (hour) => {
    const { minTime, maxTime, date } = this.props;
    if (!minTime && !maxTime) return false;
    if (!date) return false;

    // Create a test datetime with the current date and the hour being tested
    const testDateTime = setHours(setMinutes(startOfDay(date), 0), hour);

    // Check if this datetime is before the minimum allowed datetime
    if (minTime) {
      const minDateTime = typeof minTime === 'object' ? minTime : new Date(new Date().setHours(Math.floor(minTime / 60), minTime % 60, 0, 0));
      if (testDateTime < minDateTime) {
        return true;
      }
    }

    // Check if this datetime is after the maximum allowed datetime
    if (maxTime) {
      const maxDateTime = typeof maxTime === 'object' ? maxTime : new Date(new Date().setHours(Math.floor(maxTime / 60), maxTime % 60, 0, 0));
      if (testDateTime > maxDateTime) {
        return true;
      }
    }

    return false;
  };

  isMinuteDisabled = (minute) => {
    const { minTime, maxTime, date } = this.props;
    if (!minTime && !maxTime) return false;
    if (!date) return false;

    const currentHour = getHours(date);

    // Create a test datetime with the current date, hour, and the minute being tested
    const testDateTime = setMinutes(setHours(startOfDay(date), currentHour), minute);

    // Check if this datetime is before the minimum allowed datetime
    if (minTime) {
      const minDateTime = typeof minTime === 'object' ? minTime : new Date(new Date().setHours(Math.floor(minTime / 60), minTime % 60, 0, 0));
      if (testDateTime < minDateTime) {
        return true;
      }
    }

    // Check if this datetime is after the maximum allowed datetime
    if (maxTime) {
      const maxDateTime = typeof maxTime === 'object' ? maxTime : new Date(new Date().setHours(Math.floor(maxTime / 60), maxTime % 60, 0, 0));
      if (testDateTime > maxDateTime) {
        return true;
      }
    }

    return false;
  };

  render() {
    const { date, showHours, showMinutes, disabled, styles } = this.props;
    const currentDate = date || new Date();
    const hours = getHours(currentDate);
    const minutes = getMinutes(currentDate);

    if (!showHours && !showMinutes) {
      return null;
    }

    return (
      <div className={classnames(styles.timePickerWrapper)}>
        {showHours && (
          <div className={styles.timePicker}>
            <div className={styles.timePickerLabel}>Hour</div>
            <TimeWheel
              value={hours}
              max={24}
              onChange={this.handleHourChange}
              disabled={disabled}
              isDisabled={this.isHourDisabled}
              styles={styles}
            />
          </div>
        )}
        {showHours && showMinutes && (
          <div className={styles.timePickerDivider}>:</div>
        )}
        {showMinutes && (
          <div className={styles.timePicker}>
            <div className={styles.timePickerLabel}>Minute</div>
            <TimeWheel
              value={minutes}
              max={60}
              onChange={this.handleMinuteChange}
              disabled={disabled}
              isDisabled={this.isMinuteDisabled}
              styles={styles}
            />
          </div>
        )}
      </div>
    );
  }
}

TimePicker.defaultProps = {
  showHours: true,
  showMinutes: true,
  disabled: false,
};

TimePicker.propTypes = {
  date: PropTypes.object,
  onChange: PropTypes.func,
  showHours: PropTypes.bool,
  showMinutes: PropTypes.bool,
  disabled: PropTypes.bool,
  minTime: PropTypes.object,
  maxTime: PropTypes.object,
  styles: PropTypes.object,
  ariaLabels: PropTypes.object,
};

export default TimePicker;
