import React from 'react';

export default class PinnedMessagesDialog extends React.Component {
  render() {
    return (
      <div>
        <div className="absolutepos overlay2" onClick={() => { this.props.functions.switchDialogState(0) }}></div>
        <div className="absolutepos overlaybox9">
          <div className="pinnedSection1">
            <div className="text white">Pinned Messages</div>
          </div>
        </div>
      </div>
    );
  }
}