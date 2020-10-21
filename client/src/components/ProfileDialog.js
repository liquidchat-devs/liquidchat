import React from 'react';
import * as dateFormatter from './../public/scripts/DateFormatter';

export default class ProfileDialog extends React.Component {
  render() {
    let badgeList;
    this.props.selectedUser.badges.forEach(badge => {
      switch(badge) {
        case 0:
          badgeList += <div className="tooltipWrapper pointer marginright3" style={{ width: 24, height: 32 }}>
            <img style={{ width: 24, height: 32 }} src={this.props.fileEndpoint + "/badge_staff.png"}/>
            <span className="tooltipText tooltipText3">Staff</span>
          </div>
          break;

        case 1:
          badgeList += <div className="tooltipWrapper pointer marginright3" style={{ width: 24, height: 32 }}>
            <img style={{ width: 24, height: 30, paddingTop: 2 }} src={this.props.fileEndpoint + "/badge_verified.png"}/>
            <span className="tooltipText tooltipText3">Verified</span>
          </div>
          break;
      }
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
        </div>
      </div>
    );
  }
}