import React from 'react';
import * as dateFormatter from './../public/scripts/DateFormatter';

export default class ProfileDialog extends React.Component {
  state = {
    focusedSection: 0
  }

  render() {
    let badgeList = this.props.selectedUser.badges.map((badge, i) => {
      switch(badge) {
        case "0":
          return <div className="tooltipWrapper pointer marginright3" style={{ width: 22, height: 32 }}>
            <img style={{ width: 22, height: 30, paddingTop: 2 }} src={this.props.fileEndpoint + "/badge_staff.png"}/>
            <span className="tooltipText tooltipText3">Staff</span>
          </div>

        case "1":
          return <div className="tooltipWrapper pointer marginright3" style={{ width: 22, height: 32 }}>
            <img style={{ width: 22, height: 28, paddingTop: 4 }} src={this.props.fileEndpoint + "/badge_verified.png"}/>
            <span className="tooltipText tooltipText3">Verified</span>
          </div>

        case "2":
          return <div className="tooltipWrapper pointer marginright3" style={{ width: 22, height: 32 }}>
            <img style={{ width: 22, height: 28, paddingTop: 4 }} src={this.props.fileEndpoint + "/badge_developer.png"}/>
            <span className="tooltipText tooltipText3">Developer</span>
          </div>
      }

      return null;
    })

    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0) }}></div>
        <div className="absolutepos overlaybox3">
            <div className="section chatColor">
              <div className="flex marginleft3 paddingtop3">
                <img alt="" className="avatar2" src={this.props.fileEndpoint + "/" + this.props.selectedUser.avatar}/>
                <div className="tooltipWrapper statusWrapper">
                  <div className="status" style={{ backgroundColor: this.props.const.getStatusColor(this.props.selectedUser.status) }}/>
                  <span className="tooltipText tooltipText2">{this.props.selectedUser.status === 1 ? "Online" : "Offline"}</span>
                </div>
                <div className="marginleft3">
                  <div className="flex margintop1">
                    <p className="tooltipColor text5 marginleft2 margintop0 marginbot0">> Username: </p>
                    <p className="white text5 marginleft1 margintop0 marginbot0">{this.props.selectedUser.username}</p>
                  </div>
                  <div className="flex margintop1a">
                    <p className="tooltipColor text5 marginleft2 margintop0 marginbot0">> Created: </p>
                    <p className="white text5 marginleft1 margintop0 marginbot0">{dateFormatter.formatDuration(this.props.selectedUser.createdAt, Date.now())} ago</p>
                  </div>
                </div>
              </div>
              <div className="flex marginleft3 paddingtop3">
                {badgeList}
              </div>
            </div>
            <div className="section2 chatColor">
              <div className={this.state.focusedSection === 0 ? "button profileButton buttonFocused" : "button profileButton"} onClick={(e) => { this.setState({ focusedSection: 0 }); }}>User Info</div>
              <div className={this.state.focusedSection === 1 ? "button profileButton buttonFocused" : "button profileButton"} onClick={(e) => { this.setState({ focusedSection: 1 }); }}>Mutual Friends</div>
              <div className={this.state.focusedSection === 2 ? "button profileButton buttonFocused" : "button profileButton"} onClick={(e) => { this.setState({ focusedSection: 2 }); }}>Mutual Servers</div>
            </div>
        </div>
      </div>
    );
  }
}