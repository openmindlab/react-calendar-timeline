import React from 'react'
import { TimelineHeadersConsumer } from './HeadersContext'
import { TimelineStateConsumer } from '../timeline/TimelineStateContext'
import { iterateTimes, calculateXPositionForTime } from '../utility/calendar'
import { Unit, CustomHeaderPropsChildrenFnProps } from '../Timeline'


export interface CustomHeaderProps<Data> {
  unit?: Unit;
  headerData?: Data;
  height?: number;
  children: (props?: CustomHeaderPropsChildrenFnProps<Data>) => React.ReactNode;
}

export class CustomHeader<Data = any> extends React.Component<CustomHeaderProps<Data>> {
  public state: any;
  public props: any;
  public setState: any;
  public canvasTimeStart: any;
  public canvasTimeEnd: any;
  public canvasWidth: any;
  public unit: any;
  public timeSteps: any;
  public showPeriod: any;
  public getLeftOffsetFromDate: any;
  public style: any;
  public interval: any;
  public startTime: any;
  public labelWidth: any;
  public left: any;
  public timelineWidth: any;
  public visibleTimeStart: any;
  public visibleTimeEnd: any;
  public headerData: any;

  constructor(props) {
    super(props)
    const {
      canvasTimeStart,
      canvasTimeEnd,
      canvasWidth,
      unit,
      timeSteps,
      showPeriod,
      getLeftOffsetFromDate
    } = props

    const intervals = this.getHeaderIntervals({
      canvasTimeStart,
      canvasTimeEnd,
      canvasWidth,
      unit,
      timeSteps,
      showPeriod,
      getLeftOffsetFromDate
    })

    this.state = {
      intervals
    }
  }

  shouldComponentUpdate(nextProps) {
    if (
      nextProps.canvasTimeStart !== this.props.canvasTimeStart ||
      nextProps.canvasTimeEnd !== this.props.canvasTimeEnd ||
      nextProps.canvasWidth !== this.props.canvasWidth ||
      nextProps.unit !== this.props.unit ||
      nextProps.timeSteps !== this.props.timeSteps ||
      nextProps.showPeriod !== this.props.showPeriod ||
      nextProps.children !== this.props.children ||
      nextProps.headerData !== this.props.headerData
    ) {
      return true
    }
    return false
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.canvasTimeStart !== this.props.canvasTimeStart ||
      nextProps.canvasTimeEnd !== this.props.canvasTimeEnd ||
      nextProps.canvasWidth !== this.props.canvasWidth ||
      nextProps.unit !== this.props.unit ||
      nextProps.timeSteps !== this.props.timeSteps ||
      nextProps.showPeriod !== this.props.showPeriod
    ) {
      const {
        canvasTimeStart,
        canvasTimeEnd,
        canvasWidth,
        unit,
        timeSteps,
        showPeriod,
        getLeftOffsetFromDate
      } = nextProps

      const intervals = this.getHeaderIntervals({
        canvasTimeStart,
        canvasTimeEnd,
        canvasWidth,
        unit,
        timeSteps,
        showPeriod,
        getLeftOffsetFromDate
      })

      this.setState({ intervals })
    }
  }

  getHeaderIntervals = ({
    canvasTimeStart,
    canvasTimeEnd,
    canvasWidth,
    unit,
    timeSteps,
    showPeriod,
    getLeftOffsetFromDate
  }) => {
    const intervals = []
    iterateTimes(
      canvasTimeStart,
      canvasTimeEnd,
      unit,
      timeSteps,
      (startTime, endTime) => {
        const left = getLeftOffsetFromDate(startTime.valueOf())
        const right = getLeftOffsetFromDate(endTime.valueOf())
        const width = right - left
        intervals.push({
          startTime,
          endTime,
          labelWidth: width,
          left
        })
      }
    )
    return intervals
  }

  getRootProps = (props: any = {}) => {
    const { style } = props
    return {
      style: Object.assign({}, style ? style : {}, {
        position: 'relative',
        width: this.props.canvasWidth,
        height: this.props.height,
      })
    }
  }

  getIntervalProps = (props: any = {}) => {
    const { interval, style } = props
    if (!interval)
      throw new Error('you should provide interval to the prop getter')
    const { startTime, labelWidth, left } = interval
    return {
      style: this.getIntervalStyle({
        style,
        startTime,
        labelWidth,
        canvasTimeStart: this.props.canvasTimeStart,
        unit: this.props.unit,
        left
      }),
      key: `label-${startTime.valueOf()}`
    }
  }

  getIntervalStyle = ({ left, labelWidth, style }: any) => {
    return {
      ...style,
      left,
      width: labelWidth,
      position: 'absolute'
    }
  }

  getStateAndHelpers = () => {
    const {
      canvasTimeStart,
      canvasTimeEnd,
      unit,
      showPeriod,
      timelineWidth,
      visibleTimeStart,
      visibleTimeEnd,
      headerData,
    } = this.props
    //TODO: only evaluate on changing params
    return {
      timelineContext: {
        timelineWidth,
        visibleTimeStart,
        visibleTimeEnd,
        canvasTimeStart,
        canvasTimeEnd
      },
      headerContext: {
        unit,
        intervals: this.state.intervals
      },
      getRootProps: this.getRootProps,
      getIntervalProps: this.getIntervalProps,
      showPeriod,
      data: headerData,
    }
  }

  render() {
    const props = this.getStateAndHelpers()
    const Renderer = this.props.children
    return <Renderer {...props} />
  }
}

const CustomHeaderWrapper = ({ children, unit, headerData, height }: any) => (
  <TimelineStateConsumer>
    {({ getTimelineState, showPeriod, getLeftOffsetFromDate }) => {
      const timelineState: any = getTimelineState()
      return (
        <TimelineHeadersConsumer>
          {({ timeSteps }) => (
            <CustomHeader
              children={children}
              timeSteps={timeSteps}
              showPeriod={showPeriod}
              unit={unit ? unit : timelineState.timelineUnit}
              {...timelineState}
              headerData={headerData}
              getLeftOffsetFromDate={getLeftOffsetFromDate}
              height={height}
            />
          )}
        </TimelineHeadersConsumer>
      )
    }}
  </TimelineStateConsumer>
)

CustomHeaderWrapper.defaultProps = {
  height: 30,
}

export default CustomHeaderWrapper
