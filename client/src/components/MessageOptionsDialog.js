import React from 'react';

export default class MessageOptionsDialog extends React.Component {
  state = {
    messageDeletionResult: 0
  };

  handleDelete = async e => {
    e.preventDefault();
    const res = await this.props.API.API_deleteMessage(this.props.state.selectedMessage.id);
    this.setState({
      messageDeletionResult: res,
    });
    
    if(res === 1) { this.props.switchDialogState(-1); }
    return true;
  }

  handleEdit = async e => {
    e.preventDefault();
    const res = 1
    this.props.setEditedMessage(this.props.state.selectedMessage.text == null ? "" : this.props.state.selectedMessage.text);
    this.props.startEditingMessage(this.props.state.selectedMessage);
    
    if(res === 1) { this.props.switchDialogState(-1); }
    return true;
  }

  render() {
    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0); }} style={{ opacity: 0.3 }}></div>
        <div className="absolutepos overlaybox2" style={{ left: this.props.state.boxX, top: this.props.state.boxY, height: this.props.state.selectedMessage.author.id === this.props.state.session.userID ? 90 : 30 }}>
          {
            this.props.state.selectedMessage.author.id === this.props.state.session.userID ?
            <div className="button2 hover alignmiddle chatColor" onClick={(e) => { this.handleDelete(e); }}>
              <p className="declineColor text1">&gt; Delete</p>
            </div> :
            ""
          }
          {
            this.props.state.selectedMessage.author.id === this.props.state.session.userID ?
            <div className="button2 hover alignmiddle chatColor" onClick={(e) => { this.handleEdit(e); }}>
              <p className="white text1">&gt; Edit</p>
            </div> :
            ""
          }
          {
            this.props.state.selectedMessage.file == null ? "" :
            <div className="button2 hover alignmiddle chatColor" onClick={(e) => { this.props.copyID(this.props.state.fileEndpoint + "/" + this.props.state.selectedMessage.file.name); }}>
              <p className="white text1">&gt; Copy link to file</p>
            </div>
          }
          <div className="button2 hover alignmiddle chatColor" onClick={() => { this.props.copyID(this.props.state.selectedMessage.id); }}>
            <p className="white text1">&gt; Copy ID</p>
          </div>
        </div>
      </div>
    );
  }
}