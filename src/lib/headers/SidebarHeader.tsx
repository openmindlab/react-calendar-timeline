import React from 'react'
import { TimelineHeadersConsumer } from './HeadersContext'
import { LEFT_VARIANT, RIGHT_VARIANT } from './constants'



export interface SidebarHeaderChildrenFnProps<Data> {
  getRootProps: (propsToOverride?: { style: React.CSSProperties }) => { style: React.CSSProperties };
  data: Data;
}

export interface SidebarHeaderProps<Data> {
  variant?: 'left' | 'right';
  headerData?: Data;
  children: (props: SidebarHeaderChildrenFnProps<Data>) => React.ReactNode;
}


class SidebarHeader<Data = any> extends React.PureComponent<SidebarHeaderProps<Data>> {
  public props: any;
  public style: any;

  getRootProps = (props: any = {}) => {
    const { style } = props
    const width =
      this.props.variant === RIGHT_VARIANT
        ? this.props.rightSidebarWidth
        : this.props.leftSidebarWidth
    return {
      style: {
        ...style,
        width,
      }
    }
  }

  getStateAndHelpers = () => {
    return {
      getRootProps: this.getRootProps,
      data: this.props.headerData,
    }
  }

  render() {
    const props = this.getStateAndHelpers()
    const Renderer = this.props.children
    return <Renderer {...props} />
  }
}

const SidebarWrapper = ({ children, variant, headerData } : any) => (
  <TimelineHeadersConsumer>
    {({ leftSidebarWidth, rightSidebarWidth }) => {
      return (
        <SidebarHeader
          leftSidebarWidth={leftSidebarWidth}
          rightSidebarWidth={rightSidebarWidth}
          children={children}
          variant={variant}
          headerData={headerData}
        />
      )
    }}
  </TimelineHeadersConsumer>
)

SidebarWrapper.defaultProps = {
  variant: LEFT_VARIANT,
  children: ({ getRootProps }) => <div data-testid="sidebarHeader" {...getRootProps()} />
}

SidebarWrapper.secretKey = "SidebarHeader"

export default SidebarWrapper
