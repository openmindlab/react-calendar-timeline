import React from 'react'
import { getNextUnit } from '../utility/calendar'
import { composeEvents } from '../utility/events'
import { Unit } from '../Timeline';

type IntervalProps = {
  intervalRenderer: any,
  unit: Unit,
  interval: any,
  showPeriod: any,
  intervalText: string,
  primaryHeader: boolean,
  getIntervalProps: any,
  headerData: any
}

class Interval extends React.PureComponent<IntervalProps> {
  public props: any;
  public primaryHeader: any;
  public interval: any;
  public unit: any;
  public showPeriod: any;
  public intervalText: any;
  public intervalRenderer: any;
  public headerData: any;

  onIntervalClick = () => {
    const { primaryHeader, interval, unit, showPeriod } = this.props
    if (primaryHeader) {
      const nextUnit = getNextUnit(unit)
      const newStartTime = interval.startTime.clone().startOf(nextUnit)
      const newEndTime = interval.startTime.clone().endOf(nextUnit)
      showPeriod(newStartTime, newEndTime)
    } else {
      showPeriod(interval.startTime, interval.endTime)
    }
  }

  getIntervalProps = (props: any = {}) => {
    return {
      ...this.props.getIntervalProps({
        interval: this.props.interval,
        ...props
      }),
      onClick: composeEvents(this.onIntervalClick, props.onClick)
    }
  }

  render() {
    const { intervalText, interval, intervalRenderer, headerData } = this.props
    const Renderer = intervalRenderer
    if (Renderer) {
      return (
        <Renderer
          getIntervalProps={this.getIntervalProps}
          intervalContext={{
            interval,
            intervalText
          }}
          data={headerData}
        />
      )
    }

    return (
      <div
        data-testid="dateHeaderInterval"
        {...this.getIntervalProps({
        })}
        className={`rct-dateHeader ${this.props.primaryHeader ? 'rct-dateHeader-primary' : ''}`}
      >
        <span>{intervalText}</span>
      </div>
    )
  }
}

export default Interval
