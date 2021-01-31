import React from 'react';

export default class ElementBuilder {
    constructor(_main) {
        this.mainClass = _main;
    }

    getContextButton(text, callback, color) {
      return <div className="button2 hover alignmiddle chatColor" onClick={(e) => { callback(e); }}>
        <p className="white text1" style={color === undefined ? { } : { color: color }} >&gt; {text}</p>
      </div>
    }
}