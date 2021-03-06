const React = require('react');
const ReactNative = require('react-native');
const {
  Dimensions,
  View,
  Animated,
  ScrollView,
  Platform,
  StyleSheet,
  ViewPagerAndroid,
  InteractionManager,
} = ReactNative;

const DefaultTabBar = require('./DefaultTabBar');
const ScrollableTabBar = require('./ScrollableTabBar');

const ScrollableTabView = React.createClass({
  statics: {
    DefaultTabBar,
    ScrollableTabBar,
  },

  propTypes: {
    tabBarPosition: React.PropTypes.oneOf(['top', 'bottom', 'overlayTop', 'overlayBottom', ]),
    initialPage: React.PropTypes.number,
    page: React.PropTypes.number,
    onChangeTab: React.PropTypes.func,
    onScroll: React.PropTypes.func,
    renderTabBar: React.PropTypes.any,
    style: View.propTypes.style,
    contentProps: React.PropTypes.object
  },

  getDefaultProps() {
    return {
      tabBarPosition: 'top',
      initialPage: 0,
      page: -1,
      onChangeTab: () => {},
      onScroll: () => {},
      contentProps: {}
    };
  },

  getInitialState() {
    return {
      currentPage: this.props.initialPage,
      scrollValue: new Animated.Value(this.props.initialPage),
      containerWidth: Dimensions.get('window').width,
    };
  },

  componentWillReceiveProps(props) {
    if (props.page >= 0 && props.page !== this.state.currentPage) {
      this.goToPage(props.page);
    }
  },

  goToPage(pageNumber) {
    this.props.onChangeTab({ i: pageNumber, ref: this._children()[pageNumber], });

    if (Platform.OS === 'ios') {
      const offset = pageNumber * this.state.containerWidth;
      this.scrollView.scrollTo({x: offset, y: 0});
    } else {
      this.scrollView.setPage(pageNumber);
    }

    this.setState({currentPage: pageNumber, });
  },

  renderTabBar(props) {
    if (this.props.renderTabBar === false) {
      return null;
    } else if (this.props.renderTabBar) {
      return React.cloneElement(this.props.renderTabBar(), props);
    } else {
      return <DefaultTabBar {...props} />;
    }
  },

  renderScrollableContent() {
    if (Platform.OS === 'ios') {
      return (
        <ScrollView
          horizontal
          pagingEnabled
          automaticallyAdjustContentInsets={false}
          style={styles.scrollableContentIOS}
          contentContainerStyle={styles.scrollableContentContainerIOS}
          contentOffset={{ x: this.props.initialPage * this.state.containerWidth, }}
          ref={(scrollView) => { this.scrollView = scrollView; }}
          onScroll={(e) => {
            const offsetX = e.nativeEvent.contentOffset.x;
            this._updateScrollValue(offsetX / this.state.containerWidth);
          }}
          onMomentumScrollBegin={(e) => {
            const nativeEvent = e.nativeEvent;
            const currentScrollValue = nativeEvent.contentOffset.x / this.state.containerWidth;
            const currentPage = Math.floor(currentScrollValue);
            const totalPages = nativeEvent.contentSize.width/nativeEvent.layoutMeasurement.width;

            if (!((0 < currentPage+1) && (currentPage+1 < totalPages))) return;

            if ((currentScrollValue % 1 > 0) && (currentPage == this.state.currentPage )) {
              setTimeout(() => {
                if (this.state.scrollValue._value > currentScrollValue)
                  this._updateSelectedPage(currentPage + 1);
              }, 60)

            } else if ((currentScrollValue % 1 < 1) && (currentPage != this.state.currentPage )) {
              setTimeout(() => {
                if (this.state.scrollValue._value < currentScrollValue)
                  this._updateSelectedPage(currentPage);
              }, 60)
            }
          }}
          onMomentumScrollEnd={(e) => {
            const offsetX = e.nativeEvent.contentOffset.x;
            this._updateSelectedPage(parseInt(offsetX / this.state.containerWidth, 10));
          }}
          scrollEventThrottle={16}
          showsHorizontalScrollIndicator={false}
          scrollEnabled={!this.props.locked}
          directionalLockEnabled
          alwaysBounceVertical={false}
          keyboardDismissMode="on-drag"
          {...this.props.contentProps}>
          {this._children().map((child, idx) => {
            return <View
              key={child.props.tabLabel + '_' + idx}
              style={{width: this.state.containerWidth, }}>
              {child}
            </View>;
          })}
        </ScrollView>
      );
    } else {
      return (
        <ViewPagerAndroid
         style={styles.scrollableContentAndroid}
         initialPage={this.props.initialPage}
         onPageSelected={this._updateSelectedPage}
         keyboardDismissMode="on-drag"
         onPageScroll={(e) => {
           const { offset, position, } = e.nativeEvent;
           this._updateScrollValue(position + offset);
         }}
         ref={(scrollView) => { this.scrollView = scrollView; }}
         {...this.props.contentProps}>
         {this._children().map((child, idx) => {
           return <View
             key={child.props.tabLabel + '_' + idx}
             style={{width: this.state.containerWidth, }}>
             {child}
           </View>;
         })}
        </ViewPagerAndroid>
      );
    }
  },

  _updateSelectedPage(currentPage) {
    let localCurrentPage = currentPage;
    if (typeof localCurrentPage === 'object') {
      localCurrentPage = currentPage.nativeEvent.position;
    }
    this.setState({currentPage: localCurrentPage, }, () => {
      this.props.onChangeTab({ i: localCurrentPage, ref: this._children()[localCurrentPage], });
    });
  },

  _updateScrollValue(value) {
    this.state.scrollValue.setValue(value);
    this.props.onScroll(value);
  },

  _handleLayout(e) {
    const { width, } = e.nativeEvent.layout;

    if (width !== this.state.containerWidth) {
      this.setState({ containerWidth: width, });
      InteractionManager.runAfterInteractions(() => {
        this.goToPage(this.state.currentPage);
      });
    }
  },

  _children() {
    return React.Children.map(this.props.children, (child) => child);
  },
  render() {
    let overlayTabs = (this.props.tabBarPosition === 'overlayTop' || this.props.tabBarPosition === 'overlayBottom');
    let tabBarProps = {
      goToPage: this.goToPage,
      tabs: this._children().map((child) => child.props),
      activeTab: this.state.currentPage,
      scrollValue: this.state.scrollValue,
      containerWidth: this.state.containerWidth,
    };

    if (this.props.tabBarUnderlineColor) {
      tabBarProps.underlineColor = this.props.tabBarUnderlineColor;
    }
    if (this.props.tabBarBackgroundColor) {
      tabBarProps.backgroundColor = this.props.tabBarBackgroundColor;
    }
    if (this.props.tabBarActiveTextColor) {
      tabBarProps.activeTextColor = this.props.tabBarActiveTextColor;
    }
    if (this.props.tabBarInactiveTextColor) {
      tabBarProps.inactiveTextColor = this.props.tabBarInactiveTextColor;
    }
    if (this.props.tabBarTextStyle) {
      tabBarProps.tabBarTextStyle = this.props.tabBarTextStyle;
    }
    if (this.props.tabBarTextUnderlineStyle) {
      tabBarProps.tabBarTextUnderlineStyle = this.props.tabBarTextUnderlineStyle;
    }
    if (this.props.tabBarStyle) {
      tabBarProps.tabBarStyle = this.props.tabBarStyle;
    }
    if (overlayTabs) {
      tabBarProps.style = {
        position: 'absolute',
        left: 0,
        right: 0,
        [this.props.tabBarPosition === 'overlayTop' ? 'top' : 'bottom']: 0
      };
    }

    return (
      <View style={[styles.container, this.props.style, ]} onLayout={this._handleLayout}>
        {this.props.tabBarPosition === 'top' && this.renderTabBar(tabBarProps)}
        {this.renderScrollableContent()}
        {(this.props.tabBarPosition === 'bottom' || overlayTabs) && this.renderTabBar(tabBarProps)}
      </View>
    );
  },
});

module.exports = ScrollableTabView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollableContentContainerIOS: {
    flex: 1,
  },
  scrollableContentIOS: {
    flexDirection: 'column',
  },
  scrollableContentAndroid: {
    flex: 1,
  },
});
