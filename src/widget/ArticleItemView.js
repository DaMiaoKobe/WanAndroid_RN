import React, {PureComponent} from "react";
import {StyleSheet, Text, View, Image, TouchableNativeFeedback} from "react-native";
import {withNavigation} from 'react-navigation';

import * as config from "../config";
import AccountUtils from "../utils/AccountUtils";
import HintUtils from "../utils/HintUtils";
import HttpUtils from "../http/HttpUtils";

class App extends PureComponent {

    constructor() {
        super();
        this.state = {
            refresh: false
        }
    }

    render() {
        const {navigation, item} = this.props;
        return <TouchableNativeFeedback onPress={() => {
            navigation.navigate('Web', {
                url: item.link,
                title: item.title
            })
        }}>
            <View style={styles.item}>
                <View style={{flex: 1, flexDirection: 'row'}}>
                    <Text style={styles.normalText}>
                        {item.author}
                    </Text>
                    <Text style={[styles.normalText, {color: 'red', marginLeft: 5}]}>
                        {item.fresh ? "新" : ""}
                    </Text>
                    <Text style={[styles.normalText, {color: 'red', marginLeft: 5}]}>
                        {item.isTop ? "置顶" : ""}
                    </Text>
                    <Text style={[styles.normalText, {flex: 1, textAlign: 'right'}]}>
                        {item.niceDate}
                    </Text>
                </View>
                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', marginTop: 5}}>
                    {this.getImage(item)}
                    <View style={{flex: 1}}>
                        <Text style={styles.title} numberOfLines={1} ellipsizeMode={'tail'}>
                            {item.title}
                        </Text>
                        {this.getDesc(item)}
                    </View>
                </View>
                <View style={{marginTop: 5, flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={[styles.normalText, {flex: 1}]}>
                        {item.superChapterName}/{item.chapterName}
                    </Text>
                    <TouchableNativeFeedback onPress={this.switchFavorite.bind(this)}>
                        <Image
                            source={item.collect ? require("../../res/ic_favorite.png") : require("../../res/ic_favorite_not.png")}
                            style={{width: 25, height: 25}}
                        />
                    </TouchableNativeFeedback>
                </View>
            </View>
        </TouchableNativeFeedback>;
    }

    getImage(item) {
        if (item.envelopePic) {
            return <Image
                source={{uri: item.envelopePic}}
                style={{width: 120, height: 100, marginRight: 5, borderRadius: 8}}
            />;
        } else {
            return null;
        }
    }

    getDesc(item) {
        if (item.desc) {
            return <Text style={[styles.normalText, {marginTop: 10}]} numberOfLines={3} ellipsizeMode={'tail'}>
                {item.desc}
            </Text>;
        } else {
            return null;
        }
    }

    async switchFavorite() {
        const name = await AccountUtils.getUserName();
        if (name === null || name === '') {
            this.props.navigation.navigate('Login');
            HintUtils.toast("请先登录");
        } else {
            const cookie = await AccountUtils.getCookie();
            const item = this.props.item;
            HttpUtils.post('lg/' + (item.collect ? 'uncollect_originId/' : 'collect/') + item.id + '/json', {'Cookie': cookie})
                .then(() => {
                    HintUtils.toast(item.collect ? "已取消收藏" : "收藏成功");
                    item.collect = !item.collect;
                    this.setState({
                        refresh: !this.state.refresh
                    })
                })
                .catch(() => {
                });
        }
    }
}

const styles = StyleSheet.create({
    item: {
        backgroundColor: "white",
        flex: 1,
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 10,
        paddingRight: 10
    },
    normalText: {
        fontSize: 14,
        color: config.textColorSecondary,
    },
    title: {
        color: config.textColorPrimary,
        fontSize: 16,
    }
});

export default withNavigation(App);