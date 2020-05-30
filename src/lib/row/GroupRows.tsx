import React, { Component } from 'react'
import GroupRow from './GroupRow'

export default class GroupRows extends Component {
	public props: any;
	public canvasWidth: any;
	public lineCount: any;
	public groupHeights: any;
	public onRowClick: any;
	public onRowDoubleClick: any;
	public clickTolerance: any;
	public groups: any;
	public horizontalLineClassNamesForGroup: any;
	public onRowContextClick: any;

  shouldComponentUpdate(nextProps) {
    return !(
      nextProps.canvasWidth === this.props.canvasWidth &&
      nextProps.lineCount === this.props.lineCount &&
      nextProps.groupHeights === this.props.groupHeights &&
      nextProps.groups === this.props.groups
    )
  }

  render() {
    const {
      canvasWidth,
      lineCount,
      groupHeights,
      onRowClick,
      onRowDoubleClick,
      clickTolerance,
      groups,
      horizontalLineClassNamesForGroup,
      onRowContextClick,
    } = this.props
    let lines = []

    for (let i = 0; i < lineCount; i++) {
      lines.push(
        <GroupRow
          clickTolerance={clickTolerance}
          onContextMenu={evt => onRowContextClick(evt, i)}
          onClick={evt => onRowClick(evt, i)}
          onDoubleClick={evt => onRowDoubleClick(evt, i)}
          key={`horizontal-line-${i}`}
          isEvenRow={i % 2 === 0}
          group={groups[i]}
          horizontalLineClassNamesForGroup={horizontalLineClassNamesForGroup}
          style={{
            width: `${canvasWidth}px`,
            height: `${groupHeights[i]}px`
          }}
        />
      )
    }

    return <div className="rct-horizontal-lines">{lines}</div>
  }
}
