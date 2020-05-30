import React from 'react'
import { TimelineMarkersConsumer } from '../TimelineMarkersContext'
import { TimelineMarkerType } from '../markerType'

class CursorMarker extends React.Component {
	public props: any;
	public unsubscribe: any;

  componentDidMount() {
    const { unsubscribe } = this.props.subscribeMarker({
      type: TimelineMarkerType.Cursor,
      renderer: this.props.children
    })
    this.unsubscribe = unsubscribe
  }

  componentWillUnmount() {
    if (this.unsubscribe != null) {
      this.unsubscribe()
      this.unsubscribe = null
    }
  }
  render() {
    return null
  }
}

// TODO: turn into HOC?
const CursorMarkerWrapper = props => {
  return (
    <TimelineMarkersConsumer>
      {({ subscribeMarker }) => (
        <CursorMarker subscribeMarker={subscribeMarker} {...props} />
      )}
    </TimelineMarkersConsumer>
  )
}

CursorMarkerWrapper.displayName = 'CursorMarkerWrapper'

export default CursorMarkerWrapper
