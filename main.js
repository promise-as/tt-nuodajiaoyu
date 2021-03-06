import Vue from 'vue'
import App from './App'
import store from './store'

Vue.config.productionTip = false

Vue.prototype.setData = function(obj) {
	let that = this;
	let keys = [];
	let val, data;
	Object.keys(obj).forEach(function(key) {
		keys = key.split('.');
		val = obj[key];
		data = that.$data;
		keys.forEach(function(key2, index) {
			if (index + 1 == keys.length) {
				that.$set(data, key2, val);
			} else {
				if (!data[key2]) {
					that.$set(data, key2, {});
				}
			}
			data = data[key2];
		})
	})
}
Vue.prototype.url = 'https://px.thea.cn/Px/Api'

Vue.prototype.$store = store

App.mpType = 'app'

const app = new Vue({
	store,
    ...App
})
app.$mount()
