<template>
 <div>
    <div class="home">
        <div class="header">
            <van-row>
                <div @click="cityClick" >
                <van-col span="5" class="city">{{city}} ▼</van-col>
                </div>
                <van-col span="19" >
                    <div class="search-box" ref="searchBox">
                        <van-icon name="search" class="icon"/>
                        <input ref="input"  @focus="focus"  class="box" v-model="value" type="text" placeholder="请输入搜索关键词">
                        <van-icon name="clear" @click="value=''"  v-show="value" class="clear"/>
                    </div>
                    <transition name="bouncee">
                        <div class="quxiao" v-show="query" @click="closeSearch">取消</div>
                    </transition>
                </van-col>
            </van-row>
        </div>
    <div v-show="!showFlag"  class="content" @touchmove.prevent='touchmove' @touchstart.prevent='touchstart' @touchend.prevent='touchend'>
        <Scroll :listenScroll='listenScroll' @scroll='scroll' :probeType='probeType'  :data='recommend.hotGoods' class="content-scroll" :bounce='bounce' ref="scroll">
            <div>
                <div class="swiper">
                    <van-row>
                        <van-swipe :autoplay="6000">
                            <van-swipe-item v-for="(val, index) in recommend.slides" :key="val.goodsId">
                                <img :src="val.image" class="swiper-img"/>
                            </van-swipe-item>
                        </van-swipe>
                    </van-row>    
                </div>
                <div class="panl">
                    <ul v-show="recommend.category && recommend.category.length">
                        <li v-for="(val,index) of recommend.category" :key="val.mallCategoryId" @click="item(val,index)">
                            <img :src="val.image" alt="" srcset="">
                            <p>{{val.mallCategoryName}}</p>
                        </li>
                    </ul>
                    <div class="ad">
                        <img :src="advertesPicture" alt="" srcset="">
                    </div>
                </div>
                <HomeRecommend :recommend='recommend.recommend'/>
                <HomeFoor :floorName='floorName.floor1' :foor1='recommend.floor1' :num='num1'/>
                <HomeFoor :floorName='floorName.floor2' :foor1='recommend.floor2' :num='num2'/>
                <HomeFoor :floorName='floorName.floor3' :foor1='recommend.floor3' :num='num3'/> 
                <HomeHot :hot='recommend.hotGoods'/>
            </div>
        </Scroll>
         <BaseRefresh :opacity='opac' :transformY='transformY' :rotate='rotate' :isRotate='isRotate' :trans='trans'/>
     </div>
</div>
     <BaseLoding :showFlag='showFlag'/>
     <HomeSearch v-show="query" :list='serachList' @details='searchDetails' :len='len' :value='value' @vals='vals'/>
     <router-view/>

 </div>

</template>

<script>
import HomeRecommend from './components/HomeRecommend'
import HomeFoor from './components/HomeFoor'
import HomeHot from './components/HomeHot'
import HomeSearch from './components/HomeSearch'
import Scroll from 'pages/other/Scroll'
import BaseRefresh from 'pages/other/BaseRefresh'
import {mapActions,mapMutations,mapGetters} from 'vuex'
import {loading} from 'js/mixin'
import {throttle} from 'js/util'
export default {
    mixins: [loading],
    data() {
        return {
            value: '',
            recommend: {},
            advertesPicture: '',
            num1: 1,
            num2: 2,
            num3: 3,
            bounce: {
                top:false,
            },
            probeType: 3,
            listenScroll: true,
            floorName: '',
            touch: {},
            transformY: 0,
            rotate: 0,
            isRotate: false,
            trans: false,
            opac: 0,
            currentCity: '',
            serachList: [],     // 搜索结果
            query: false,       // 显示搜索
            len: false,        // 是否含有搜索结果
        }
    },
    
    components: {
        HomeRecommend,
        HomeFoor,
        HomeSearch,
        HomeHot,
        Scroll,
        BaseRefresh,
    },

    computed: {
        ...mapGetters(['city'])
    },

    methods: {
        onSearch() {
            console.log('搜索');
        },
        scroll(e) {
            Math.abs(e.y) == 0 ? this.touch.scroll = true : this.touch.scroll = false
            if (this.transformY > 0) {
                this.$refs.scroll.disable()
            }
        },
        
        touchstart(e) {
            this.isRotate = false
            this.trans = false
            this.touch.init = true
            this.touch.startY = e.touches[0].pageY        //第一次点击的位置
        },
        touchmove(e) {
            if (!this.touch.scroll || !this.touch.init || e.touches[0].pageY > window.innerHeight) return
            let pageY = e.touches[0].pageY
            let daltaY = pageY -  this.touch.startY   //滑动的位置
            this.transformY = Math.max(0, daltaY / 3.5)
            this.rotate = Math.max(0,Math.min(360,daltaY) ) 
            if (this.transformY > 80 ) this.touch.isRotate = true
            this.opac = daltaY / 320
        },
        async touchend(e) {
            this.$refs.scroll.enable()
            if (this.transformY > 0) this.trans = true
            this.isRotate = true
            if (!this.touch.isRotate ) {
                 this.transformY = 0
                 this.isRotate = false
                 setTimeout(() => {
                     this.opac = 0
                 }, 300);
            } else {
                this.touch.isRotate = false
                if (this.transformY > 100) {
                    // 请求接口刷新数据
                    try {
                        const {data} = await this.Api.recommend()
                        if (data.code == 200) {
                            const datas = data.data
                            this.recommend = datas
                            this.advertesPicture = datas.advertesPicture.PICTURE_ADDRESS
                            this.floorName = datas.floorName
                            setTimeout(() => {
                                this.transformY = 0
                                this.rotate = 0
                                
                            }, 1000);
                            setTimeout(() => {
                                this.isRotate = false
                                this.opac = 0
                                this.Toast('刷新成功')
                            }, 1500);
                        }
                    } catch (error) {
                        this.Toast('刷新失败,网络错误')
                    }
                    
                }  else {
                    console.log('小于80');
                    this.transformY = 0
                    this.rotate = 0
                    this.isRotate = false
                }
            }
        },

        details(val) {
            let id = {
                goodsId: val.goodsId
            }
            this.setGoodDetails(id)
            this.$router.push({path:`/home/details`,query: {id:val.goodsId}})
        },
        
        searchDetails(id) {
            this.$refs.input.blur()
            this.$router.push({path:`/home/details`,query: {id}})
        },

        ...mapActions(['setTab']),

        ...mapMutations({
            setGoodDetails: 'GOODSDETAILS'
        }),

        cityClick() {
            this.$router.push({path: '/city'})
        },

        async getHome() {
            try {
                this.showFlag = true
                const {data} = await this.Api.recommend()
                if (data.code == 200) {
                    this.showFlag = false
                    this.recommend = data.data
                    this.advertesPicture = data.data.advertesPicture.PICTURE_ADDRESS
                    this.floorName = data.data.floorName
                    this.setTab(data.data.category)
                }
            } catch (error) {
                this.showFlag = false
                this.Toast('网络错误')
            }
        },

        // 跳转到商品分类
        item(val,index) {
            const id = val.bxMallSubDto[0].mallSubId
            this.$router.push({
                name: `Category`,
                params: {
                    id,
                    index,
                    val
                }
            })
        },

        //搜索
        async search(value) {
            try {
                this.len = false
                const {data} = await this.Api.search(value)
                //console.log( data )
                    this.serachList = data
                    if (!this.serachList.length) {
                        this.len = true
                    }
            } catch (error) {
                console.log( error )
                this.len = false
                this.Toast('网络错误')
            }
            
        },

        // 取消搜索
        onCancel() {
            this.value = ''
            
        },

        focus(){
            let width =  '85%'
            this.tran(width)
            this.query = true
        },

        closeSearch(){
            let width =  '100%'
            this.tran(width)
            this.query = false
            this.value = ''
        },

        tran(width) {
            this.$refs.searchBox.style.width = width;
            this.$refs.searchBox.style['transitionDuration'] = '.3s'
        },

        vals(val) {
            console.log(val);
            this.value = val
        } 
    },
    
    created() {
        this.getHome()
        // 节流函数处理
        this.$watch('value',throttle((newQuery) => {
            this.serachList = []
            if (this.value) {
                this.search(this.value)
            } 
        },500,1000))
    },

    watch: {
        city() {
            this.getHome()
        },
    }
}
</script>
<style lang="less" scoped>
@color: #F2F2F2;
.header {
    line-height: 44px;
    position: relative;
    z-index: 10;
    background: #eee;
    .city {
        text-align: center;
        background: @color;
        font-size: 12px;
        position: relative;
        max-width: 120px;
        .icon {
            transform: rotate(270deg);
            position: absolute;
            top: 35%;
            right: -12%
        }
    }
}
.content {
    position: fixed;
    top: 44px;
    left: 0;
    right: 0;
    bottom: 50px;
    .content-scroll {
        height: 100%;
        overflow: hidden;
        .swiper {
        height: 0;
        padding-bottom: 53.33%;
        overflow: hidden;
    .swiper-img {
        width: 100%;
        height: 200px;
    }
    }
    .panl {
        background: #EEEEEE;
        padding: 15px 0 25px 0;
        ul {
            width: 95%;
            margin: 0 auto;
            border-radius: 10px;
            padding: 15px 0px 7px 0px;
            box-sizing: border-box;
            display: flex;
            background: #fff;
            box-shadow: 3px 4px 20px rgba(45,45,45,.15);
            li {
                flex: 1;
                text-align: center;
                img {
                    width: 70%;
                    margin-bottom: 10px;
                }
                p {
                    font-size: 14px
                }
            }
        }
        .ad {
            width: 100%;
            margin-top: 10px;
            img {
                width: 100%;
            }
        }
    }
    }
    
}
     .search-box {
         display: -webkit-box;
        display: -ms-flexbox;
        display: flex;
        -webkit-box-align: center;
        -ms-flex-align: center;
        align-items: center;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        width: 100%;
        height: 44px;
        background: #eee;
        position: relative;
        .icon {
            font-size: 16px;
            color: #222;
            position: absolute;
            left: 10px;
        }
        .box {
            -webkit-box-flex: 1;
            -ms-flex: 1;
            flex: 1;
            line-height: 18px;
            background: #fff;
            color: #333;
            font-size: 14px;
            outline: 0;
            margin-right: 5px;
            border-radius: 5px;
            padding: 7px;
            padding-left: 32px;
            -webkit-box-sizing: border-box;
            box-sizing: border-box;
        }
        .clear {
            position: absolute;
            right: 12px;
            color: #999;
        }
     }
    .quxiao {
        position: absolute;
        right: 8px;
        top: 0%;
        font-size: 16px;
    }
 
.bouncee-enter-active {
        animation: bounce-in .3s;
    }
.bouncee-leave-active {
        animation: bounce-in .1s reverse;
    }
@keyframes bounce-in {
    0% {
        transform: translate3d(100%,0,0)
    }
    
    100% {
        transform: translate3d(0,0,0)
    }
} 
</style>