/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React, {Component} from 'react';
import {connect} from 'react-redux';
import { MapContainer, Marker, ImageOverlay } from 'react-leaflet';
import {CRS, Icon, divIcon} from 'leaflet';
import { bindActionCreators } from 'redux';
import { questUnlocked, getAge, isLoggedInAndLoaded, getActivePlayerData, getAreaIconUrl } from '../../_utils';
import { selectQuest, toggleBubble, openTree, getQuests } from '../../../actions/index';

class Leaflet extends Component {
    constructor(props) {
        super(props)
        this.state = {
            lat: 18,
            lng: 45,
            zoom: 4.25,
            leafletMap: null,
        }
    }

    componentDidMount() {
      // if(this.props.journey.quests && (this.props.journey.quests.length === 0 || this.props.journey.quests.error)) {
      //   console.log('Loading quests', this.props.getQuests());
      // }
    }

    componentDidUpdate() {
      // If the leafletMap was already initialized
      if (this.state && this.state.leafletMap) {
        // We move the map with a nice animation
        this.state.leafletMap.flyTo(this.getPosition(), this.state.zoom);
      }
    }

    openQuest(questKey) {
      console.log('Quest clicked');
      this.props.toggleBubble(false);
      this.props.selectQuest(questKey);
    }

    renderPins() {
      if (isLoggedInAndLoaded(this.props)) {
        return Object.keys(this.props.journey.quests).map((questKey) => {
          let quest = this.props.journey.quests[questKey];

          if (getAge(this.props.journey).index >= quest.visibleAtAge) {
            if (quest.positionTop && quest.positionLeft) {
              let position = [100-quest.positionTop, quest.positionLeft];
              let iconImg = new divIcon({
                iconSize: [50, 65],
                iconAnchor: position,
                html: `<div class='pinWrapper ${quest.status} ${questUnlocked(quest, this.props.journey) ? `${quest.valley}` : `locked`} ${quest.id}'>
                        <div class='pin bounce'>
                          <div class='inner'  style="background-image: url('${getAreaIconUrl(quest, this.props.journey)}');"></div>
                        </div>
                        <div class='pulse'></div>
                      </div>`
              });
              return <Marker
                key={questKey}
                icon={iconImg}
                position={position}
                eventHandlers={{
                  click: () => this.openQuest(questKey)
                }}
                />
            }
            else {
              console.error('Parameters positionTop & positionLeft not defined for this quest!', quest);
            }
          }
        });
      }
    }

    renderTent() {
      if (isLoggedInAndLoaded(this.props)) {
        let ageData = getAge(this.props.journey);
        return <Marker
          className='tent'
          icon={
            new Icon({
              className:'tent',
              iconUrl: `/images/tent-${ ageData.index + 1 }.png`,
              iconSize: [100,100],
              iconAnchor: [57,35]
            })
          }
          position={[57,35]}
          eventHandlers={{
            click: () => this.props.openTree() /*openProfile*/ 
          }}
          />;
      }
    }

    getMapImageUrl() {
      if (isLoggedInAndLoaded(this.props)) {
        let ageData = getAge(this.props.journey);
        if (ageData.image) {
          return ageData.image;
        }
        else {
          let index = (ageData.index < 4) ? ageData.index : 'all';
          return `images/map-${this.props.activePlayerData.journey}-${index}.jpg`;
        }
      }
      // Default is first age map #placeholder
      else {
        return `data/music/images/map-music-0.jpg`;
      }
    }

    getPosition() {
      let position = [this.state.lat, this.state.lng];

      if(isLoggedInAndLoaded(this.props)) {
        let currentAge = getAge(this.props.journey);
        if (currentAge.position) {
          position = currentAge.position
        }
      }

      return position;
    }

    render() {
        return (
          <MapContainer
            classname={`leafletMap`}
            style={ { height: `${100*((window.outerHeight - 50)/window.outerHeight)}%`, }}
            center={this.getPosition()}
            zoom={this.state.zoom}
            crs={CRS.Simple}
            attributionControl={false}
            minZoom='3.5'
            maxZoom='5.5'
            zoomSnap='0.25'
            zoomDelta='0.25'
            whenReady={(map) => {
              // Store the reference to the leaflet map object in the state
              this.setState({
                leafletMap: map.target
              })
            }}
            >
              <ImageOverlay
                bounds={[[0,0], [100,100]]}
                url={ this.getMapImageUrl() }
              />
              {/* { this.renderTent() } */}
              { this.renderPins() }
          </MapContainer>
        )
    }
}

const mapStateToProps = (state) => {
    return {
      journey: state.journey,
      activePlayer: state.activePlayer,
      activePlayerData: getActivePlayerData(state),
      players: state.players,
    };
  }

function mapDispatchToProps(dispatch) {
  return bindActionCreators({ selectQuest, toggleBubble, openTree, getQuests }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Leaflet);