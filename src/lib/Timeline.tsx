import { Moment } from 'moment'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import windowResizeDetector from '../resize-detector/window'
import Columns from './columns/Columns'
import { defaultHeaderLabelFormats, defaultKeys, defaultSubHeaderLabelFormats, defaultTimeSteps } from './default-config'
import DateHeader from './headers/DateHeader'
import { TimelineHeadersProvider } from './headers/HeadersContext'
import TimelineHeaders from './headers/TimelineHeaders'
import Items from './items/Items'
import Sidebar from './layout/Sidebar'
import MarkerCanvas from './markers/MarkerCanvas'
import { TimelineMarkersProvider } from './markers/TimelineMarkersContext'
import GroupRows from './row/GroupRows'
import ScrollElement from './scroll/ScrollElement'
import './Timeline.scss'
import { TimelineStateProvider } from './timeline/TimelineStateContext'
import { calculateScrollCanvas, calculateTimeForXPosition, getCanvasBoundariesFromVisibleTime, getCanvasWidth, getMinUnit, stackTimelineItems } from './utility/calendar'
import { _get, _length } from './utility/generic'

export type Unit = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';

export interface Interval {
  startTime: Moment;
  endTime: Moment;
}

export interface TimelineGroupBase {
  id: number | string;
  title: React.ReactNode;
  rightTitle?: React.ReactNode;
}

export interface TimelineItemBase<DateType> {
  id: number | string;
  group: number | string;
  title?: React.ReactNode;
  start_time: DateType;
  end_time: DateType;
  canMove?: boolean;
  canResize?: boolean | 'left' | 'right' | 'both';
  canChangeGroup?: boolean;
  className?: string;
  style?: React.CSSProperties;
  itemProps?: React.HTMLAttributes<HTMLDivElement>;
}

export type TimelineItem<CustomItemFields, DateType = number> = TimelineItemBase<DateType> & CustomItemFields;
export type TimelineGroup<CustomGroupFields> = TimelineGroupBase & CustomGroupFields;

export interface TimelineContext {
  timelineWidth: number;
  visibleTimeStart: number;
  visibleTimeEnd: number;
  canvasTimeStart: number;
  canvasTimeEnd: number;
}

export interface ItemContext {
  dimensions: {
    collisionLeft: number;
    collisionWidth: number;
    height: number;
    isDragging: boolean;
    left: number;
    order: {
      group: {
        id: string;
      };
      index: number;
    };
    originalLeft: number;
    stack: boolean;
    top: number | null;
    width: number;
  };
  useResizeHandle: boolean;
  title: string;
  canMove: boolean;
  canResizeLeft: boolean;
  canResizeRight: boolean;
  selected: boolean;
  dragging: boolean;
  dragStart: {
    x: number;
    y: number;
  };
  dragTime: number;
  dragGroupDelta: number;
  resizing: boolean;
  resizeEdge: 'left' | 'right';
  resizeStart: number;
  resizeTime: number;
  width: boolean;
}

export interface TimeFormat {
  long: string;
  mediumLong: string;
  medium: string;
  short: string;
}

export interface LabelFormat {
  year: TimeFormat;
  month: TimeFormat;
  week: TimeFormat;
  day: TimeFormat;
  hour: TimeFormat;
  minute: TimeFormat;
}

export interface ItemRendererGetItemPropsReturnType {
  key: number | string;
  ref: React.Ref<any>;
  className: string;
  onMouseDown: React.MouseEventHandler;
  onMouseUp: React.MouseEventHandler;
  onTouchStart: React.TouchEventHandler;
  onTouchEnd: React.TouchEventHandler;
  onDoubleClick: React.MouseEventHandler;
  onContextMenu: React.ReactEventHandler;
  style: React.CSSProperties;
}

export type GetItemsProps = Partial<Omit<ItemRendererGetItemPropsReturnType, 'key' | 'ref'>>;

export interface ItemRendererGetResizePropsReturnType {
  left?: {
    ref: React.Ref<any>;
    className: string;
    style: React.CSSProperties;
  };
  right?: {
    ref: React.Ref<any>;
    className: string;
    style: React.CSSProperties;
  };
}

export type GetResizeProps = {
  leftStyle?: React.CSSProperties;
  rightStyle?: React.CSSProperties;
  leftClassName?: string;
  rightClassName?: string;
};

export interface ReactCalendarItemRendererProps<
  CustomItem extends TimelineItemBase<any> = TimelineItemBase<number>
  > {
  item: CustomItem;
  itemContext: ItemContext;
  getItemProps: (
    props: GetItemsProps,
  ) => {
    key: number | string;
    ref: React.Ref<any>;
    className: string;
    onMouseDown: React.MouseEventHandler;
    onMouseUp: React.MouseEventHandler;
    onTouchStart: React.TouchEventHandler;
    onTouchEnd: React.TouchEventHandler;
    onDoubleClick: React.MouseEventHandler;
    onContextMenu: React.ReactEventHandler;
    style: React.CSSProperties;
  };
  getResizeProps: (propsOverride?: GetResizeProps) => ItemRendererGetResizePropsReturnType;
}

export interface ReactCalendarGroupRendererProps<CustomGroup extends TimelineGroupBase = TimelineGroupBase> {
  group: CustomGroup;
  isRightSidebar?: boolean;
}

export interface OnItemDragObjectBase {
  eventType: 'move' | 'resize';
  itemId: number | string;
  time: number;
}

export interface OnItemDragObjectMove extends OnItemDragObjectBase {
  eventType: 'move';
  newGroupOrder: number;
}

export interface OnItemDragObjectResize extends OnItemDragObjectBase {
  eventType: 'resize';
  edge?: 'left' | 'right';
}

export interface TimelineKeys {
  groupIdKey: string;
  groupTitleKey: string;
  groupRightTitleKey: string;
  itemIdKey: string;
  itemTitleKey: string;
  itemDivTitleKey: string;
  itemGroupKey: string;
  itemTimeStartKey: string;
  itemTimeEndKey: string;
}


export interface TimelineTimeSteps {
  second: number;
  minute: number;
  hour: number;
  day: number;
  month: number;
  year: number;
}


export interface IntervalContext {
  interval: { startTime: number; endTime: number; labelWidth: number; left: number };
  intervalText: string;
}

export interface GetIntervalProps {
  interval?: Interval;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler;
}

export interface IntervalRenderer<Data> {
  intervalContext: IntervalContext;
  getIntervalProps: (props?: GetIntervalProps) => Required<GetIntervalProps> & { key: string | number };
  data?: Data;
}


export interface HeaderContext {
  intervals: { startTime: Moment; endTime: Moment }[];
  unit: string;
}
export interface CustomHeaderPropsChildrenFnProps<Data> {
  timelineContext: TimelineContext;
  headerContext: HeaderContext;
  getIntervalProps: (props?: GetIntervalProps) => Required<GetIntervalProps> & { key: string | number };
  getRootProps: (propsToOverride?: { style: React.CSSProperties }) => { style: React.CSSProperties };
  showPeriod: (startDate: Moment | number, endDate: Moment | number) => void;
  data: Data;
}

export type ReactCalendarTimelineProps<
  CustomItem extends TimelineItemBase<any> = TimelineItemBase<number>,
  CustomGroup extends TimelineGroupBase = TimelineGroupBase> = {
    groups: CustomGroup[];
    items: CustomItem[];
    keys?: TimelineKeys;
    defaultTimeStart?: Date | Moment;
    defaultTimeEnd?: Date | Moment;
    visibleTimeStart?: Date | Moment | number;
    visibleTimeEnd?: Date | Moment | number;
    selected?: number[];
    sidebarWidth?: number;
    sidebarContent?: React.ReactNode;
    rightSidebarWidth?: number;
    rightSidebarContent?: React.ReactNode;
    dragSnap?: number;
    minResizeWidth?: number;
    lineHeight?: number;
    itemHeightRatio?: number;
    minZoom?: number;
    maxZoom?: number;
    clickTolerance?: number;
    canMove?: boolean;
    canChangeGroup?: boolean;
    canResize?: false | true | 'left' | 'right' | 'both';
    useResizeHandle?: boolean;
    stackItems?: boolean;
    stickyHeader?: boolean;
    traditionalZoom?: boolean;
    itemTouchSendsClick?: boolean;
    timeSteps?: TimelineTimeSteps;
    scrollRef?: React.Ref<any>;
    onItemDrag?(itemDragObject: OnItemDragObjectMove | OnItemDragObjectResize): void;
    onItemMove?(itemId: number | string, dragTime: number, newGroupOrder: number): void;
    onItemResize?(itemId: number | string, endTimeOrStartTime: number, edge: 'left' | 'right'): void;
    onItemSelect?(itemId: number | string, e: any, time: number): void;
    onItemDeselect?(e: React.SyntheticEvent): void;
    onItemClick?(itemId: number | string, e: React.SyntheticEvent, time: number): void;
    onItemDoubleClick?(itemId: number | string, e: React.SyntheticEvent, time: number): void;
    onItemContextMenu?(itemId: number | string, e: React.SyntheticEvent, time: number): void;
    onCanvasClick?(groupId: number | string, time: number, e: React.SyntheticEvent): void;
    onCanvasDoubleClick?(groupId: number | string, time: number, e: React.SyntheticEvent): void;
    onCanvasContextMenu?(groupId: number | string, time: number, e: React.SyntheticEvent): void;
    onZoom?(timelineContext: TimelineContext): void;
    moveResizeValidator?(
      action: 'move' | 'resize',
      itemId: number | string,
      time: number,
      resizeEdge: 'left' | 'right',
    ): number;
    onTimeChange?(
      visibleTimeStart: number,
      visibleTimeEnd: number,
      updateScrollCanvas: (start: number, end: number) => void,
    ): any;
    onBoundsChange?(canvasTimeStart: number, canvasTimeEnd: number): any;
    itemRenderer?: (props: ReactCalendarItemRendererProps<CustomItem>) => React.ReactNode;
    groupRenderer?: (props: ReactCalendarGroupRendererProps<CustomGroup>) => React.ReactNode;
    resizeDetector?: (containerResizeDetector: any) => void;
    verticalLineClassNamesForTime?: (start: number, end: number) => string[] | undefined;
    horizontalLineClassNamesForGroup?: (group: CustomGroup) => string[];

    headerLabelFormats: {
      yearShort: string,
      yearLong: string,
      monthShort: string,
      monthMedium: string,
      monthMediumLong: string,
      monthLong: string,
      dayShort: string,
      dayLong: string,
      hourShort: string,
      hourMedium: string,
      hourMediumLong: string,
      hourLong: string
    };

    subHeaderLabelFormats: {
      yearShort: string,
      yearLong: string,
      monthShort: string,
      monthMedium: string,
      monthLong: string,
      dayShort: string,
      dayMedium: string,
      dayMediumLong: string,
      dayLong: string,
      hourShort: string,
      hourLong: string,
      minuteShort: string,
      minuteLong: string
    };
    // Fields that are in propTypes but not documented
    headerRef?: React.Ref<any>;
  }

export default class ReactCalendarTimeline<
  CustomItem extends TimelineItemBase<any> = TimelineItemBase<number>,
  CustomGroup extends TimelineGroupBase = TimelineGroupBase
  > extends Component<ReactCalendarTimelineProps<CustomItem, CustomGroup>>  {
  public state: any;
  public props: any;
  public lastTouchDistance: any;
  public scrollComponent: any;
  public scrollHeaderRef: any;
  public container: any;
  public setState: any;
  public width: any;
  public visibleTimeStart: any;
  public visibleTimeEnd: any;
  public canvasTimeStart: any;
  public canvasTimeEnd: any;
  public dimensionItems: any;
  public height: any;
  public groupHeights: any;
  public groupTops: any;
  public groups: any;
  public containerWidth: any;
  public minZoom: any;
  public maxZoom: any;
  public dragSnap: any;
  public offsetX: any;
  public scrollX: any;
  public sidebarWidth: any;
  public rightSidebarWidth: any;
  public timeSteps: any;
  public traditionalZoom: any;
  public draggingItem: any;


  static defaultProps: ReactCalendarTimelineProps = {
    groups: [],
    items: [],
    sidebarWidth: 150,
    rightSidebarWidth: 0,
    dragSnap: 1000 * 60 * 15, // 15min
    minResizeWidth: 20,
    stickyHeader: true,
    lineHeight: 30,
    itemHeightRatio: 0.65,

    minZoom: 60 * 60 * 1000, // 1 hour
    maxZoom: 5 * 365.24 * 86400 * 1000, // 5 years

    clickTolerance: 3, // how many pixels can we drag for it to be still considered a click?

    canChangeGroup: true,
    canMove: true,
    canResize: 'right',
    useResizeHandle: false,
    // canSelect: true,

    stackItems: false,

    traditionalZoom: false,

    horizontalLineClassNamesForGroup: null,

    onItemMove: null,
    onItemResize: null,
    onItemClick: null,
    onItemSelect: null,
    onItemDeselect: null,
    onItemDrag: null,
    onCanvasClick: null,
    onItemDoubleClick: null,
    onItemContextMenu: null,
    onZoom: null,

    verticalLineClassNamesForTime: null,

    moveResizeValidator: null,

    //dayBackground: null,

    defaultTimeStart: null,
    defaultTimeEnd: null,

    itemTouchSendsClick: false,

    // style: {},
    // className: '',
    keys: defaultKeys,
    timeSteps: defaultTimeSteps,
    headerRef: () => { },
    scrollRef: () => { },

    // if you pass in visibleTimeStart and visibleTimeEnd, you must also pass onTimeChange(visibleTimeStart, visibleTimeEnd),
    // which needs to update the props visibleTimeStart and visibleTimeEnd to the ones passed
    visibleTimeStart: null,
    visibleTimeEnd: null,
    onTimeChange: function (
      visibleTimeStart,
      visibleTimeEnd,
      updateScrollCanvas
    ) {
      updateScrollCanvas(visibleTimeStart, visibleTimeEnd)
    },
    // called when the canvas area of the calendar changes
    onBoundsChange: null,
    // children: null,

    headerLabelFormats: defaultHeaderLabelFormats,
    subHeaderLabelFormats: defaultSubHeaderLabelFormats,

    selected: null
  }

  static childContextTypes = {
    getTimelineContext: PropTypes.func
  }

  getChildContext() {
    return {
      getTimelineContext: () => {
        return this.getTimelineContext()
      }
    }
  }

  getTimelineContext = () => {
    const {
      width,
      visibleTimeStart,
      visibleTimeEnd,
      canvasTimeStart,
      canvasTimeEnd
    } = this.state

    return {
      timelineWidth: width,
      visibleTimeStart,
      visibleTimeEnd,
      canvasTimeStart,
      canvasTimeEnd
    }
  }

  constructor(props: ReactCalendarTimelineProps<CustomItem, CustomGroup>) {
    super(props)

    this.getSelected = this.getSelected.bind(this)
    this.hasSelectedItem = this.hasSelectedItem.bind(this)
    this.isItemSelected = this.isItemSelected.bind(this)

    let visibleTimeStart = null
    let visibleTimeEnd = null

    if (this.props.defaultTimeStart && this.props.defaultTimeEnd) {
      visibleTimeStart = this.props.defaultTimeStart.valueOf()
      visibleTimeEnd = this.props.defaultTimeEnd.valueOf()
    } else if (this.props.visibleTimeStart && this.props.visibleTimeEnd) {
      visibleTimeStart = this.props.visibleTimeStart
      visibleTimeEnd = this.props.visibleTimeEnd
    } else {
      //throwing an error because neither default or visible time props provided
      throw new Error(
        'You must provide either "defaultTimeStart" and "defaultTimeEnd" or "visibleTimeStart" and "visibleTimeEnd" to initialize the Timeline'
      )
    }

    const [canvasTimeStart, canvasTimeEnd] = getCanvasBoundariesFromVisibleTime(
      visibleTimeStart,
      visibleTimeEnd
    )

    this.state = {
      width: 1000,
      visibleTimeStart: visibleTimeStart,
      visibleTimeEnd: visibleTimeEnd,
      canvasTimeStart: canvasTimeStart,
      canvasTimeEnd: canvasTimeEnd,
      selectedItem: null,
      dragTime: null,
      dragGroupTitle: null,
      resizeTime: null,
      resizingItem: null,
      resizingEdge: null
    }

    const canvasWidth = getCanvasWidth(this.state.width)

    const {
      dimensionItems,
      height,
      groupHeights,
      groupTops
    } = stackTimelineItems(
      props.items,
      props.groups,
      canvasWidth,
      this.state.canvasTimeStart,
      this.state.canvasTimeEnd,
      props.keys,
      props.lineHeight,
      props.itemHeightRatio,
      props.stackItems,
      this.state.draggingItem,
      this.state.resizingItem,
      this.state.dragTime,
      this.state.resizingEdge,
      this.state.resizeTime,
      this.state.newGroupOrder
    )

    /* eslint-disable react/no-direct-mutation-state */
    this.state.dimensionItems = dimensionItems
    this.state.height = height
    this.state.groupHeights = groupHeights
    this.state.groupTops = groupTops

    /* eslint-enable */
  }

  componentDidMount() {
    this.resize(this.props)

    if (this.props.resizeDetector && this.props.resizeDetector.addListener) {
      this.props.resizeDetector.addListener(this)
    }

    windowResizeDetector.addListener(this)

    this.lastTouchDistance = null
  }

  componentWillUnmount() {
    if (this.props.resizeDetector && this.props.resizeDetector.addListener) {
      this.props.resizeDetector.removeListener(this)
    }

    windowResizeDetector.removeListener(this)
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { visibleTimeStart, visibleTimeEnd, items, groups } = nextProps

    // This is a gross hack pushing items and groups in to state only to allow
    // For the forceUpdate check
    let derivedState = { items, groups }

    // if the items or groups have changed we must re-render
    const forceUpdate = items !== prevState.items || groups !== prevState.groups

    // We are a controlled component
    if (visibleTimeStart && visibleTimeEnd) {
      // Get the new canvas position
      Object.assign(
        derivedState,
        calculateScrollCanvas(
          visibleTimeStart,
          visibleTimeEnd,
          forceUpdate,
          items,
          groups,
          nextProps,
          prevState
        )
      )
    } else if (forceUpdate) {
      // Calculate new item stack position as canvas may have changed
      const canvasWidth = getCanvasWidth(prevState.width)
      Object.assign(
        derivedState,
        stackTimelineItems(
          items,
          groups,
          canvasWidth,
          prevState.canvasTimeStart,
          prevState.canvasTimeEnd,
          nextProps.keys,
          nextProps.lineHeight,
          nextProps.itemHeightRatio,
          nextProps.stackItems,
          prevState.draggingItem,
          prevState.resizingItem,
          prevState.dragTime,
          prevState.resizingEdge,
          prevState.resizeTime,
          prevState.newGroupOrder
        )
      )
    }

    return derivedState
  }

  componentDidUpdate(prevProps, prevState) {
    const newZoom = this.state.visibleTimeEnd - this.state.visibleTimeStart
    const oldZoom = prevState.visibleTimeEnd - prevState.visibleTimeStart

    // are we changing zoom? Report it!
    if (this.props.onZoom && newZoom !== oldZoom) {
      this.props.onZoom(this.getTimelineContext())
    }

    // The bounds have changed? Report it!
    if (
      this.props.onBoundsChange &&
      this.state.canvasTimeStart !== prevState.canvasTimeStart
    ) {
      this.props.onBoundsChange(
        this.state.canvasTimeStart,
        this.state.canvasTimeStart + newZoom * 3
      )
    }

    // Check the scroll is correct
    const scrollLeft = Math.round(
      this.state.width *
      (this.state.visibleTimeStart - this.state.canvasTimeStart) /
      newZoom
    )
    const componentScrollLeft = Math.round(
      prevState.width *
      (prevState.visibleTimeStart - prevState.canvasTimeStart) /
      oldZoom
    )
    if (componentScrollLeft !== scrollLeft) {
      this.scrollComponent.scrollLeft = scrollLeft
      this.scrollHeaderRef.scrollLeft = scrollLeft
    }
  }

  resize = (props = this.props) => {
    const { width: containerWidth } = this.container.getBoundingClientRect()

    let width = containerWidth - props.sidebarWidth - props.rightSidebarWidth
    const canvasWidth = getCanvasWidth(width)
    const {
      dimensionItems,
      height,
      groupHeights,
      groupTops
    } = stackTimelineItems(
      props.items,
      props.groups,
      canvasWidth,
      this.state.canvasTimeStart,
      this.state.canvasTimeEnd,
      props.keys,
      props.lineHeight,
      props.itemHeightRatio,
      props.stackItems,
      this.state.draggingItem,
      this.state.resizingItem,
      this.state.dragTime,
      this.state.resizingEdge,
      this.state.resizeTime,
      this.state.newGroupOrder
    )

    // this is needed by dragItem since it uses pageY from the drag events
    // if this was in the context of the scrollElement, this would not be necessary

    this.setState({
      width,
      dimensionItems,
      height,
      groupHeights,
      groupTops
    })

    this.scrollComponent.scrollLeft = width
    this.scrollHeaderRef.scrollLeft = width
  }

  onScroll = scrollX => {
    const width = this.state.width

    const canvasTimeStart = this.state.canvasTimeStart

    const zoom = this.state.visibleTimeEnd - this.state.visibleTimeStart

    const visibleTimeStart = canvasTimeStart + zoom * scrollX / width

    if (
      this.state.visibleTimeStart !== visibleTimeStart ||
      this.state.visibleTimeEnd !== visibleTimeStart + zoom
    ) {
      this.props.onTimeChange(
        visibleTimeStart,
        visibleTimeStart + zoom,
        this.updateScrollCanvas
      )
    }
  }

  // called when the visible time changes
  updateScrollCanvas = (
    visibleTimeStart,
    visibleTimeEnd,
    forceUpdateDimensions,
    items = this.props.items,
    groups = this.props.groups
  ) => {
    this.setState(
      calculateScrollCanvas(
        visibleTimeStart,
        visibleTimeEnd,
        forceUpdateDimensions,
        items,
        groups,
        this.props,
        this.state
      )
    )
  }

  handleWheelZoom = (speed, xPosition, deltaY) => {
    this.changeZoom(1.0 + speed * deltaY / 500, xPosition / this.state.width)
  }

  changeZoom = (scale, offset = 0.5) => {
    const { minZoom, maxZoom } = this.props
    const oldZoom = this.state.visibleTimeEnd - this.state.visibleTimeStart
    const newZoom = Math.min(
      Math.max(Math.round(oldZoom * scale), minZoom),
      maxZoom
    ) // min 1 min, max 20 years
    const newVisibleTimeStart = Math.round(
      this.state.visibleTimeStart + (oldZoom - newZoom) * offset
    )

    this.props.onTimeChange(
      newVisibleTimeStart,
      newVisibleTimeStart + newZoom,
      this.updateScrollCanvas
    )
  }

  showPeriod = (from, to) => {
    let visibleTimeStart = from.valueOf()
    let visibleTimeEnd = to.valueOf()

    let zoom = visibleTimeEnd - visibleTimeStart
    // can't zoom in more than to show one hour
    if (zoom < 360000) {
      return
    }

    this.props.onTimeChange(
      visibleTimeStart,
      visibleTimeStart + zoom,
      this.updateScrollCanvas
    )
  }

  selectItem = (item, clickType: any, e) => {
    if (
      this.isItemSelected(item) ||
      (this.props.itemTouchSendsClick && clickType === 'touch')
    ) {
      if (item && this.props.onItemClick) {
        const time = this.timeFromItemEvent(e)
        this.props.onItemClick(item, e, time)
      }
    } else {
      this.setState({ selectedItem: item })
      if (item && this.props.onItemSelect) {
        const time = this.timeFromItemEvent(e)
        this.props.onItemSelect(item, e, time)
      } else if (item === null && this.props.onItemDeselect) {
        this.props.onItemDeselect(e) // this isnt in the docs. Is this function even used?
      }
    }
  }

  doubleClickItem = (item, e) => {
    if (this.props.onItemDoubleClick) {
      const time = this.timeFromItemEvent(e)
      this.props.onItemDoubleClick(item, e, time)
    }
  }

  contextMenuClickItem = (item, e) => {
    if (this.props.onItemContextMenu) {
      const time = this.timeFromItemEvent(e)
      this.props.onItemContextMenu(item, e, time)
    }
  }

  // TODO: this is very similar to timeFromItemEvent, aside from which element to get offsets
  // from.  Look to consolidate the logic for determining coordinate to time
  // as well as generalizing how we get time from click on the canvas
  getTimeFromRowClickEvent = e => {
    const { dragSnap } = this.props
    const { width, canvasTimeStart, canvasTimeEnd } = this.state
    // this gives us distance from left of row element, so event is in
    // context of the row element, not client or page
    const { offsetX } = e.nativeEvent

    let time = calculateTimeForXPosition(
      canvasTimeStart,

      canvasTimeEnd,
      getCanvasWidth(width),
      offsetX
    )
    time = Math.floor(time / dragSnap) * dragSnap

    return time
  }

  timeFromItemEvent = e => {
    const { width, visibleTimeStart, visibleTimeEnd } = this.state
    const { dragSnap } = this.props

    const scrollComponent = this.scrollComponent
    const { left: scrollX } = scrollComponent.getBoundingClientRect()

    const xRelativeToTimeline = e.clientX - scrollX

    const relativeItemPosition = xRelativeToTimeline / width
    const zoom = visibleTimeEnd - visibleTimeStart
    const timeOffset = relativeItemPosition * zoom

    let time = Math.round(visibleTimeStart + timeOffset)
    time = Math.floor(time / dragSnap) * dragSnap

    return time
  }

  dragItem = (item, dragTime, newGroupOrder) => {
    let newGroup = this.props.groups[newGroupOrder]
    const keys = this.props.keys

    this.setState({
      draggingItem: item,
      dragTime: dragTime,
      newGroupOrder: newGroupOrder,
      dragGroupTitle: newGroup ? _get(newGroup, keys.groupLabelKey) : ''
    })

    this.updatingItem({
      eventType: 'move',
      itemId: item,
      time: dragTime,
      newGroupOrder
    })
  }

  dropItem = (item, dragTime, newGroupOrder) => {
    this.setState({ draggingItem: null, dragTime: null, dragGroupTitle: null })
    if (this.props.onItemMove) {
      this.props.onItemMove(item, dragTime, newGroupOrder)
    }
  }

  resizingItem = (item, resizeTime, edge) => {
    this.setState({
      resizingItem: item,
      resizingEdge: edge,
      resizeTime: resizeTime
    })

    this.updatingItem({
      eventType: 'resize',
      itemId: item,
      time: resizeTime,
      edge
    })
  }

  resizedItem = (item, resizeTime, edge, timeDelta) => {
    this.setState({ resizingItem: null, resizingEdge: null, resizeTime: null })
    if (this.props.onItemResize && timeDelta !== 0) {
      this.props.onItemResize(item, resizeTime, edge)
    }
  }

  updatingItem = ({ eventType, itemId, time, edge, newGroupOrder }: any) => {
    if (this.props.onItemDrag) {
      this.props.onItemDrag({ eventType, itemId, time, edge, newGroupOrder })
    }
  }

  columns(
    canvasTimeStart,
    canvasTimeEnd,
    canvasWidth,
    minUnit,
    timeSteps,
    height
  ) {
    return (
      <Columns
        canvasTimeStart={canvasTimeStart}
        canvasTimeEnd={canvasTimeEnd}
        canvasWidth={canvasWidth}
        lineCount={_length(this.props.groups)}
        minUnit={minUnit}
        timeSteps={timeSteps}
        height={height}
        verticalLineClassNamesForTime={this.props.verticalLineClassNamesForTime}
      />
    )
  }

  handleRowClick = (e, rowIndex) => {
    // shouldnt this be handled by the user, as far as when to deselect an item?
    if (this.hasSelectedItem()) {
      this.selectItem(null, null, null)
    }

    if (this.props.onCanvasClick == null) return

    const time = this.getTimeFromRowClickEvent(e)
    const groupId = _get(
      this.props.groups[rowIndex],
      this.props.keys.groupIdKey
    )
    this.props.onCanvasClick(groupId, time, e)
  }

  handleRowDoubleClick = (e, rowIndex) => {
    if (this.props.onCanvasDoubleClick == null) return

    const time = this.getTimeFromRowClickEvent(e)
    const groupId = _get(
      this.props.groups[rowIndex],
      this.props.keys.groupIdKey
    )
    this.props.onCanvasDoubleClick(groupId, time, e)
  }

  handleScrollContextMenu = (e, rowIndex) => {
    if (this.props.onCanvasContextMenu == null) return

    const timePosition = this.getTimeFromRowClickEvent(e)

    const groupId = _get(
      this.props.groups[rowIndex],
      this.props.keys.groupIdKey
    )

    if (this.props.onCanvasContextMenu) {
      e.preventDefault()
      this.props.onCanvasContextMenu(groupId, timePosition, e)
    }
  }

  rows(canvasWidth, groupHeights, groups) {
    return (
      <GroupRows
        groups={groups}
        canvasWidth={canvasWidth}
        lineCount={_length(this.props.groups)}
        groupHeights={groupHeights}
        clickTolerance={this.props.clickTolerance}
        onRowClick={this.handleRowClick}
        onRowDoubleClick={this.handleRowDoubleClick}
        horizontalLineClassNamesForGroup={
          this.props.horizontalLineClassNamesForGroup
        }
        onRowContextClick={this.handleScrollContextMenu}
      />
    )
  }

  items(
    canvasTimeStart,
    zoom,
    canvasTimeEnd,
    canvasWidth,
    minUnit,
    dimensionItems,
    groupHeights,
    groupTops
  ) {
    return (
      <Items
        canvasTimeStart={canvasTimeStart}
        canvasTimeEnd={canvasTimeEnd}
        canvasWidth={canvasWidth}
        dimensionItems={dimensionItems}
        groupTops={groupTops}
        items={this.props.items}
        groups={this.props.groups}
        keys={this.props.keys}
        selectedItem={this.state.selectedItem}
        dragSnap={this.props.dragSnap}
        minResizeWidth={this.props.minResizeWidth}
        canChangeGroup={this.props.canChangeGroup}
        canMove={this.props.canMove}
        canResize={this.props.canResize}
        useResizeHandle={this.props.useResizeHandle}
        canSelect={this.props.canSelect}
        moveResizeValidator={this.props.moveResizeValidator}
        itemSelect={this.selectItem}
        itemDrag={this.dragItem}
        itemDrop={this.dropItem}
        onItemDoubleClick={this.doubleClickItem}
        onItemContextMenu={this.contextMenuClickItem}
        itemResizing={this.resizingItem}
        itemResized={this.resizedItem}
        itemRenderer={this.props.itemRenderer}
        selected={this.props.selected}
        scrollRef={this.scrollComponent}
      />
    )
  }

  handleHeaderRef = el => {
    this.scrollHeaderRef = el
    this.props.headerRef(el)
  }

  sidebar(height, groupHeights) {
    const { sidebarWidth } = this.props
    return (
      sidebarWidth && (
        <Sidebar
          groups={this.props.groups}
          groupRenderer={this.props.groupRenderer}
          keys={this.props.keys}
          width={sidebarWidth}
          groupHeights={groupHeights}
          height={height}
        />
      )
    )
  }

  rightSidebar(height, groupHeights) {
    const { rightSidebarWidth } = this.props
    return (
      rightSidebarWidth && (
        <Sidebar
          groups={this.props.groups}
          keys={this.props.keys}
          groupRenderer={this.props.groupRenderer}
          isRightSidebar
          width={rightSidebarWidth}
          groupHeights={groupHeights}
          height={height}
        />
      )
    )
  }

  /**
   * check if child of type TimelineHeader
   * refer to for explanation https://github.com/gaearon/react-hot-loader#checking-element-types 
   */
  isTimelineHeader = (child) => {
    if (child.type === undefined) return false
    return child.type.secretKey === TimelineHeaders.secretKey
  }

  childrenWithProps(
    canvasTimeStart,
    canvasTimeEnd,
    canvasWidth,
    dimensionItems,
    groupHeights,
    groupTops,
    height,
    visibleTimeStart,
    visibleTimeEnd,
    minUnit,
    timeSteps
  ) {
    if (!this.props.children) {
      return null
    }

    // convert to an array and remove the nulls
    const childArray = Array.isArray(this.props.children)
      ? this.props.children.filter(c => c)
      : [this.props.children]

    const childProps = {
      canvasTimeStart,
      canvasTimeEnd,
      canvasWidth,
      visibleTimeStart: visibleTimeStart,
      visibleTimeEnd: visibleTimeEnd,
      dimensionItems,
      items: this.props.items,
      groups: this.props.groups,
      keys: this.props.keys,
      groupHeights: groupHeights,
      groupTops: groupTops,
      selected: this.getSelected(),
      height: height,
      minUnit: minUnit,
      timeSteps: timeSteps
    }

    return React.Children.map(childArray, child => {
      if (!this.isTimelineHeader(child)) {
        return React.cloneElement(child, childProps)
      } else {
        return null
      }
    })
  }

  renderHeaders = () => {
    if (this.props.children) {
      let headerRenderer
      React.Children.map(this.props.children, child => {
        if (this.isTimelineHeader(child)) {
          headerRenderer = child
        }
      })
      if (headerRenderer) {
        return headerRenderer
      }
    }
    return (
      <TimelineHeaders>
        <DateHeader unit="primaryHeader" />
        <DateHeader />
      </TimelineHeaders>
    )
  }

  getSelected() {
    return this.state.selectedItem && !this.props.selected
      ? [this.state.selectedItem]
      : this.props.selected || [];
  }

  hasSelectedItem() {
    if (!Array.isArray(this.props.selected)) return !!this.state.selectedItem
    return this.props.selected.length > 0
  }

  isItemSelected(itemId) {
    const selectedItems = this.getSelected()
    return selectedItems.some(i => i === itemId)
  }
  getScrollElementRef = el => {
    this.props.scrollRef(el)
    this.scrollComponent = el
  }

  render() {
    const {
      items,
      groups,
      sidebarWidth,
      rightSidebarWidth,
      timeSteps,
      traditionalZoom
    } = this.props
    const {
      draggingItem,
      resizingItem,
      width,
      visibleTimeStart,
      visibleTimeEnd,
      canvasTimeStart,
      canvasTimeEnd
    } = this.state
    let { dimensionItems, height, groupHeights, groupTops } = this.state

    const zoom = visibleTimeEnd - visibleTimeStart
    const canvasWidth = getCanvasWidth(width)
    const minUnit = getMinUnit(zoom, width, timeSteps)

    const isInteractingWithItem = !!draggingItem || !!resizingItem

    if (isInteractingWithItem) {
      const stackResults = stackTimelineItems(
        items,
        groups,
        canvasWidth,
        this.state.canvasTimeStart,
        this.state.canvasTimeEnd,
        this.props.keys,
        this.props.lineHeight,
        this.props.itemHeightRatio,
        this.props.stackItems,
        this.state.draggingItem,
        this.state.resizingItem,
        this.state.dragTime,
        this.state.resizingEdge,
        this.state.resizeTime,
        this.state.newGroupOrder
      )
      dimensionItems = stackResults.dimensionItems
      height = stackResults.height
      groupHeights = stackResults.groupHeights
      groupTops = stackResults.groupTops
    }

    const outerComponentStyle = {
      height: `${height}px`
    }

    return (
      <TimelineStateProvider
        visibleTimeStart={visibleTimeStart}
        visibleTimeEnd={visibleTimeEnd}
        canvasTimeStart={canvasTimeStart}
        canvasTimeEnd={canvasTimeEnd}
        canvasWidth={canvasWidth}
        showPeriod={this.showPeriod}
        timelineUnit={minUnit}
        timelineWidth={this.state.width}
      >
        <TimelineMarkersProvider>
          <TimelineHeadersProvider
            registerScroll={this.handleHeaderRef}
            timeSteps={timeSteps}
            leftSidebarWidth={this.props.sidebarWidth}
            rightSidebarWidth={this.props.rightSidebarWidth}
          >
            <div
              style={this.props.style}
              ref={el => (this.container = el)}
              className={`react-calendar-timeline ${this.props.className}`}
            >
              {this.renderHeaders()}
              <div style={outerComponentStyle} className="rct-outer">
                {sidebarWidth > 0 ? this.sidebar(height, groupHeights) : null}
                <ScrollElement
                  scrollRef={this.getScrollElementRef}
                  width={width}
                  height={height}
                  onZoom={this.changeZoom}
                  onWheelZoom={this.handleWheelZoom}
                  traditionalZoom={traditionalZoom}
                  onScroll={this.onScroll}
                  isInteractingWithItem={isInteractingWithItem}
                >
                  <MarkerCanvas>
                    {this.columns(
                      canvasTimeStart,
                      canvasTimeEnd,
                      canvasWidth,
                      minUnit,
                      timeSteps,
                      height
                    )}
                    {this.rows(canvasWidth, groupHeights, groups)}
                    {this.items(
                      canvasTimeStart,
                      zoom,
                      canvasTimeEnd,
                      canvasWidth,
                      minUnit,
                      dimensionItems,
                      groupHeights,
                      groupTops
                    )}
                    {this.childrenWithProps(
                      canvasTimeStart,
                      canvasTimeEnd,
                      canvasWidth,
                      dimensionItems,
                      groupHeights,
                      groupTops,
                      height,
                      visibleTimeStart,
                      visibleTimeEnd,
                      minUnit,
                      timeSteps
                    )}
                  </MarkerCanvas>
                </ScrollElement>
                {rightSidebarWidth > 0
                  ? this.rightSidebar(height, groupHeights)
                  : null}
              </div>
            </div>
          </TimelineHeadersProvider>
        </TimelineMarkersProvider>
      </TimelineStateProvider>
    )
  }
}
