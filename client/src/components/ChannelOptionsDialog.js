import React from 'react';

export default class ChannelOptionsDialog extends React.Component {
  state = {
    channelDeletionResult: 0,
    channelCloneResult: 0
  };

  handleDelete = async e => {
    e.preventDefault();
    const res = await this.props.API.API_deleteChannel(this.props.state.selectedChannel);
    this.setState({
      channelDeletionResult: res,
    });
    
    if(res === 1) { this.props.functions.switchDialogState(-1); }
    return true;
  }

  handleClone = async e => {
    e.preventDefault();
    const res = await this.props.API.API_cloneChannel(this.props.state.selectedChannel);
    this.setState({
      channelCloneResult: res,
    });
    
    if(res === 1) { this.props.functions.switchDialogState(-1); }
    return true;
  }

  render() {
    const channel = this.props.functions.getChannel(this.props.state.selectedChannel)
    if(channel === undefined) {  return null; }

    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.functions.switchDialogState(0); }} style={{ opacity: 0.3 }}></div>
        <div className="absolutepos overlaybox2" style={{ left: this.props.state.boxX, top: this.props.state.boxY, height: channel.author.id === this.props.state.session.userID ? 45 : 30  }}>
          {
            channel.author.id === this.props.state.session.userID ?
            <div>
              {this.props.elements.getContextButton("Edit Channel", (e) => { this.props.functions.switchDialogState(11); })}
              {channel.type === 2 ? this.props.elements.getContextButton("Add Friends", (e) => { this.props.functions.switchDialogState(12); }) : ""}
              {this.props.elements.getContextButton("Clone Channel", (e) => { this.handleClone(e); })}
              {this.props.elements.getContextButton("Delete Channel", (e) => { this.handleDelete(e); }, "var(--color8)")}
            </div> :
            ""
          }
          {this.props.elements.getContextButton("Copy ID", (e) => { this.props.functions.copyID(this.props.state.selectedChannel); })}
        </div>
      </div>
    );
  }
}