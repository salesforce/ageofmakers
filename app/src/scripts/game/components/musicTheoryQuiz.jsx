/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React, {Component} from 'react';
import {connect} from 'react-redux';
import { bindActionCreators } from 'redux';
import { getActiveQuestData } from '../../_utils';
import { } from '../../../actions/index';
import ResponsivePiano from './responsivePiano';

class MusicTheoryQuiz extends Component {
  constructor(props) {
    super(props);

    this.state = {
      lastNotePlayed: null,
      noteInScale: null,
      selectedKey: 48
    }
  }

  createScaleFromKey() {
    if(this.state.selectedKey){
      let scaleNotes = [this.state.selectedKey - 12];
      for (let octaveIndex = 0; octaveIndex < 3; octaveIndex++) {
        for (let scaleIndex = 0; scaleIndex < 7; scaleIndex++) {
          let lastNoteCalculated = scaleNotes[scaleNotes.length - 1];
          // If its half a note
          if (scaleIndex == 2 || scaleIndex == 6){
            scaleNotes.push(lastNoteCalculated + 1);
          }
          // If it is a whole note
          else{ 
            scaleNotes.push(lastNoteCalculated + 2);
          }
        }
      }
      console.log(scaleNotes);
      return scaleNotes;
    }
    // Using: this.state.selectedKey
    // With the WWHWWWH (W = +2 / H = +1)
  }

  notePlayed(midiNote) {
    console.log('Check note', midiNote, 'against the key', this.state.selectedKey);

    const scaleNotes = this.createScaleFromKey();

    let scaleResult = scaleNotes.find((note) => {
      return note === midiNote;
    });

    if (scaleResult !== undefined) {
      console.log("The note is in the scale", midiNote);
      this.setState({
        lastNotePlayed: midiNote,
        noteInScale: true,
      });
    }
    else {
      console.log("The note is out of scale", midiNote);
      this.setState({
        lastNotePlayed: midiNote,
        noteInScale: false,
      });
    }
  }

  renderNoteResult() {
    if (this.state.lastNotePlayed === null) {
      return <p className="text-center">Click on any key to get started.</p>;
    }
    else {
      if (this.state.noteInScale) {
        return <p className="text-center text-success">Good job! This note is in the selected scale.</p>
      }
      else {
        return <p className="text-center text-danger">Oops! This note is not in the selected scale.</p>
      }
    }
  }

  handleChange(event) {
    this.setState({selectedKey: parseInt(event.target.value)});
  }

  render() {
    if (this.props.question && this.props.activeQuestData) {

      return <div className="musicTheoryQuizWrapper">
        <h4>{ this.props.question.name }</h4>
        <label htmlFor="key">Choose a scale:</label>
        <select name="key" value={this.state.selectedKey} onChange={(event) => { this.handleChange(event); }}>
          <option value={45}>A</option>
          <option value={47}>B</option>
          <option value={48}>C</option>
          <option value={50}>D</option>
          <option value={52}>E</option>
          <option value={53}>F</option>
          <option value={55}>G</option>
        </select>
        
        <ResponsivePiano className="piano" onPlayNoteInput={(midiNote) => { this.notePlayed(midiNote); }} />
        { this.renderNoteResult() }
      </div>
    }
    else {
      return <div>Loading...</div>
    }
  }
}

const mapStateToProps = (state) => {
  return {
    embeddedPage: state.embeddedPage,
    activeQuest: state.activeQuest,
    activeQuestData: getActiveQuestData(state),
  };
};

function mapDispatchToProps(dispatch) {
return bindActionCreators({ }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(MusicTheoryQuiz);