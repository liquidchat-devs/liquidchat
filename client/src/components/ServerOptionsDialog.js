import React from 'react';

export default class ServerOptionsDialog extends React.Component {
  state = {
    serverDeletionResult: 0
  };

  handleDelete = async e => {
    e.preventDefault();
    const res = await this.props.API.API_deleteServer(this.props.selectedServer);
    this.setState({
      serverDeletionResult: res,
    });
    
    if(res === 1) { this.props.switchDialogState(-1); }
    return true;
  }

  render() {
    const server = this.props.getServer(this.props.selectedServer)
    if(server === undefined) {  return null; }

    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0); }} style={{ opacity: 0.3 }}></div>
        <div className="absolutepos overlaybox2" style={{ left: this.props.boxX, top: this.props.boxY, height: server.author.id === this.props.session.userID ? 45 : 30  }}>
          {
            server.author.id === this.props.session.userID ?
            <div>
              <div className="button2 alignmiddle chatColor" onClick={() => { this.props.switchDialogState(18); }}>
                <p className="white text1">> Edit Server</p>
              </div>
              <div className="button2 alignmiddle chatColor" onClick={(e) => { this.handleDelete(e); }}>
                <p className="white text1">> Delete Server</p>
              </div>
              <div className="button2 alignmiddle chatColor" onClick={() => { this.props.switchDialogState(12); }}>
                <p className="white text1">> Invite Friends</p>
              </div>
            </div> :
            ""
          }
          <div className="button2 alignmiddle chatColor" onClick={() => { this.props.API.API_leaveServer(server.id); }}>
            <p className="white text1">> Leave Server</p>
          </div>
          <div className="button2 alignmiddle chatColor" onClick={() => { this.props.copyID(server.id); }}>
            <p className="white text1">> Copy ID</p>
          </div>
        </div>
      </div>
    );
  }
}