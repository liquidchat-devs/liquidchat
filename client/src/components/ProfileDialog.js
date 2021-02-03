import React from 'react';
import * as dateFormatter from './../public/scripts/DateFormatter';

export default class ProfileDialog extends React.Component {
  state = {
    focusedSection: 0,
    note: ""
  }

  componentDidMount = () => {
    const notes = Array.from(this.props.state.notes.values()).filter(e => { return e.author.id === this.props.state.session.userID && e.target.id === this.props.state.selectedUser; })
    if(notes.length > 0) {
      this.setState({
        note: notes[0].text
      })
    }
  }

  handleNote = async e => {
    e.preventDefault();
    this.props.API.endpoints["editNote"]({ author: { id: this.props.state.session.userID }, target: { id: this.props.state.selectedUser }, text: this.state.note });
  }

  handleNoteChange = e => {
    let newNote = e.target.value;

    this.setState({
      note: newNote
    })
  }

  getConnection(icon, name, link) {
    return <div className="connection chatColor">
    <div className="connectionSection1">
      <img className="connectionIcon" src={icon}/>
      <div className="connectionText">{name}</div>
    </div>
    {link !== undefined ?
    <div className="connectionLink" onClick={() => { window.open(link, "-1"); }}>
      <svg viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M18.364 15.536L16.95 14.12l1.414-1.414a5 5 0 1 0-7.071-7.071L9.879 7.05 8.464 5.636 9.88 4.222a7 7 0 0 1 9.9 9.9l-1.415 1.414zm-2.828 2.828l-1.415 1.414a7 7 0 0 1-9.9-9.9l1.415-1.414L7.05 9.88l-1.414 1.414a5 5 0 1 0 7.071 7.071l1.414-1.414 1.415 1.414zm-.708-10.607l1.415 1.415-7.071 7.07-1.415-1.414 7.071-7.07z" fill="rgba(183,183,183,1)"/></svg>
    </div> : ""}
  </div>
  }

  render() {
    let selectedUser = this.props.functions.getUser(this.props.state.selectedUser);
    let loggedUser = this.props.functions.getUser(this.props.state.session.userID);

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

    let connections = [];
    if(selectedUser.connections.github !== undefined) {
      connections.push(this.getConnection("https://qtlamkas.why-am-i-he.re/ujDmtl.png", selectedUser.connections.github.username, "https://github.com/" + selectedUser.connections.github.username))
    }
    if(selectedUser.connections.reddit !== undefined) {
      connections.push(this.getConnection("https://qtlamkas.why-am-i-he.re/4LiOlB.png", selectedUser.connections.reddit.username, "https://www.reddit.com/user/" + selectedUser.connections.reddit.username))
    }
    if(selectedUser.connections.osu !== undefined) {
      connections.push(this.getConnection("https://qtlamkas.why-am-i-he.re/AJj49O.png", selectedUser.connections.osu.username, "https://osu.ppy.sh/users/" + selectedUser.connections.osu.username))
    }
    if(selectedUser.connections.twitch !== undefined) {
      connections.push(this.getConnection("https://qtlamkas.why-am-i-he.re/VZ5PN5.png", selectedUser.connections.twitch.username, "https://twitch.tv/" + selectedUser.connections.twitch.username))
    }
    if(selectedUser.connections.spotify !== undefined) {
      connections.push(this.getConnection("https://qtlamkas.why-am-i-he.re/XgHLDJ.png", selectedUser.connections.spotify.username, "https://open.spotify.com/user/" + selectedUser.connections.spotify.username))
    }
    if(selectedUser.connections.blizzard !== undefined) {
      connections.push(this.getConnection("https://qtlamkas.why-am-i-he.re/3QuD8o.png", selectedUser.connections.blizzard.username, undefined))
    }
    if(selectedUser.connections.discord !== undefined) {
      connections.push(this.getConnection("https://qtlamkas.why-am-i-he.re/XfNe77.png", selectedUser.connections.discord.username, undefined))
    }

    let content = null;
    switch(this.state.focusedSection) {
      case 0:
        content = <div className="full">
          <div className="input-note chatColor">
            <input class="input-note-text chatColor" type="text" value={this.state.note} placeholder="Edit note..." required={true} onBlur={this.handleNote} onChange={this.handleNoteChange} />
          </div>
          <div className="userinfo-line"/>
          <div className="connections">
           {connections}
          </div>
        </div>
        break;

      case 1:
        content = selectedUser.friends.map((id, i) => {
          if(loggedUser.friends.includes(id)) {
            let user = this.props.functions.getUser(id);
            return <div key={i} className="mutual" onClick={() => { this.props.functions.setSelectedUser(id); }}>
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
            let server = this.props.functions.getServer(id);
            return <div key={i} className="mutual" onClick={() => { this.props.functions.setSelectedServer(id); this.props.functions.switchDialogState(-1); }}>
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
        <div className="absolutepos overlay" onClick={() => { this.props.functions.switchDialogState(0) }}></div>
        <div className="absolutepos overlaybox3">
            <div className="section chatColor">
              <div className="flex marginleft3 paddingtop3">
                <img alt="" className="avatar2" src={this.props.state.fileEndpoint + "/" + selectedUser.avatar}/>
                <div className="tooltipWrapper statusWrapper">
                  <div className="status" style={{ backgroundColor: this.props.const.getStatusColor(selectedUser.userStatus) }}/>
                  <span className="tooltipText tooltipText2">{selectedUser.userStatus === 1 ? "Online" : "Offline"}</span>
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