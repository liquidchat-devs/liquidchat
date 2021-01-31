import React from 'react';

export default class AccountOptionsDialog extends React.Component {
  render() {
    const user = this.props.functions.getUser(this.props.state.session.userID)

    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.functions.switchDialogState(0); }} style={{ opacity: 0.3 }}></div>
        <div className="absolutepos overlaybox2" style={{ left: this.props.state.boxX, top: this.props.state.boxY - 96, height: 96 }}>
          {this.props.elements.getContextButton("Profile", (e) => { this.props.functions.setSelectedUser(user.id); this.props.functions.switchDialogState(5); })}
          {this.props.elements.getContextButton("Logout", (e) => { this.props.API.API_logout(); }, "var(--color8)")}
          {this.props.elements.getContextButton("Copy ID", (e) => { this.props.functions.copyID(this.props.state.session.userID); })}
        </div>
      </div>
    );
  }
}