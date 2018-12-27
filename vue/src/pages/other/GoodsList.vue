<template>
    <!-- 商品列表组件 -->
        <ul>
        <li v-for="(item,index) in list" :key="item._id || item.id" class="good-item border-bottom" @click="details(item)">
            <img :src="imageUrl(item)" :onerror="defaultImg" :class="{img2:isBrowse || isCollection || isOrder}">
            <div>
                <p class="p1">{{item.name || item.good && item.good.name}}</p>
                <p class="p2">
                    <span class="pic" v-if="isOrder">￥{{(item.price * item.qty).toFixed(2)}}</span>
                    <span class="pic" v-else>￥{{item.present_price}}</span>
                    <span class="orl-pic">{{item.orl_price}}</span>
                    <span class="count" v-if="isOrder">x{{item.qty}}</span>
                </p>
                
            </div>
            <div class="icon" v-if="isBrowse || isCollection">
                    <van-icon name="close" class="close" @click.stop="close(item,index)"/>
                </div>
        </li>
        </ul>
</template>

<script>
export default {
    props: {
        list: {
            type: Array,
            default: []
        },

        isBrowse: {
            type: Boolean,
            default: false
        },

        isCollection: {
            type: Boolean,
            default: false
        },

        isOrder: {
            type: Boolean,
            default: false
        }
        
    },

    computed: {
        lists() {
            return this.isBrowse ? 'list': ''
        }
    },

    data() {
        return {
             defaultImg: 'this.src="' + require('img/vue.jpg') + '"',
        }
    },

    methods: {
        details(item) {
            this.$emit('details',item)
        },

        // 清除单条浏览记录
        close(item,index) {
            this.$emit('close',item,index)
        },

        imageUrl(good) {
            return 'https://img2.guolele.com/' + ( good.pic_url || good.good.pic_url );
        }
    }
}
</script>

<style lang="stylus" scoped>
ul
    background #fff
    .good-item
        height 100px
        display flex
        padding 10px 15px
        box-sizing border-box
        position relative
        &.list-enter-active, &.list-leave-active 
            transition all .1s linear
        &.list-enter, &.list-leave-to
            height 0
        img 
            flex 0 0 30%
            width 30%
            height 90%
            border 1px solid #eee
        .img2
            flex 0 0 25%
            width 25%
            height 100%    
        div 
            flex 1    
            p
                text-align left
                padding-left 20px
            .p1
                margin-bottom 20px
                color #f00
                line-height 1.4
                overflow:hidden; 
                text-overflow:ellipsis
                display:-webkit-box
                -webkit-box-orient:vertical
                -webkit-line-clamp:2
            .p2    
                .orl-pic
                    text-decoration: line-through
                    font-size 13px
                .count
                    float right    
                .pic
                    color #f00
                    font-weight 700
                    margin-right 5px 
        .icon
            position absolute
            display inline
            right 10px
            bottom 0
            .close
                padding 10px   

</style>
