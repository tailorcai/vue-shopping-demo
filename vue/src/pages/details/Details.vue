<template>
<transition name='bounce'>
  <div class="goods" >
    <div >
    <van-swipe class="goods-swipe" :autoplay="3000">
      <van-swipe-item v-for="img in imageList" :key="img">
        <img :src="imageUrl(img)" :onerror="defaultImg">
      </van-swipe-item>
    </van-swipe>
    <div v-show="!showFlag">
    <van-cell-group>
      <van-cell>
        <div class="goods-title">{{ goods.name }}</div>
        <div class="goods-price">￥{{ goods.present_price }}</div>
      </van-cell>
      <van-cell class="goods-express">
        <van-col span="9">运费：{{ goods.express || 0}}</van-col>
        <van-col span="9">剩余：{{ goods.amount }}</van-col>
        <van-col span="6" class="like">{{!isCollectionFlag?'取消收藏':'收藏'}}：<van-icon :name="!isCollectionFlag?'like':'like-o'" @click="collection" class="like-o" :class="{like2:!isCollectionFlag}"/></van-col>
      </van-cell>
    </van-cell-group>
    <van-cell-group>
      <van-cell v-for="val in propList" :title="val.name" :value="val.real_value" :key="val.name"/>
    </van-cell-group>
    <van-cell-group class="goods-cell-group">
      <van-cell value="进入店铺" icon="shop" is-link>
        <template slot="title">
          <span class="van-cell-text">有赞的店</span>
          <van-tag class="goods-tag" type="danger">官方</van-tag>
        </template>
      </van-cell>
    </van-cell-group>

    <div>
       <van-tabs v-model="active"  class="datails-tabs" sticky>
        <van-tab v-for="val in item" :title="val.title" :key="val.id" >
          <div v-show="active == 0"  v-html="goodsDetails.description || goods.description"  class="active-0"></div>
          <div v-show="active == 1" class="active-1" >
              <div class='comment' v-for="val of comment" :key="val._id">
                <div class="comment-content">
                    <div class='avatar'><img :src="val.comment_avatar" alt="" srcset=""></div>
                    <div class='desc border-bottom'>
                        <p class='fist'>
                            <span class='name'>{{val.comment_nickname}}：</span>
                            <span class='num'>{{val.comment_time}}</span>
                        </p>
                        <p class="timer"><van-rate v-model="val.rate" readonly :size="12" color='#e0322b'/></p>
                        <p class='cont'>{{val.content}}</p>
                    </div>
                </div>
            </div>
            <div v-show="!comment.length" class="nocomment">该商品暂无评论噢~~</div>
          </div>
        </van-tab>
      </van-tabs>
    </div>
    <van-goods-action>
      <van-goods-action-mini-btn icon="home" @click="goHome">
        首  页
      </van-goods-action-mini-btn>
      <van-goods-action-mini-btn icon="cart" @click="onClickCart">
        购物车
      </van-goods-action-mini-btn>
      <van-goods-action-big-btn @click="addShops">
        加入购物车
      </van-goods-action-big-btn>
      <van-goods-action-big-btn primary @click="purchase">
        立即购买
      </van-goods-action-big-btn>
    </van-goods-action>
    
    <transition name='bounce2'>
      <div class="sku" v-show="showBase" :class="{sku2:showBase}">
        <van-icon name="close" class="close" @click="showBase=false"/>
        <div class="goods-top border-bottom">
          <img :src="goods.image_path" class="image_path" :onerror="defaultImg">
          <div class="goods-right">
            <p class="goods-name">{{goods.name}}</p>
            <p class="pic">
              <span>￥</span>
              <span>{{(goods.present_price * newCount).toFixed(2)}}</span>
            </p>
          </div>
        </div>
        <div class="goods-bottom border-bottom">
            <div class="left">
              <p class="num">购买数量：</p>
              <p class="totle">剩余 {{goods.amount}} 件 <span>每人限购50件</span></p>
            </div>
            <AdditionAndSubtraction @count='count'/>
        </div>
        <div class="bottom" @click="PurchaseImmediately">立即购买</div>
      </div>
    </transition>  
    <transition name="fade">
        <div class="sku-layer" v-show="showBase" @click="showBase=false"></div>
    </transition>
    </div>
    </div>
    <BaseLoding :showFlag='showFlag'/>
    <Back @back='back'/>
  </div>
  </transition>  
</template>

<script>
import Back from 'pages/other/Back'
import {loading,goBack} from 'js/mixin'
import {mapGetters,mapActions,mapMutations} from 'vuex'
import AdditionAndSubtraction from 'pages/other/AdditionAndSubtraction'
export default {
  name: 'Details',
  mixins: [loading,goBack],
  components: {
    Back,
    AdditionAndSubtraction
  },
  data() {
    return {
      good: { },
      defaultImg: 'this.src="' + require('img/vue.jpg') + '"',
      active: 0,
      item: [{id:0,title:'商品详情'},{id:1,title:'商品评论'}],
      isCollectionFlag: false,
      showBase:false,  // 显示sku
      newCount: 1,
      comment: ''
    }
  },
  
  computed: {
      ...mapGetters(['goodsDetails','isLogon']),
      propList() {
        if( this.goods && this.goods.props ) {
          return this.goods.props.filter( item => item.real_value != "" && item.real_value !=null && item.level >=10 )
        }
        return []
      },
      imageList() {
        if( this.goods && this.goods.props ) {
          var v = this.goods.props.filter(item=>item.name == "images")[0].real_value
          if( v.length > 0 )
            return v.split('|')
        }
        return []
      }
  },

  methods: {
    formatPrice() {
      return '¥' + (this.goods.price / 100).toFixed(2);
    },

    onClickCart() {
      this.$router.push('/shoppingCart');
    },

    goHome() {
      this.$router.push({ path: '/home' })
    },

    // 请求商品详情
    async goodsItem(id = this.goodsDetails.goodsId) {
        
        try {
          const {data} = await this.Api.goodOne(id)

            let goodsOne = data
            if (goodsOne.id) {
              this.setBrowse(goodsOne)
              this.goods = goodsOne
              //this.comment = goodsOne.comment
              
            }
            this.showFlag = false
          //}
        } catch (error) {
          console.error( error )
            this.showFlag = false
            this.isCollectionFlag = true
            this.Toast('网络错误')
        }
      
    },

    // 查询是否已收藏
    async isCollection(id) {
      // this.showFlag = true
      // const {data} = await this.Api.isCollection(id)
      // if (data.code == 200) {
      //   this.showFlag = false
      //   if (data.isCollection == 1) {   // 已经收藏收藏
      //       this.isCollectionFlag = false
      //   } else {
      //       this.isCollectionFlag = true
      //   }
      // } else {
      //   this.showFlag = false
      //   this.isCollectionFlag = true
      // }
    },

    // 点击收藏
    async collection() {
      if (!this.isLogon) {
        this.$router.push({path:'/user/login'})
        return
      }
      if (this.isCollectionFlag) {  // 收藏
        let goods = this.goods
        delete(goods['_id'])  
        try {
          const {data} = await this.Api.collection(goods)
          if (data.code == 200) { // 收藏成功
            this.Toast(data.msg);
            this.isCollectionFlag = false
          }
        } catch (error) {
          this.Toast('收藏失败,网络错误')
        }
      } else {  // 取消收藏
        try {
          const {data} = await this.Api.cancelCollection(this.goods.id)
              if (data.code == 200) { 
                this.isCollectionFlag = true
              }
        } catch (error) {
          this.Toast('网络错误')
        }

      }
    },

    // 加入购物车
    async addShops() {
        if (!this.isLogon) {
            this.$router.push({path:'/user/login'})
            return
        }
        try {
          //console.log( this.goodsDetails )
          const {data} = await this.Api.addShop( this.goods.id)
          //if (data.code == 200) {
            this.Toast(data.msg)
          //}
        } catch (error) {
          this.Toast('网络错误')
        }
    },

    // 立即购买弹出sku
    purchase() {
      this.showBase = true
    },

    count(newCount) {
      this.newCount = newCount
    },

    // 立即购买
    PurchaseImmediately() {
      if (!this.userName) {
        this.$router.push({path:'/user/login'})
        return
      }
      let goods = [{
        check:true,
        count: this.newCount,
        cid: this.goods.id,
        image_path: this.goods.image_path,
        mallPrice: this.goods.present_price * this.newCount,
        present_price: this.goods.present_price,
        name: this.goods.name,
        idDirect: true,
        count: this.newCount
      }]
      this.$router.push({path: '/ShoppingPayMent'})
      this.setShopList(goods)
    },

     ...mapMutations({
        setShopList: 'SHOPORDERLIST'
    }),

    ...mapActions(['setBrowse']),
    imageUrl(url) {
        return 'https://img2.guolele.com/' + ( url  );
    },
  },

  created() {
    
    let id = this.$route.query.id
    this.goodsItem(id)
    this.isCollection(this.goodsDetails.goodsId || this.goodsDetails.id || id)

  },
};
</script>

<style lang="less" scoped>

.sku {
  height: 250px;
  background: #fff;
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1001;
  .close {
    position: absolute;
    right: 0%;
    top: 0%;
    font-size: 18px;
    z-index: 200;
    padding: 10px;
  }
  .goods-top {
    position: relative;
    height: 90px;
    display: flex;
    .image_path {
      flex: 0 0 80px;
      transform: translate3d(16px,-10px,0);
      width: 80px;
      height: 80px;
      border: 1px solid #eee;
    }
    .goods-right {
      padding-left: 30px;
      flex: 1;
      .goods-name {
        font-size: 14px;
        margin-top: 10px;
        padding-right: 35px;
        line-height: 1.4;
      }
      .pic {
        margin-top: 10px;
        color: #FF4444;
        font-size: 14px;
      }
    }
  }
  .goods-bottom {
    height: 70px;
    padding: 10px 16px 10px 16px;
    box-sizing: border-box;
    display: flex;
    .left {
      flex: 0 0 60%;
      width: 60%;
      .num {
        font-size: 12px;
      }
      .totle {
        margin-top: 15px;
        color: #999;
        font-size: 12px;
        span {
          color: #f44;
          margin-left: 10px;
          font-size: 12px
        }
      }
    }

  }
  .bottom {
      height: 50px;
      background: #f44;
      text-align: center;
      line-height: 50px;
      font-size: 16px;
      color: #fff;
      letter-spacing: 2px;
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
    }
}

.sku-layer {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,.7);
  z-index: 1000;
}
.goods {
  padding-bottom: 50px;
  background: #fff;
  position: relative;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  overflow: auto;
  &-swipe {
    img {
      width: 100%;
      height: 400px;
      display: block;
    }
  }
  &-title {
    font-size: 16px;
  }
  &-price {
    color: #f44;
  }
  &-express {
    color: #999;
    font-size: 12px;
    padding: 5px 15px;
  }
  &-cell-group {
    margin: 15px 0;
    .van-cell__value {
      color: #999;
    }
  }
  &-tag {
    margin-left: 5px;
  }
}

.active-1 {
  min-height: 300px
}
.comment {
  margin-top: 15px;
  .comment-content {
    display: flex;
    margin: 12px;
    &-first-child {
      margin-top: 50px;
    }
    .avatar {
      flex: 0 0 35px;
      width: 35px;
      margin-right: 20px;
      img {
        width: 38px;
        height: 38px;
        border:  1px solid #eee;
        border-radius: 50%
      }
    }
    .desc {
      flex: 1;
      padding-bottom: 8px;
      display: flex;
      padding-right: 15px;
      flex-direction: column;
      .fist {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        .name {
          font-size: 14px;
            olor: grey;
        }
        .num {
          color: gray;
          font-size: 14px    ;
        }
      }
      .timer {
          color: grey   ;    
          margin-top: 8px;
      }    
      .cont {
          margin-top: 8px;
          color: #333;
          overflow: hidden;
          word-wrap: break-word;
          word-break: break-all;
          text-align: justify;
          font-size: 14px;
          line-height: 1.6 ;
      }
    }
  }
}
.like {
  position: relative;
  display: flex;
  align-items: center;
  .like-o {
    font-size: 20px;
    position: absolute;
    right: 35%;
  }
  .like2 {
    font-size: 20px;
    position: absolute;
    right: 8%;
    color: red;
  }
}
.nocomment {
  text-align: center;
  color: #333;
  margin-top: 50px;
}
.bounce2-enter-active {
    animation: bounce-in .3s;
}
.bounce2-leave-active {
    animation: bounce-in .3s reverse;
}
@keyframes bounce-in {
    0% {
        transform: translate3d(0,100%,0)
    }
    
    100% {
        transform: translate3d(0,0,0)
    }
}
.fade-enter-active, .fade-leave-active {
    transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
} 
</style>