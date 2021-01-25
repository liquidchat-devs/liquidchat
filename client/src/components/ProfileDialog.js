import React from 'react';
import * as dateFormatter from './../public/scripts/DateFormatter';

export default class ProfileDialog extends React.Component {
  state = {
    focusedSection: 0
  }

  render() {
    let selectedUser = this.props.getUser(this.props.state.selectedUser);
    let loggedUser = this.props.getUser(this.props.state.session.userID);

    let badgeList = selectedUser.badges.map((badge, i) => {
      switch(badge) {
        case "0":
          return <div key={i} className="tooltipWrapper pointer marginright3 badge">
            <img className="badgeImage" alt="" src={this.props.state.fileEndpoint + "/badge_staff.svg"}/>
            <span className="tooltipText tooltipText3">Staff</span>
          </div>

        case "1":
          return <div key={i} className="tooltipWrapper pointer marginright3 badge">
            <img className="badgeImage" alt="" src={this.props.state.fileEndpoint + "/badge_verified.svg"}/>
            <span className="tooltipText tooltipText3">Verified</span>
          </div>

        case "2":
          return <div key={i} className="tooltipWrapper pointer marginright3 badge">
            <img className="badgeImage" alt="" src={this.props.state.fileEndpoint + "/badge_developer.svg"}/>
            <span className="tooltipText tooltipText3">Developer</span>
          </div>
      }

      return null;
    })

    let content = null;
    switch(this.state.focusedSection) {
      case 1:
        content = selectedUser.friends.map((id, i) => {
          if(loggedUser.friends.includes(id)) {
            let user = this.props.getUser(id);
            return <div key={i} className="mutual" onClick={() => { this.props.setSelectedUser(id); }}>
              <img alt="" className="avatar marginleft2" src={this.props.state.fileEndpoint + "/" + user.avatar}/>
              <div className="tooltipColor text5 marginleft2">{user.username}</div>
            </div>
          }

          return null;
        });
        break;

      case 2:
        content = selectedUser.servers.map((id, i) => {
          if(loggedUser.servers.includes(id)) {
            let server = this.props.getServer(id);
            return <div key={i} className="mutual" onClick={() => { this.props.setSelectedServer(id); this.props.switchDialogState(-1); }}>
              <img alt="" className="avatar marginleft2" src={this.props.state.fileEndpoint + "/" + server.avatar}/>
              <div className="tooltipColor text5 marginleft2">{server.name}</div>
            </div>
          }

          return null;
        });
        break;
    }

    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0) }}></div>
        <div className="absolutepos overlaybox3">
            <div className="section chatColor">
              <div className="flex marginleft3 paddingtop3">
                <img alt="" className="avatar2" src={this.props.state.fileEndpoint + "/" + selectedUser.avatar}/>
                <div className="tooltipWrapper statusWrapper">
                  <div className="status" style={{ backgroundColor: this.props.const.getStatusColor(selectedUser.status) }}/>
                  <span className="tooltipText tooltipText2">{selectedUser.status === 1 ? "Online" : "Offline"}</span>
                </div>
                <div className="marginleft3">
                  <div className="flex margintop1">
                    <p className="tooltipColor text5 marginleft2 margintop0 marginbot0">&gt; Username: </p>
                    <p className="white text5 marginleft1 margintop0 marginbot0">{selectedUser.username}</p>
                  </div>
                  <div className="flex margintop1a">
                    <p className="tooltipColor text5 marginleft2 margintop0 marginbot0">&gt; Created: </p>
                    <p className="white text5 marginleft1 margintop0 marginbot0">{dateFormatter.formatDuration(selectedUser.createdAt, Date.now())} ago</p>
                  </div>
                </div>
              </div>
              {badgeList.length > 0 ?
                <div className="flex marginleft3 paddingtop3">
                  {badgeList}
                </div>
              : null}
              {selectedUser.customStatus !== undefined ?
                <div className="flex marginleft3 paddingtop2c">
                  <p className="tooltipColor text5 margintop0 marginbot0">Custom Status: </p>
                  <p className="pendingColor text5 marginleft1 margintop0 marginbot0">{selectedUser.customStatus}</p>
                </div>
              : ""}
            </div>
            <div className="section2 chatColor">
              <div className={this.state.focusedSection === 0 ? "button profileButton buttonFocused" : "button profileButton"} onClick={(e) => { this.setState({ focusedSection: 0 }); }}>User Info</div>
              <div className={this.state.focusedSection === 1 ? "button profileButton buttonFocused" : "button profileButton"} onClick={(e) => { this.setState({ focusedSection: 1 }); }}>Mutual Friends</div>
              <div className={this.state.focusedSection === 2 ? "button profileButton buttonFocused" : "button profileButton"} onClick={(e) => { this.setState({ focusedSection: 2 }); }}>Mutual Servers</div>
            </div>
            <div className="section3 chatColor">
              {content}
            </div>
        </div>
      </div>
    );
  }
}