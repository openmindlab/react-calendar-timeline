import React from 'react'
import { TimelineStateConsumer } from '../timeline/TimelineStateContext'
import CustomHeader from './CustomHeader'
import { getNextUnit } from '../utility/calendar'
import { defaultHeaderFormats } from '../default-config'
import memoize from 'memoize-one'
import { CustomDateHeader } from './CustomDateHeader'
import { Moment } from 'moment'
import { Unit, IntervalRenderer } from '../Timeline'
import { SidebarHeaderChildrenFnProps } from './SidebarHeader'

export interface DateHeaderProps<Data> {
  style?: React.CSSProperties;
  className?: string;
  unit?: Unit | 'primaryHeader';
  labelFormat?: string | (([startTime, endTime]: [Moment, Moment], unit: Unit, labelWidth: number) => string);
  intervalRenderer?: (props?: IntervalRenderer<Data>) => React.ReactNode;
  headerData?: Data;
  children?: (props: SidebarHeaderChildrenFnProps<Data>) => React.ReactNode;
  height?: number;
}

class DateHeader<Data = any> extends React.Component<DateHeaderProps<Data>>{
	public props: any;
	public labelFormat: any;
	public headerData: any;
	public height: any;

  getHeaderUnit = () => {
    if (this.props.unit === 'primaryHeader') {
      return getNextUnit(this.props.timelineUnit)
    } else if (this.props.unit) {
      return this.props.unit
    }
    return this.props.timelineUnit
  }

  getRootStyle = memoize(style => {
    return {
      height: 30,
      ...style
    }
  })

  getLabelFormat = (interval, unit, labelWidth) => {
    const { labelFormat } = this.props
    if (typeof labelFormat === 'string') {
      const startTime = interval[0]
      return startTime.format(labelFormat)
    } else if (typeof labelFormat === 'function') {
      return labelFormat(interval, unit, labelWidth)
    } else {
      throw new Error('labelFormat should be function or string')
    }
  }

  getHeaderData = memoize(
    (
      intervalRenderer,
      style,
      className,
      getLabelFormat,
      unitProp,
      headerData
    ) => {
      return {
        intervalRenderer,
        style,
        className,
        getLabelFormat,
        unitProp,
        headerData
      }
    }
  )

  render() {
    const unit = this.getHeaderUnit()
    const { headerData, height } = this.props
    return (
      <CustomHeader
        unit={unit}
        height={height}
        headerData={this.getHeaderData(
          this.props.intervalRenderer,
          this.getRootStyle(this.props.style),
          this.props.className,
          this.getLabelFormat,
          this.props.unit,
          this.props.headerData
        )}
        children={CustomDateHeader}
      />
    )
  }
}

const DateHeaderWrapper = ({
  unit,
  labelFormat,
  style,
  className,
  intervalRenderer,
  headerData,
  height
} : any) => (
  <TimelineStateConsumer>
    {({ getTimelineState }) => {
      const timelineState : any = getTimelineState()
      return (
        <DateHeader
          timelineUnit={timelineState.timelineUnit}
          unit={unit}
          labelFormat={labelFormat}
          style={style}
          className={className}
          intervalRenderer={intervalRenderer}
          headerData={headerData}
          height={height}
        />
      )
    }}
  </TimelineStateConsumer>
)

DateHeaderWrapper.defaultProps = {
  labelFormat: formatLabel
}

function formatLabel(
  [timeStart, timeEnd],
  unit,
  labelWidth,
  formatOptions = defaultHeaderFormats
) {
  let format
  if (labelWidth >= 150) {
    format = formatOptions[unit]['long']
  } else if (labelWidth >= 100) {
    format = formatOptions[unit]['mediumLong']
  } else if (labelWidth >= 50) {
    format = formatOptions[unit]['medium']
  } else {
    format = formatOptions[unit]['short']
  }
  return timeStart.format(format)
}

export default DateHeaderWrapper
