import React from 'react';

export default class CopiedIDDialog extends React.Component {
  componentDidMount() {
    setTimeout(() => { this.props.switchDialogState(-1); }, 3000)
  }

  render() {
    return (
      <div>
        <div className="absolutepos overlaybox2" style={{ left: this.props.boxX, top: this.props.boxY, height: 30, width: 180 + (this.props.copiedID.length * 5) }}>
          <div className="button2 hover alignmiddle chatColor">
            <p className="white text1">Copied {this.props.copiedID}!</p>
          </div>
        </div>
      </div>
    );
  }
}