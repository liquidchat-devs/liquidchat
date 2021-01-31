import React from 'react';

export default class ServerOptionsDialog extends React.Component {
  state = {
    serverDeletionResult: 0
  };

  handleDelete = async e => {
    e.preventDefault();
    const res = await this.props.API.API_deleteServer(this.props.state.selectedServer);
    this.setState({
      serverDeletionResult: res,
    });
    
    if(res === 1) { this.props.functions.switchDialogState(-1); }
    return true;
  }

  render() {
    const server = this.props.functions.getServer(this.props.state.selectedServer)
    if(server === undefined) {  return null; }

    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.functions.switchDialogState(0); }} style={{ opacity: 0.3 }}></div>
        <div className="absolutepos overlaybox2" style={{ left: this.props.state.boxX, top: this.props.state.boxY, height: server.author.id === this.props.state.session.userID ? 45 : 30  }}>
          {
            server.author.id === this.props.state.session.userID ?
            <div>
              {this.props.elements.getContextButton("Edit Server", (e) => { this.props.functions.switchDialogState(18); })}
              {this.props.elements.getContextButton("Invite Friends", (e) => { this.props.functions.switchDialogState(12); })}
            </div> :
            ""
          }
          {this.props.elements.getContextButton("Leave Server", (e) => { this.props.API.API_leaveServer(server.id); }, "var(--color8)")}
          {server.author.id === this.props.state.session.userID ? this.props.elements.getContextButton("Delete Server", (e) => { this.handleDelete(e); }, "var(--color8)") : "" }
          {this.props.elements.getContextButton("Copy ID", (e) => { this.props.functions.copyID(server.id); })}
        </div>
      </div>
    );
  }
}