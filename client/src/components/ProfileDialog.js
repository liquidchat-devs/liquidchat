import React from 'react';
import * as dateFormatter from './../public/scripts/DateFormatter';

export default class ProfileDialog extends React.Component {
  render() {
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
                    <p className="profileTooltipColor text5 marginleft2 margintop0 marginbot0">> Username: </p>
                    <p className="white text5 marginleft1 margintop0 marginbot0">{this.props.selectedUser.username}</p>
                  </div>
                  <div className="flex margintop1a">
                    <p className="profileTooltipColor text5 marginleft2 margintop0 marginbot0">> Created: </p>
                    <p className="white text5 marginleft1 margintop0 marginbot0">{dateFormatter.formatDuration(this.props.selectedUser.createdAt, Date.now())} ago</p>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
    );
  }
}