import React from 'react';

export default class MessageOptionsDialog extends React.Component {
  state = {
    messageDeletionResult: 0
  };

  handleDelete = async e => {
    e.preventDefault();
    const res = await this.props.API.endpoints["deleteMessage"]({ id: this.props.state.selectedMessage.id });
    this.setState({
      messageDeletionResult: res,
    });
    
    if(res === 1) { this.props.functions.switchDialogState(-1); }
    return true;
  }

  handleEdit = async e => {
    e.preventDefault();
    const res = 1
    this.props.functions.setEditedMessage(this.props.state.selectedMessage.text == null ? "" : this.props.state.selectedMessage.text);
    this.props.functions.startEditingMessage(this.props.state.selectedMessage);
    
    if(res === 1) { this.props.functions.switchDialogState(-1); }
    return true;
  }

  render() {
    return (
      <div>
        <div className="absolutepos overlay" onClick={() => { this.props.functions.switchDialogState(0); }} style={{ opacity: 0.3 }}></div>
        <div className="absolutepos overlaybox2" style={{ left: this.props.state.boxX, top: this.props.state.boxY, height: this.props.state.selectedMessage.author.id === this.props.state.session.userID ? 90 : 30 }}>
          {this.props.state.selectedMessage.author.id === this.props.state.session.userID ? this.props.elements.getContextButton("Delete", (e) => { this.handleDelete(e); }, "var(--color8)") : "" }
          {this.props.state.selectedMessage.author.id === this.props.state.session.userID ? this.props.elements.getContextButton("Edit", (e) => { this.handleEdit(e); }) : ""}
          {this.props.state.selectedMessage.file == null ? "" : this.props.elements.getContextButton("Copy link to file", (e) => { this.props.functions.copyID(this.props.state.fileEndpoint + "/" + this.props.state.selectedMessage.file.name); })}
          {this.props.state.selectedMessage.file == null ? "" : this.props.elements.getContextButton("Open link to file", (e) => { window.open(this.props.state.fileEndpoint + "/" + this.props.state.selectedMessage.file.name, -1); })}
          {this.props.elements.getContextButton("Copy ID", (e) => { this.props.functions.copyID(this.props.state.selectedMessage.id); })}
        </div>
      </div>
    );
  }
}