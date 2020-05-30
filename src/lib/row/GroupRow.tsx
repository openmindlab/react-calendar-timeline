import React, { Component } from 'react'
import PreventClickOnDrag from '../interaction/PreventClickOnDrag'

class GroupRow extends Component {
	public props: any;
	public onContextMenu: any;
	public onDoubleClick: any;
	public isEvenRow: any;
	public style: any;
	public onClick: any;
	public clickTolerance: any;
	public horizontalLineClassNamesForGroup: any;
	public group: any;

  render() {
    const {
      onContextMenu,
      onDoubleClick,
      isEvenRow,
      style,
      onClick,
      clickTolerance,
      horizontalLineClassNamesForGroup,
      group
    } = this.props

    let classNamesForGroup = [];
    if (horizontalLineClassNamesForGroup) {
      classNamesForGroup = horizontalLineClassNamesForGroup(group);
    }

    return (
      <PreventClickOnDrag clickTolerance={clickTolerance} onClick={onClick}>
        <div
          onContextMenu={onContextMenu}
          onDoubleClick={onDoubleClick}
          className={(isEvenRow ? 'rct-hl-even ' : 'rct-hl-odd ') + (classNamesForGroup ? classNamesForGroup.join(' ') : '')}
          style={style}
        />
      </PreventClickOnDrag>
    )
  }
}

export default GroupRow
