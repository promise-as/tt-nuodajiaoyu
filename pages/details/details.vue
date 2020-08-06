<template>
	<view class="content details">
		<!-- 进入页面初始界面 -->
		<view class="public-con" v-if="!showVideo"><uParse :content="detail.intro" /></view>
		<view class="btn-box" v-if="!showVideo">
			<view class="live-btn" v-if="hasLogin && detail.id" @tap="goLive()">{{ btnTxt }}</view>
			<button v-if="!hasLogin" open-type="getPhoneNumber" @getphonenumber="myLogin" class="live-btn">{{ btnTxt }}</button>
		</view>
		<!-- 回放界面 -->
		<view class="back-con-box" v-if="showVideo">
			<view class="h1 one bgw">{{ detail.title }}</view>
			<!-- 回放视频 -->
			<!-- <view class="video-box"><txv-video :vid="vid" :autoplay="true" playerid="txv1"></txv-video></view> -->
			<video
			  src="http://sf1-ttcdn-tos.pstatp.com/obj/ttfe/test/test-upload.mp4"
			  id="myVideo"
			  style="width: 240px; height: 180px;"
			/>
			
			<view style="display: flex; justify-content: space-between; align-items: center;">
			  <button bindtap="play" size="mini">Play</button>
			  <button bindtap="pause" size="mini">Pause</button>
			  <button bindtap="stop" size="mini">Stop</button>
			</view>
			<view class="con bgw">
				<view class="lesson">
					<view class="tabs">
						<view class="tab" @tap="onTabSwitch(1)" :class="tabId == 1 ? 'xn-tit-2' : ''">课程简介</view>
						<view class="tab" v-if="detail.fj" @tap="onTabSwitch(2)" :class="tabId == 2 ? 'xn-tit-2' : ''">课程目录</view>
					</view>
					<view class="tab-card">
						<view class="txt" v-if="tabId == 1"><uParse :content="detail.intro" /></view>
						<view class="txt txt-2" v-if="tabId == 2">
							<view v-for="(item, index) in detail.fj" :key="index">
								<view class="list-box" @tap="goChapter(item.backurl, item.cid, item.token)">
									<view class="title">章节{{ index + 1 }}:{{ item.title }}</view>
									<view class="flex btm">
										<view class="time"><tsFormatTime :time="item.starttime"></tsFormatTime></view>
										<view class="read flex">
											<num />
											次学习
										</view>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex';
import md5 from '@/common/js/MD5.js';
import tsFormatTime from '@/components/tsFormatTime.vue';
import uParse from '@/components/uParse/src/wxParse.vue';
import num from '@/components/num.vue';
import util from '@/common/js/util.js';

export default {
	components: {
		tsFormatTime,
		uParse,
		num
	},
	data() {  
		return {
			state: '',
			backurl: '', // 视频地址
			btnTxt: '',
			id: '',
			detail: {},
			vid: '',
			showVideo: false,
			tabId: 1
		};
	},
	onLoad(options) {
		uni.login({})
		this.state = options.state;
		this.id = options.id;
		this.getLive();
		this.btnTxt = '播放视频';

		uni.showShareMenu({
			withShareTicket: true
		});
		
		
	},
	onReady: function () {
	    this.videoCtx = tt.createVideoContext("myVideo");
	  },
	  play: function () {
	    this.videoCtx.play();
	  },
	  pause: function () {
	    this.videoCtx.pause();
	  },
	  stop: function () {
	    this.videoCtx.stop();
	  },
	computed: {
		...mapState(['hasLogin', 'user'])
	},
	methods: {
		...mapMutations(['saveUser']),
		...mapActions(['goLogin']),
		getLive() {
			// 获取正在直播详情
			var data = {
				id: this.id,
				token: md5('THEA2020.$' + this.id)
			};
			// 2.获取直播详情
			util.http(this.url + '/liveDyInfoId', data, res => {
				var data = res.data.data;
				if (data.backurl.length > 0) {
					var str = data.backurl;
					this.vid = str.slice(str.lastIndexOf('vid') + 4);
				}
				this.detail = data;
			});
		},
		myLogin(e) {
			console.log(e.detail.errMsg, 123);
			var that = this;
			if (e.detail.errMsg == 'getPhoneNumber:fail user deny') {
				return false;
			} else {
				// console.log(e.detail, '授权成功')
				// this.goLogin(e.detail).then(() => {
				// 	that.goLive();
				// });
				that.goLive();
			}
		},
		goLive() {
			console.log('去看直播')
			var user = this.user;
			console.log(user, 111) // user: null
			var detail = this.detail;
			var that = this;
			var data = {
				title: detail.title,
				starttime: detail.starttime,
				// openid: user.openid,
				// phone: user.phone
			};
			
			if (this.state == 0) {
				var liveArr = user.liveArr || [];
				// 正在直播
				console.log('进入直播');
				if (liveArr.indexOf(this.id) == -1) {
					util.http(this.url + '/recordmessagext', data, res => {
						console.log('首次进入直播首次进入直播', res);
					});
					// 添加点击过的直播课到缓存
					liveArr.push(this.id);
					user.liveArr = liveArr;
					this.saveUser(user);
				}
				// 进入直播
				this.geeLive(this.detail.cid,this.detail.token);
			} else if (this.state == 1) {
				// 回看
				console.log('进入回看');
				this.showVideo = true;
				uni.pageScrollTo({
					scrollTop: 0
				});
			} else if (this.state == 2) {
				// 直播已结束 无回看
				return;
			} else if (this.state == -1) {
				// 报名
				var lessonArr = user.lessonArr || [];
				if (lessonArr.indexOf(this.id) == -1) {
					// 用户没有预约过
					uni.showModal({
						title: '报名成功',
						content: '系统将在开播前30分钟提醒您',
						showCancel: false,
						confirmText: '确定',
						success: res => {
							console.log('成功成功成功');
							uni.requestSubscribeMessage({
								tmplIds: ['-kEalO76sTmos2aDFO3_sZJ7GI8oZqCSvq7g6hlS2cM'],
								success(res) {
									console.log('订阅消息订阅消息', res);
									if ((res.errMsg = 'requestSubscribeMessage:ok')) {
										// url
										util.http(this.url + '/recordmessagext', data, res => {
											console.log('记录消息记录消息记录消息', res);
										});
									}
								}
							});
						}
					});
					// 添加预约课到缓存
					lessonArr.push(this.id);
					user.lessonArr = lessonArr;
					this.saveUser(user);
				} else {
					// 重复报名
					uni.showToast({
						title: '您已报名直播，无需重复报名',
						icon: 'none'
					});
				}
			}
		},
		saveLesson() {
			var user = this.user;
			var lessonArr = user.lessonArr || [];
			if (lessonArr.indexOf(this.id) == -1) {
				// 用户没有预约过
				lessonArr.push(this.id);
			} else {
				this.isOrder = 1;
			}
			user.lessonArr = lessonArr;
			this.saveUser(user);
		},
		onTabSwitch(index) {
			this.tabId = index;
		},
		goChapter(backurl, id, token) {
			if (backurl.length > 0) {
				this.vid = backurl.slice(backurl.lastIndexOf('vid') + 4);
			} else {
				this.geeLive(id,token)
			}
		},
		geeLive(id,authcode){
			var liveData = {
				id: id, //课堂id`````
				title: this.detail.title, //直播主题
				status: 1, //直播状态 0未开始 1直播中
				num: 555, //在线人数
				pic: parseInt(Math.random() * 4 + 1), //左边的图片1-4
				ctx: 'training', //webcast or training
				authcode: authcode, //加入密码 可选```````
				site: 'huixue.gensee.com' //站点域名`````
			};
			// var liveData = {
			// 	id:  'ODLlAkThal', //课堂id`````
			// 	title: this.detail.title, //直播主题
			// 	status: 1, //直播状态 0未开始 1直播中
			// 	num: 555, //在线人数
			// 	pic: parseInt(Math.random() * 4 + 1), //左边的图片1-4
			// 	ctx: 'training', //webcast or training
			// 	authcode: '383029', //加入密码 可选```````
			// 	site: 'huixue.gensee.com'//站点域名`````
			// };
			uni.navigateTo({
				url: '../video/video?item='+JSON.stringify(liveData)
			});
		}
	}
};
</script>

<style lang="scss">
@import url('../../components/uParse/src/wxParse.css');
page {
	background-color: #fff;
}
.details {
	.tabs {
		padding: 0 30rpx;
	}
	.tab-card {
		.wxParse .p {
			margin: 0;
		}
		.txt-2 {
			padding: 0 30rpx;
			margin-top: -15rpx;
		}
	}
	.lesson {
		.tab {
			display: inline-block;
			position: relative;
			margin-bottom: 20rpx;
			padding-top: 40rpx;
			font-size: 36rpx;
			color: #333333;
			font-weight: bold;
			margin-right: 20rpx;
		}
		.list-box {
			border-bottom: 2rpx solid #efefef;
			padding: 20rpx 0;
			.title {
				font-size: 32rpx;
				line-height: 1.6;
				margin-bottom: 10rpx;
			}
		}
		.btm {
			font-size: 28rpx;
			justify-content: flex-start;
		}
		.time {
			margin-right: 20rpx;
		}
	}

	.h1 {
		font-weight: bold;
		font-size: 36rpx;
		color: #111;
		line-height: 130rpx;
	}

	.video-box {
		width: 100vw;
		height: auto;
	}

	.con {
		padding: 0 0 30rpx 0;
		position: relative;
	}

	.live-btn {
		position: fixed;
		left: 30rpx;
		bottom: 16rpx;
		width: 690rpx;
		height: 88rpx;
		line-height: 88rpx;
		text-align: center;
		background-image: linear-gradient(-90deg, #1d7be4 0%, #78befd 100%);
		box-shadow: 0 7rpx 10rpx 0 rgba(32, 124, 228, 0.25);
		border-radius: 44rpx;
		font-size: 32rpx;
		color: #fff;
	}

	.live-time {
		position: relative;
		left: 130rpx;
		bottom: 144rpx;
		width: 490rpx;
		height: 64rpx;
		line-height: 64rpx;
		box-shadow: 0px 0px 35px 0px rgba(255, 101, 65, 0.25);
		border-radius: 10px;
		background: url(https://img.thea.cn/public/platform/thea/202003/xiaoniu/images/live-time.png) no-repeat center;
		background-size: 100% 100%;

		.txt-l {
			font-size: 26rpx;
			color: #333;
			padding: 0 24rpx;
			display: inline-block;
		}

		.txt-r {
			font-size: 30rpx;
			color: #fff;
			padding-left: 20rpx;
			position: relative;
			display: inline-block;

			.formatime {
				font-size: 30rpx;
				color: #fff;
			}
		}
	}
}
</style>
