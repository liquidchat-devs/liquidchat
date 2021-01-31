import React from 'react';

export default class CopiedIDDialog extends React.Component {
  componentDidMount() {
    setTimeout(() => { this.props.functions.switchDialogState(-1); }, 3000)
  }

  render() {
    return (
      <div>
        <div className="absolutepos overlaybox2" style={{ left: this.props.state.boxX, top: this.props.state.boxY, height: 30, width: 180 + (this.props.state.copiedID.length * 5) }}>
          <div className="button2 hover alignmiddle chatColor">
            <p className="white text1">Copied {this.props.state.copiedID}!</p>
          </div>
        </div>
      </div>
    );
  }
}