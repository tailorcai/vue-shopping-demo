<template>
    <!-- 我的订单列表 -->
<transition name='bounce'>
    <div class="order-warp">
        <BaseTitle :back='back' title="我的订单" @goBack='goBack'/>
        <van-tabs v-model="active" @change='change'>
            <van-tab :title="val" v-for="(val,index) in tabs" :key="index">
                <Scroll v-show="!showFlag" :data='list' ref="scroll" class="scroll">
                    <div class="wap">
                        <div class="list-warp" v-if="value.state==active" v-for="(value,index) in list" :key="val.order_id"> 
                            <div class='top border-bottom'>
                                <div>订单编号: {{value.id}}</div>
                                <div class="order-ok">{{status(value.state)}}</div>
                            </div>
                            <div class="list" v-for="(val,index) in value.items" :key="val.id">
                                <img class="good-img" :src="imageUrl(val.good)" :onerror="defaultImg">
                                <div class="good-title">{{val.good.name}}</div>
                                <div class="good-count">
                                    <p>￥{{val.amount}}</p>
                                    <p class="count">x{{val.qty}}</p>
                                </div>
                            </div>
                            <div class="timre bottom border-top">创建时间: {{value.created_at}}</div>
                            <div class="bottom">收货地址: {{value.address}}</div>
                            <div class="bottom">共 {{value.items.length}} 件商品   合计: {{value.amount}}</div>
                        </div>
                    </div>
                    <div v-if="!list.length && !showFlag" class="null">
                        {{userName&&!showFlag? '暂无订单~~' : '请先登录噢~~'}}
                    </div>
                </Scroll>
            </van-tab>
        </van-tabs>
         <BaseLoding :showFlag='showFlag'/>
    </div>
</transition>  
</template>

<script>
import BaseTitle from 'pages/other/BaseTitle'
import GoodsList from 'pages/other/GoodsList'
import Scroll from 'pages/other/Scroll'
import {mapGetters} from 'vuex'
import {loading} from 'js/mixin'
export default {
    name: 'MyOarder',
    mixins: [loading],
    data() {
        return {
            back: true,
            active: 0,
            list: '',
            defaultImg: 'this.src="' + require('img/vue.jpg') + '"',
            tabs:['待支付','待发货','待收货','已完成'],
        }
    },

    computed: {
        ...mapGetters(['userName']),
    },

    components: {
        BaseTitle,
        GoodsList,
        Scroll
    },

    methods: {
        change(i) {
            this.active = i
        },
        goBack() {
            this.$router.go(-1)
        },
        status(status) {
            if (status == 0) {
                return '待支付'
            } else if(status == 1) {
                return '待发货'
            } else if(status == 2) {
                return '待收货'
            }else {
                return '已完成'
            }
        },
        async getMyOrder() {
            try {
                this.showFlag = true
                const {data} = await this.Api.getMyOrder()

                    this.showFlag = false
                    this.list = data
                    console.log( data )

            } catch (error) {
                this.Toast('网络错误')
                this.showFlag = false
            }
        },

        imageUrl(good) {
            return 'https://img2.guolele.com/' + ( good.pic_url );
        }
    },

    created() {
        let status = this.$route.query.status
        if (status) {
            this.active = status
        } 
        this.getMyOrder()
    },
}
</script>

<style lang="stylus" scoped>
.order-warp
    position fixed
    top 0
    left 0
    right 0
    bottom 0
    z-index 500
    background #Fff
    .scroll
        position fixed
        top 84px
        bottom 0px
        left 0
        right 0
        overflow hidden
        background #F2F2F2
        .wap
            padding 5px 0
            .list-warp
                margin 10px
                box-sizing border-box
                padding 15px 10px
                background #fff
                border-radius 10px
                .top
                    display flex
                    justify-content space-between
                    padding-bottom 10px
                    .order-ok
                        color #D2591B
                .list
                    display flex    
                    height 80px
                    margin-top 15px
                    font-size 0
                    .good-img
                        flex 0 0 80px
                        width 80px
                        height 100%
                        border-radius 10px
                        margin-right 10px
                        border 1px solid #eee
                    .good-title
                        flex 1
                        margin-top 3px
                        line-height 1.4
                        font-size 13px
                        letter-spacing 0.5px
                        margin-right 10px
                    .good-count
                        float 0 0 15%     
                        text-align right   
                        margin-top 5px
                        font-size 13px
                        .count
                            margin-top 5px
                            color #bbb
                .bottom
                    text-align right      
                    margin-top 10px    
                .timre
                    margin-top 10px
                    padding-top 10px
</style>

