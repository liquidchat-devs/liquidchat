import React from 'react';

export default class MessageOptionsDialog extends React.Component {
  state = {
    messageDeletionResult: 0
  };

  handleDelete = async e => {
    e.preventDefault();
    const res = await this.props.API.API_deleteMessage(this.props.selectedMessage);
    this.setState({
      messageDeletionResult: res,
    });
    
    if(res === 1) { this.props.switchDialogState(-1); }
    return true;
  }

  handleEdit = async e => {
    e.preventDefault();
    const res = 1
    this.props.setEditedMessage(this.props.selectedMessage.text == null ? "" : this.props.selectedMessage.text);
    this.props.startEditingMessage(this.props.selectedMessage);
    
    if(res === 1) { this.props.switchDialogState(-1); }
    return true;
  }

  render() {
    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.switchDialogState(0); }} style={{ opacity: 0.3 }}></div>
        <div className="absolutepos overlaybox2" style={{ left: this.props.boxX, top: this.props.boxY, height: this.props.selectedMessage.author.id === this.props.session.userID ? 90 : 30 }}>
          {
            this.props.selectedMessage.author.id === this.props.session.userID ?
            <div className="button2 alignmiddle chatColor" onClick={(e) => { this.handleDelete(e); }}>
              <p className="white text1">> Delete</p>
            </div> :
            ""
          }
          {
            this.props.selectedMessage.author.id === this.props.session.userID ?
            <div className="button2 alignmiddle chatColor" onClick={(e) => { this.handleEdit(e); }}>
              <p className="white text1">> Edit</p>
            </div> :
            ""
          }
          {
            this.props.selectedMessage.file == null ? "" :
            <div className="button2 alignmiddle chatColor" onClick={(e) => { this.props.copyID(this.props.fileEndpoint + "/" + this.props.selectedMessage.file.name); }}>
              <p className="white text1">> Copy link to file</p>
            </div>
          }
          <div className="button2 alignmiddle chatColor" onClick={() => { this.props.copyID(this.props.selectedMessage.id); }}>
            <p className="white text1">> Copy ID</p>
          </div>
        </div>
      </div>
    );
  }
}