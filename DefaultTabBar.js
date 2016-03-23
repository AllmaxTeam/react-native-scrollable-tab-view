'use strict';

var React = require('react-native');
var {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
} = React;


var styles = StyleSheet.create({
  tab: {
    justifyContent: 'center',
    marginRight: 30,
    paddingBottom: 10,
  },

  tabs: {
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomColor: '#d2d2d2',
  },
});

var DefaultTabBar = React.createClass({
  propTypes: {
    goToPage: React.PropTypes.func,
    activeTab: React.PropTypes.number,
    tabs: React.PropTypes.array,
    underlineColor : React.PropTypes.string,
    backgroundColor : React.PropTypes.string,
    activeTextColor : React.PropTypes.string,
    inactiveTextColor : React.PropTypes.string,
  },

  getInitialState() {
    return ({
      renderUnderline: false
    })
  },

  componentWillMount() {
    this.tabState = {}
  },

  onTabLayout(event, page) {
    var {x, y, width, height} = event.nativeEvent.layout;
    this.tabState[page] = {x: x, y: y, width: width, height: height};
    if (this.props.tabs.length === Object.keys(this.tabState).length) this.setState({renderUnderline: true})
  },

  renderTabOption(name, page) {
    var isTabActive = this.props.activeTab === page;
    var activeTextColor = this.props.activeTextColor || "navy";
    var inactiveTextColor = this.props.inactiveTextColor || "black";
    var textStyle = this.props.tabBarTextStyle || {};

    return (
      <TouchableOpacity style={[styles.tab]}
                        key={name}
                        onPress={() => this.props.goToPage(page)}
                        onLayout={(event) => this.onTabLayout(event, page)}>
        <View>
          <Text style={[{color: isTabActive ? activeTextColor : inactiveTextColor,
                         fontWeight: isTabActive ? '400' : '400'}, textStyle]}>{name}</Text>
        </View>
      </TouchableOpacity>
    );
  },

  renderUnderline() {
    var inputRange = Object.keys(this.tabState);
    var outputRangeLeft = [];
    var outputRangeWidth = [];

    for (var k in this.tabState) {
      outputRangeLeft.push(this.tabState[k].x);
      outputRangeWidth.push(this.tabState[k].width);
    }

    var left = this.props.scrollValue.interpolate({
      inputRange: inputRange, outputRange: outputRangeLeft
    });

    var width = this.props.scrollValue.interpolate({
      inputRange: inputRange, outputRange: outputRangeWidth
    })

    var tabUnderlineStyle = {
      position: 'absolute',
      backgroundColor: this.props.underlineColor || "navy",
      height: 1,
      bottom: 0
    };

    return (
      <Animated.View style={[tabUnderlineStyle, {left}, {width}]} />
    )
  },

  render() {
    return (
      <View style={[styles.tabs, {backgroundColor : this.props.backgroundColor || null}, this.props.style, ]}>
        {this.props.tabs.map((tab, i) => this.renderTabOption(tab, i))}
        {this.state.renderUnderline ? this.renderUnderline() : null}
      </View>
    );
  },
});

module.exports = DefaultTabBar;
