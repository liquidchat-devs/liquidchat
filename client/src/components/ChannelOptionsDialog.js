import React from 'react';

export default class ChannelOptionsDialog extends React.Component {
  state = {
    channelDeletionResult: 0
  };

  handleDelete = async e => {
    e.preventDefault();
    const res = await this.props.API.API_deleteChannel(this.props.selectedChannel);
    this.setState({
      channelDeletionResult: res,
    });
    
    if(res === 1) { this.props.switchDialogState(-1); }
    return true;
  }

  render() {
    const channel = this.props.getChannel(this.props.selectedChannel)
    if(channel === undefined) {  return null; }

    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0); }} style={{ opacity: 0.3 }}></div>
        <div className="absolutepos overlaybox2" style={{ left: this.props.boxX, top: this.props.boxY, height: channel.author.id === this.props.session.userID ? 45 : 30  }}>
          {
            channel.author.id === this.props.session.userID ?
            <div>
              <div className="button2 hover alignmiddle chatColor" onClick={() => { this.props.switchDialogState(11); }}>
                <p className="white text1">> Edit Channel</p>
              </div>
              <div className="button2 hover alignmiddle chatColor" onClick={(e) => { this.handleDelete(e); }}>
                <p className="declineColor text1">> Delete Channel</p>
              </div>
              {channel.type === 2 ?
              <div className="button2 hover alignmiddle chatColor" onClick={() => { this.props.switchDialogState(12); }}>
                <p className="white text1">> Add Friends</p>
              </div> : ""}
            </div> :
            ""
          }
          <div className="button2 hover alignmiddle chatColor" onClick={() => { this.props.copyID(this.props.selectedChannel); }}>
            <p className="white text1">> Copy ID</p>
          </div>
        </div>
      </div>
    );
  }
}