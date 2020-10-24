import React from 'react';

export default class AccountStatusDialog extends React.Component {
  render() {
    const user = this.props.getUser(this.props.session.userID)

    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0); }} style={{ opacity: 0.3 }}></div>
        <div className="absolutepos overlaybox2 statusDialog" style={{ left: this.props.boxX, top: this.props.boxY - 180, height: 180, background: "none" }}>
          <div className="button3 hover chatColor aligny firstBorder" onClick={() => { this.props.API.API_updateStatus(1); this.props.switchDialogState(-1); }}>
            <div className="status3 marginleft2" style={{ backgroundColor: this.props.const.getStatusColor(1) }}/>
            <p className="white text1 marginleft2b alignmiddle">Online</p>
          </div>
          <div className="button3 hover chatColor aligny" onClick={() => { this.props.API.API_updateStatus(2); this.props.switchDialogState(-1); }}>
            <div className="status3 marginleft2" style={{ backgroundColor: this.props.const.getStatusColor(2) }}/>
            <p className="white text1 marginleft2b alignmiddle">Idle</p>
          </div>
          <div className="button3 hover chatColor aligny" onClick={() => { this.props.API.API_updateStatus(3); this.props.switchDialogState(-1); }}>
            <div className="status3 marginleft2" style={{ backgroundColor: this.props.const.getStatusColor(3) }}/>
            <p className="white text1 marginleft2b alignmiddle">Do not Disturb</p>
          </div>
          <div className="button3 hover chatColor aligny" onClick={() => { this.props.API.API_updateStatus(0); this.props.switchDialogState(-1); }}>
            <div className="status3 marginleft2" style={{ backgroundColor: this.props.const.getStatusColor(0) }}/>
            <p className="white text1 marginleft2b alignmiddle">Offline</p>
          </div>
          <div className="button3 hover chatColor aligny lastBorder" onClick={() => { this.props.switchDialogState(23); }}>
            <div className="status3 marginleft2" style={{ backgroundColor: this.props.const.getStatusColor(4) }}/>
    <p className="text1 marginleft2b alignmiddle" style={{ color: user.customStatus === undefined ? "var(--color1)" : "var(--color2)" }}>{ user.customStatus === undefined ? "Change Status" : user.customStatus }</p>
          </div>
        </div>
      </div>
    );
  }
}