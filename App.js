/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    NativeAppEventEmitter,
    Dimensions,
    Button,
    Animated,
    FlatList,
    TouchableOpacity,
    Image,
    TextInput,
    ScrollView
} from 'react-native';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
var Geolocation = require('Geolocation');
const {width: deviceWidth, height: deviceHeight} = Dimensions.get('window')
import AMap from 'react-native-smart-amap'

type Props = {};
export default class App extends Component<Props> {

    constructor(props) {
        super(props)
        this.state = {
            data: [],
            longitude: '',
            latitude: '',
            loaded: false,
            keywords: '商务住宅|学校',
            dataArray: [],
            searchArray: [],
            isHidden: true
        }
    }

    componentDidMount() {

        NativeAppEventEmitter.addListener('amap.onPOISearchDone', this._onPOISearchDone)


            // this.addAppEventListener(
        NativeAppEventEmitter.addListener('amap.location.onLocationResult', this._onLocationResult),
        //     //NativeAppEventEmitter.addListener('amap.onPOISearchFailed', this._onPOISearchFailed)
        // )
        this.getCurrentPosition()
    }

    _onPOISearchDone=(data)=>{
        console.log('----_onPOISearchDone----:',data)
        this.setState({
            dataArray: data.searchResultList,
        })
    }

    getCurrentPosition(){
        Geolocation.getCurrentPosition(
            (location) => {
                console.log('---location----:',location)
                this.setState({
                    longitude: location.coords.longitude,
                    latitude: location.coords.latitude,
                    loaded: true
                },()=>{
                    setTimeout(()=>{
                        this.setState({
                            isHidden: false
                        })
                    },200)
                })
            },
            (error) => {
                alert("获取位置失败")
            },
        );
    }

    _onLocationResult = (result) => {

        console.log(`_onLocationResult...result`,result)
        this.setState({
            searchArray: result.searchResultList,
        })
    }


    _onLayout= (e) => {
        console.log('----_onLayout--:',e.nativeEvent)
    }

    _onDidMoveByUser = (e) => {
        // console.log('----_onDidMoveByUser--:',e.nativeEvent)
        this.setState({
            longitude: e.nativeEvent.data.centerCoordinate.longitude,
            latitude: e.nativeEvent.data.centerCoordinate.latitude,
        })
        this._searchNearBy(e.nativeEvent.data.centerCoordinate.latitude,e.nativeEvent.data.centerCoordinate.longitude)
    }

    _searchNearBy(latitude,longitude) {
        console.log('----_searchNearBy--:',latitude,longitude)
        let obj={
            page: 1,
            coordinate: {
                latitude: latitude,
                longitude: longitude,
            },
            keywords: this.state.keywords,
        }

        this._amap.searchPoiByCenterCoordinate(obj)
    }

  render() {

    if (!this.state.loaded){
        return(
            <View></View>
        )
    }

    return (
      <View style={styles.container}>
          <View style={{width:deviceWidth,height: deviceHeight}}>
              {
                  this.state.isHidden?(
                      null
                  ):(
              <AMap
                  ref={ component => this._amap = component }
                  style={{width:deviceWidth,height: deviceHeight/2,marginTop: 40}}
                  options={{
                            frame: {
                                width: deviceWidth,
                                height: deviceHeight/2
                            },
                            showsUserLocation: true,
                            userTrackingMode: Platform.OS == 'ios' ? AMap.constants.userTrackingMode.none : null,
                            centerCoordinate: {
                                latitude: this.state.latitude,
                                longitude: this.state.longitude,
                            },
                            zoomLevel: 18.1,
                            centerMarker: Platform.OS == 'ios' ? 'icon_location' : 'poi_marker',
                        }}
                  onLayout={this._onLayout}
                  onDidMoveByUser={this._onDidMoveByUser}
              />
                      )
              }

                <Image source={require('./redPin_lift.png')} style={styles.imageStyle}/>
                <View style={styles.topView}>
                    <TextInput style={styles.searchTextInput}
                               value={this.state.searchValue}
                               onChangeText={(value) =>{
                             this._amap.searchLocation(value)
                                                   this.setState({searchValue: value});
                                               }}
                               placeholder='请输入搜索内容'
                               placeholderTextColor="rgb(155,155,155)"
                               underlineColorAndroid="transparent"
                               autoCorrect={false}
                               autoCapitalize='none'
                    />
                    <AnimatedFlatList
                        data={this.state.searchArray}
                        legacyImplementation={false}
                        ref={(flatList)=>this._flatList = flatList}
                        renderItem={this._renderSearchComponent}
                        keyExtractor={(item, index) => 'search_list_'+index}
                    />
                </View>
                <AnimatedFlatList
                    data={this.state.dataArray}
                    legacyImplementation={false}
                    ref={(flatList)=>this._flatList = flatList}
                    renderItem={this._renderItemComponent}
                    onEndReached={()=>this._onEndReached()}
                    keyExtractor={(item, index) => 'dialog_list_'+index}
                />

          </View>
      </View>
    );
  }

    _onEndReached(){

    }

    _renderItemComponent=({item,index})=>{
        return(
            <TouchableOpacity style={styles.itemStyle}>
                <Text>{item.name}</Text>
                <Text style={{color: '#676767'}}>{item.address}</Text>
            </TouchableOpacity>
        )
    }

    _renderSearchComponent=({item,index})=>{
        let address=item.district+item.address+item.name
        return(
            <TouchableOpacity style={styles.itemSearchStyle} onPress={()=>{
                alert(address)
            }}>
                <Text>{address}</Text>
            </TouchableOpacity>
        )
    }


}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#efefef',
    },
    itemStyle: {
        width: '100%',
        height: 50,
        alignItems: 'center',
        backgroundColor:'#ffffff',
        justifyContent: 'center',
        marginTop: 1
    },
    itemSearchStyle: {
        width: '100%',
        height: 50,
        alignItems: 'center',
        backgroundColor:'#ffffff',
        justifyContent: 'center',
        borderBottomColor: '#efefef',
        borderBottomWidth: 1
    },
    imageStyle: {
        position: 'absolute',
        top: deviceHeight/2/2-36+50,
        left: deviceWidth/2-22
    },
    searchTextInput: {
        width: '100%',
        marginTop: 20,
        height: 40,
        paddingLeft: 10,
        backgroundColor: '#ffffff'
    },
    topView: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: deviceWidth
    }
});
