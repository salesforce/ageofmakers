/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React, {Component} from 'react';
import {connect} from 'react-redux';
import { bindActionCreators } from 'redux';
import { isLoggedInAndLoaded, journeyIds, getActivePlayerData } from '../../_utils';
import { getPlayers, logIn, logOut, setNewPlayer, setActivePlayerJourney, removePlayer } from '../../../actions/index';


class Onboarding extends Component {
    constructor(props){
        super(props)
        this.state = {
          userName: '',
          newUserUi: false,
          userIdToLogin: null,
        }
    }

    componentDidMount() {
      if (!this.props.players) {
        this.props.getPlayers();
      }
    }

    startNewUserCreation(e) {
      console.log('Creating new user:', this.state.userName);
      e.preventDefault(); 
      this.props.setNewPlayer(this.state.userName);
      this.setState({ userName: '', newUserUi: false, userIdToLogin: Object.keys(this.props.players).length });
      return false;
    }

    backToPlayerSelect(e) {
      e.preventDefault();
      this.setState({ userName: '', newUserUi: false });
      return false;
    }

    startRemovingPlayer(playerId) {
      console.log('Remove player:', playerId);
      let deleteConfirmation = confirm("You're sure you want to delete this player?");
      if (deleteConfirmation) {
        this.props.removePlayer(playerId);
      }
    }

    logIn(e, playerId) { 
      if (e.target.className == 'player-name') { 
        this.props.logIn(playerId);
      }
    }

    renderCancelButton() {
      if (this.props.players && Object.keys(this.props.players).length) {
        return <input type="button" className="btn btn-cancel" value="Cancel" onClick={(e) => { return this.backToPlayerSelect(e); }}/>;
      }
    }

    selectPlayerJourney(journey) {
      console.log('click', journey);
      if (journey === 'music') {
        this.props.setActivePlayerJourney(journeyIds.JOURNEY_MUSIC);
      }
      else if (journey === 'ftc') {
        this.props.setActivePlayerJourney(journeyIds.JOURNEY_FTC);
      }
    }

    renderOnboarding() {
      // If a user was just created, log him in once the user is saved.
      if (this.state.userIdToLogin !== null && this.state.userIdToLogin >= 0) {
        if (!this.props.players || (this.props.players && !Object.keys(this.props.players).length)) {
          this.props.getPlayers();
        }
        else {
          this.props.logIn(this.state.userIdToLogin.toString());
          this.setState({ userIdToLogin: null });
        }
        
      }

      if (!this.props.activePlayerData && (!this.props.activePlayer || this.props.activePlayer === -1 )) {
        if (this.state.newUserUi || !this.props.players || (this.props.players && !Object.keys(this.props.players).length) ) {
          return <form className="name-form">
            <label htmlFor="playerName">
              <h1>Hi! 👋</h1>
              <h1>Welcome to your new adventure 🚀</h1>
              <h3>Let's get you all set-up for the fun.</h3>
            </label>
            <input
              type="text"
              id="playerName"
              placeholder="First, type your name here!"
              value={ this.state.userName }
              onChange={ e => this.setState({ userName: e.target.value }) }
              className="player-name" />
              { this.renderCancelButton() }
            <input type="submit" className="btn btn-login" value="Let's do it!" onClick={(e) => { return this.startNewUserCreation(e); }}/>
            <div className="clear-both"></div>
          </form>;
        }
        else if (this.props.activePlayerData && !this.props.activePlayerData.journey) {
          return <div>
            <h1>{ `Okay ${this.props.activePlayerData.name}, pick your journey! 👀` }</h1>
          </div>
        }
        else {
          return <div>
            <h1>Hi! 👋</h1>
            <h3>Click on a player name to get started.</h3>
            {Object.keys(this.props.players).map((playerId) => {
              let player = this.props.players[playerId];

              return <div className="player" onClick={ (e) => { this.logIn(e, playerId); } }>
                <div className="player-name">{ player.name }</div>
                <button className="btn-delete" onClick={() => { this.startRemovingPlayer(playerId) }}>X</button>
              </div>
            })}
            <button className="btn btn-login" onClick={() => { this.setState({ newUserUi: true }) }}>+ New Player</button>
          </div>;
        }
      }
      else {
        return <div>
          <h1>Okay Kim, time to select your journey! 🏞</h1>
          <h3>Click on an icon to get started.</h3>

          <div className="journeys">
            <div className="journey" onClick={ (e) => { this.selectPlayerJourney('music'); } }>
              <div className="journey-icon">
                <img src="images/music-for-the-sdg-logo.png" alt="Music for the SDGs"/>
              </div>
              <div className="journey-details">
                <div className="journey-title">Music for the Global Goals</div>
                <div className="journey-description">Write and produce your first song to advocate and help solve for the world’s biggest challenges.</div>
              </div>
            </div>
            <div className="journey disabled" onClick={ (e) => { this.selectPlayerJourney('ftc'); } }>
              <div className="journey-icon">
                <img src="images/ftc-logo.png" alt="Future Trailblazer Challenge"/>
              </div>
              <div className="journey-details">
                <div className="journey-title">Future Trailblazer Challenge</div>
                <div className="journey-description">Use cutting edge technologies like 3D printing or Artificial Intelligence to find innovative solutions to the world’s biggest challenges.</div>
              </div>
            </div>
            <div className="clear-both"></div>
          </div>
          <input type="button" className="btn btn-cancel" value="Cancel" onClick={ this.props.logOut }/>
        </div>
      }
    }

    render() {
        return(
            <div className={ (isLoggedInAndLoaded(this.props)) ? "onboardingWrapper" : "onboardingWrapper open"}>
                <div className="overlay"></div>
                <div className="onboarding">
                  { this.renderOnboarding() }
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
      journey: state.journey,
      activePlayer: state.activePlayer,
      activePlayerData: getActivePlayerData(state),
      players: state.players,
    };
  };

function mapDispatchToProps(dispatch) {
    return bindActionCreators({getPlayers, logIn, logOut, setNewPlayer, removePlayer, setActivePlayerJourney}, dispatch);
}
  
export default connect(mapStateToProps, mapDispatchToProps)(Onboarding);