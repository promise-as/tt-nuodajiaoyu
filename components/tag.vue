<template>
	<view class="tag">
		<view class="tag-1 tag-box" v-if="state == '-1'">
			<view class="tag-l">
				<view class="txt">
					预约
				</view>
			</view>
			<view class="tag-r">
				{{num}}预约
			</view>
		</view>
		<view class="tag-2 tag-box" v-if="state == '0'">
			<view class="tag-l">
				<view class="txt">
					<view class="icon-live">
						<text class="live-1"></text>
						<text class="live-2"></text>
						<text class="live-3"></text>
					</view>
					直播中
				</view>
			</view>
			<view class="tag-r">
				{{num}}观看
			</view>
		</view>
		<view class="tag-3 tag-box" v-if="state == '1'">
			<view class="tag-l">
				<view class="txt">
					回看
				</view>
			</view>
			<view class="tag-r">
				{{num}}观看
			</view>
		</view>
		<view class="tag-3 tag-box" v-if="state == '2'">
			<view class="tag-l">
				<view class="txt">
					已结束
				</view>
			</view>
			<view class="tag-r">
				{{num}}观看
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		name: 'tag',
		props: {
			state: {
				type: String
			}
		},
		computed: {
			num: function randomNum(minNum, maxNum) {
				minNum = 200;
				maxNum = 360;
				return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
			}
		},
		created() {
			// console.log(this.state)
		}
	}
</script>

<style lang="scss">
	@-webkit-keyframes lanimation {
		from {
			height: 12rpx;
		}

		50% {
			height: 22rpx;
		}

		to {
			height: 12rpx;
		}
	}

	.tag {
		position: absolute;
		left: 24rpx;
		top: 54rpx;

		.tag-box {
			height: 40rpx;
			line-height: 40rpx;
			background-color: rgba($color: #000000, $alpha: 0.5);
			border-radius: 20rpx;

			.tag-l {
				display: inline-block;
				background-image: linear-gradient(270deg,
					#f9a75e 0%,
					#f8d685 100%);
				border-radius: 20rpx;
				padding-right: 10rpx;
				padding-left: 10rpx;
				font-size: 0;

				.txt {
					padding-left: 28rpx;
					font-size: 24rpx;
					color: #fff;
					background: url(../static/images/icon-time.png) no-repeat left center;
					background-size: 22rpx auto;
				}
			}

			.tag-r {
				display: inline-block;
				font-size: 24rpx;
				color: #fff;
				padding: 0 16rpx 0 16rpx;
			}

			&.tag-2 {
				.tag-l {
					background-image: linear-gradient(270deg,
						#e31c1b 0%,
						#fe523a 100%);

					.txt {
						background: none;
						padding: 0;
					}
				}

				.icon-live {
					display: inline-block;

					text {
						display: inline-block;
						margin-right: 4rpx;
						width: 4rpx;
						height: 12rpx;
						background-color: #fff;
						border-radius: 2rpx;
						animation: lanimation 1s linear infinite;
						animation-delay: 0.6s;

						&.live-2 {
							animation-delay: 0.8s;
						}

						&.live-3 {
							animation-delay: 1s;
						}
					}
				}
			}

			&.tag-3 {
				.tag-l {
					background-image: linear-gradient(270deg,
						#61cd78 0%,
						#a6dca0 100%);

					.txt {
						background-image: url(../static/images/icon-back.png);
					}
				}
			}
		}
	}
</style>
