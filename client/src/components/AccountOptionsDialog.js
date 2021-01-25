import React from 'react';

export default class AccountOptionsDialog extends React.Component {
  render() {
    const user = this.props.getUser(this.props.state.session.userID)

    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0); }} style={{ opacity: 0.3 }}></div>
        <div className="absolutepos overlaybox2" style={{ left: this.props.state.boxX, top: this.props.state.boxY - 96, height: 96 }}>
          <div className="button2 hover alignmiddle chatColor" onClick={(e) => { this.props.setSelectedUser(user.id); this.props.switchDialogState(5); }}>
            <p className="white text1">&gt; Profile</p>
          </div>
          <div className="button2 hover alignmiddle chatColor" onClick={() => { this.props.API.API_logout(); }}>
            <p className="declineColor text1">&gt; Logout</p>
          </div>
          <div className="button2 hover alignmiddle chatColor" onClick={() => { this.props.copyID(this.props.state.session.userID); }}>
            <p className="white text1">&gt; Copy ID</p>
          </div>
        </div>
      </div>
    );
  }
}