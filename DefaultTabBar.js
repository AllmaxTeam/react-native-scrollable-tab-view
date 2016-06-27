'use strict';

var React = require('react-native');
var {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  ScrollView,
  Dimensions
} = React;

var screen_width = Dimensions.get('window').width;

var styles = StyleSheet.create({
  tab: {
    justifyContent: 'center',
    marginLeft: 20,
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

  counterBubble: {
    marginTop: 4,
    marginLeft: 5,
    height: 12,
    width: 17,
    borderRadius: 4.5,
    alignItems: 'center',
    justifyContent: 'center'
  },
  counterText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
    fontFamily : "Open Sans",
    backgroundColor: 'transparent',
    top: -0.5
  }
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
      renderUnderline: false,
      tabScrollValue: 0
    })
  },

  componentWillMount() {
    this.tabState = {}
  },

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.activeTab === this.props.activeTab) return;

    const overscrollValue = 50;
    let curTabLayout = this.tabState[this.props.activeTab];

    if ((curTabLayout.x + curTabLayout.width - this.state.tabScrollValue) > screen_width) {
        let scrollValue = curTabLayout.x + curTabLayout.width - screen_width;
        if (this.props.tabs.length != this.props.activeTab + 1) scrollValue += overscrollValue;
        this.refs.scrolltabs.scrollTo({x: scrollValue, y: 0});

    } else if (curTabLayout.x < this.state.tabScrollValue) {
        if (this.props.activeTab === 0) this.refs.scrolltabs.scrollTo({x: 0, y: 0});
        else this.refs.scrolltabs.scrollTo({x: curTabLayout.x - overscrollValue, y: 0});
    };
  },

  onTabLayout(event, page) {
    var {x, y, width, height} = event.nativeEvent.layout;
    this.tabState[page] = {x: x, y: y, width: width, height: height};
    if (this.props.tabs.length === Object.keys(this.tabState).length)
      this.setState({renderUnderline: true});
  },

  renderTabOption(tab, page) {
    var isTabActive = this.props.activeTab === page;
    var activeTextColor = this.props.activeTextColor || "navy";
    var inactiveTextColor = this.props.inactiveTextColor || "black";
    var textStyle = this.props.tabBarTextStyle || {};
    var tabCounter = tab.tabCounter || 0;

    return (
      <TouchableOpacity style={[styles.tab]}
                        key={tab.tabLabel}
                        onPress={() => this.props.goToPage(page)}
                        onLayout={(event) => this.onTabLayout(event, page)}>
        <View style={{flexDirection: 'row'}}>
          <Text style={[{color: isTabActive ? activeTextColor : inactiveTextColor,
                         fontWeight: isTabActive ? '400' : '400'}, textStyle]}>{tab.tabLabel}</Text>
          {tabCounter > 0 ?
            <View style={[styles.counterBubble, {backgroundColor: tab.tabCounterColor || activeTextColor}]}>
              <Text style={styles.counterText}>{tabCounter || 0}</Text>
            </View>
            : null}

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
      height: 2,
      bottom: 0
    };

    return (
      <Animated.View style={[tabUnderlineStyle, {left}, {width}]} />
    )
  },

  render() {
    return (
      <View style={[styles.tabs, {backgroundColor : this.props.backgroundColor || null}, this.props.style, this.props.tabBarStyle]}>
        <ScrollView horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    ref={"scrolltabs"}
                    bounces={false}
                    scrollEventThrottle={16}
                    onScroll={(e) => {this.setState({tabScrollValue: e.nativeEvent.contentOffset.x})}}>
          {this.props.tabs.map((tab, i) => this.renderTabOption(tab, i))}
          {this.state.renderUnderline ? this.renderUnderline() : null}
        </ScrollView>
      </View>
    );
  },
});

module.exports = DefaultTabBar;
