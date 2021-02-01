import React from 'react';

export default class SearchMessagesDialog extends React.Component {
  state = {
    currentFace: this.getRandomFace()
  }

  render() {
    let channel = this.props.functions.getChannel(this.props.state.currentChannel)
    var searches = this.props.state.searches === -1 ? null : this.props.state.searches.map((message, i) => {
        let messageHTML = this.props.functions.getFormattedMessage(this, message);
        return (
          <div key={i} className="paddingtop2 paddingbot2 flex message hover">
            {messageHTML}
          </div>
        )
    });

    return (
      <div>
        <div className="absolutepos overlay2" onClick={() => { this.props.functions.switchDialogState(0); this.props.functions.setSearches(-1); }}></div>
        <div className="absolutepos overlaybox10">
          <div className="searchSection1">
            <div className="text white prspace">Search: </div>
            <div className="searchedTermText">{this.props.state.searchedTerm.length === 0 ? this.state.currentFace : this.props.state.searchedTerm}</div>
            <div className="searchedTermText2"> in #{channel.name}</div>
            <div className="searchedTermText3">{this.props.state.searches === -1 ? "" : " (" + this.props.state.searches.length + ")"}</div>
          </div>
          <div className="searchSection2">
            {searches}
          </div>
        </div>
      </div>
    );
  }

  getRandomFace() {
    let array = [
      ">w<",
      ">~<",
      ">.<",
      ">..<",
      ">//<",
      ">v<",
      ">o<",
      ">x<",
      ">-<"
    ]

    return array[Math.floor(Math.random() * array.length)];
  }
}