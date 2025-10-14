import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { setHours, setMinutes, getHours, getMinutes } from 'date-fns';

class TimeWheel extends Component {
  handleClick = (value) => {
    this.props.onChange(value);
  };

  render() {
    const { value, max, disabled, styles } = this.props;
    const items = Array.from({ length: max }, (_, i) => i);

    return (
      <div className={classnames(styles.timeWheel, { [styles.timeWheelDisabled]: disabled })}>
        <div className={styles.timeWheelScroller}>
          {items.map((item) => (
            <div
              key={item}
              onClick={disabled ? undefined : () => this.handleClick(item)}
              className={classnames(styles.timeWheelItem, {
                [styles.timeWheelItemActive]: item === value,
              })}>
              {String(item).padStart(2, '0')}
            </div>
          ))}
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
  styles: PropTypes.object,
  ariaLabels: PropTypes.object,
};

export default TimePicker;
