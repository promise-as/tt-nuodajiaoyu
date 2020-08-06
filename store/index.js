import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
	state: {
		hasLogin: false,
		user: null,
		testvuex: false,
		channel: null,
		currentTime:0
	},
	mutations: {
		//触发login类型的mutation时，调用此函数
		saveUser(state, user) {
			state.user = user;
			uni.setStorage({
				key: 'user',
				data: state.user,
				success: function() {
					console.log(state.user)
				}
			});
		},
		login(state) {
			state.hasLogin = true;
			console.log('vuexlogin')
		},
		setTestTrue(state) {
			state.testvuex = true
		},
		setTestFalse(state) {
			state.testvuex = false
		},
		saveChannel(state,channel){
			state.channel = channel;
		},
		saveCurrentTime(state,currentTime){
			state.currentTime = currentTime;
		}
	},
	actions: {
		goLogin(context, detail) {
			return new Promise((resolve, rej) => {
				uni.checkSession({
					success: res => {
						uni.login({
							// provider: 'weixin',
							success: res => {
								console.log(res);
								var code = res.code;
								if (detail) {
									if (detail.encryptedData) {
										console.log('授权电话登录')
										uni.request({
											url: 'https://px.thea.cn/Px/Api/wxUserData',
											method: 'GET',
											data: {
												'code': code,
												'encryptedData': detail.encryptedData,
												'iv': detail.iv,
												'site':2
											},
											success: res => {
												console.log(res)
												if (res.data.msg == "OK") {
													var data = JSON.parse(res.data.data);
													var phoneNumber = data.phoneNumber;
													var user = {
														nickname: '电话**' + phoneNumber.substring(phoneNumber.length - 4),
														phone: phoneNumber,
														openid:res.data.openid
													}
													saveData(user);
												}else{
													uni.showToast({
														title: '解析失败,错误代码' + res.data.msg,
														icon:'none'
													});
												}

											},
											fail: () => {
												showtoast();
											}
										});
									} 
								} 

								function saveData(user) {
									console.log('saveData()');
									uni.setStorageSync('user', user);
									context.commit('saveUser', user);
									context.commit('login');
									resolve();
								}
							}
						})
					},
					fail: () => {
						uni.login({
							// provider: 'weixin',
							success: res => {
								var tit = '系统繁忙，请重试！'
								showtoast(tit);
							}
						});
					}
				})

			})

		}
	}
})

export default store
