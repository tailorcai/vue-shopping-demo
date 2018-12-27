<template>
  <div id="my-warpper">
    <BaseTitle title="会员中心"/>
    <!-- <img class="user-poster" src="https://img.yzcdn.cn/public_files/2017/10/23/8690bb321356070e0b8c4404d087f8fd.png"> -->
    <div class="avatar" v-if="!isLogon">
      <img src="http://img4.imgtn.bdimg.com/it/u=198369807,133263955&fm=27&gp=0.jpg" alt srcset>
      <p @click="login">登录/注册</p>
    </div>
    <div class="avatar" v-else>
      <img :src="userInfo.avatar">
      <p class="usename">欢迎您：{{userInfo.nickname}}</p>
      <p @click="loginOut">退出登录</p>
      <van-icon name="setting" class="setting" @click="setting"/>
    </div>
    <div class="user-links van-row">
      <div
        class="van-col van-col--6 numlist"
        v-for="(val,index) in tabs"
        :key="val.status"
        @click="status(val.status)"
      >
        <i class="van-icon" :class="val.icon"></i>
        <span>{{val.title}}</span>
        <span class="num" v-if="orderNum && orderNum[index]>0">{{orderNum[index]}}</span>
      </div>
    </div>
    <van-cell-group class="user-group">
      <van-cell icon="records" title="全部订单" is-link @click="myOrder"/>
    </van-cell-group>

    <van-cell-group>
      <van-cell icon="exchange" title="收藏商品" is-link @click="collection"/>
      <van-cell icon="gold-coin" @click="address" title="地址管理" is-link/>
      <van-cell icon="gift" title="最近浏览" is-link @click="browse"/>
    </van-cell-group>
    <van-popup v-model="show" position="right" class="popup" :overlay="false">
      <BaseTitle title="个人资料" :back="back" @goBack="show=false"/>
      <van-cell-group>
        <div id="setAvatar" class="set-avatar border-bottom">
          <span>头像</span>
          <div>
            <img v-if="userInfo" :src="userInfo.avatar" alt srcset>
            <van-icon name="arrow"/>
          </div>
          <div class="cropper">
            <Cropper :imgStyle="imgStyle" @callback="callback"/>
          </div>
        </div>
        <p @click="noName">
          <van-field
            class="border-bottom"
            v-model="username"
            disabled
            clearable
            label="用户名"
            placeholder="请输入用户名"
          />
        </p>

        <van-field v-model="nickname" clearable label="昵称" placeholder="请输入昵称"/>
        <p @click="showGender=true" class="gender">
          <van-field
            class="border-bottom"
            v-model="gender"
            clearable
            disabled
            label="性别"
            placeholder="男"
          />
        </p>

        <van-field v-model="email" clearable label="邮箱" placeholder="请输入邮箱"/>
        <p @click="showBirth = true;" class="birth">
          <van-field v-model="birth" clearable disabled label="出生年月" placeholder="出生年月"/>
        </p>
      </van-cell-group>
      <van-popup v-model="showBirth" position="bottom" :overlay="true">
        <van-datetime-picker
          v-model="currentDate"
          type="date"
          :min-date="minDate"
          :max-date="maxDate"
          @confirm="confirm"
          @cancel="showBirth = false"
        />
      </van-popup>
      <van-popup v-model="showGender" position="bottom" :overlay="true">
        <van-picker
          class="gender-picker"
          :columns="columns"
          @change="onChange"
          show-toolbar
          title="性别"
          @cancel="showGender=false"
          @confirm="showGender=false"
        />
      </van-popup>
      <div class="normal">
        <van-button
          size="normal"
          class="normal-btn"
          type="primary"
          @click="post"
          :loading="loading"
        >保存</van-button>
        <van-button @click="show=false" size="normal" class="normal-btn normal-btn-default">取消</van-button>
      </div>
    </van-popup>
    <router-view/>
  </div>
</template>

<script>
import BaseTitle from "pages/other/BaseTitle";
import Cropper from "pages/other/Cropper";
import { mapGetters, mapMutations } from "vuex";
export default {
  name: "My",
  components: {
    BaseTitle,
    Cropper
  },

  data() {
    return {

      show: false,
      nickname: "",
      username: "",
      gender: "男",
      email: "",
      back: true,
      currentDate: new Date(),
      columns: ["男", "女", "保密"],
      maxDate: new Date(),
      minDate: new Date(1937, 12, 31),
      birth: "", // ,出生年月
      showBirth: false,
      showGender: false,
      year: "",
      month: "",
      day: "",
      loading: false,
      orderNum: "", //订单数量，
      // 0,待付款 1，待发货 2，待收货 3，评价 4，已完成
      tabs: [
        { status: 0, icon: "van-icon-pending-payment", title: "待付款" },
        { status: 1, icon: "van-icon-pending-deliver", title: "待发货" },
        { status: 2, icon: "van-icon-logistics", title: "待收货" },
        { status: 3, icon: "van-icon-pending-orders", title: "评价" },
        { status: 4, icon: "van-icon-exchange", title: "已完成" }
      ],
      imgStyle: {
        width: "55px",
        height: "55px",
        "border-radius": "50%",
        display: "none"
      }
    };
  },

  computed: {
    ...mapGetters(["userInfo", "isLogon"])
  },

  methods: {
    ...mapMutations({
            setUserInfo: 'USERINFO'
        }),
    callback(img) {
      // this.avatar = img;
    },

    noName() {
      this.Toast("用户名暂时不能修改哟~~");
    },

    login() {
      this.$router.push({ path: "/user/login" });
    },

    address() {
      if (this.isLogon) {
        this.$router.push({ path: "/user/address" });
      } else {
        this.$router.push({ path: "/user/login" });
      }
    },

    collection() {
      this.$router.push({ path: "/user/collection" });
    },

    // 退出登录
    async loginOut() {
      localStorage.clear();
      window.location.reload();
    },

    // 最近浏览
    browse() {
      this.$router.push({ path: "/my/browse" });
    },

    myOrder() {
      this.$router.push({ path: "/my/order" });
    },

    // 修改用户资料
    async setting() {
      this.show = true;
      try {
        const { data } = await this.Api.user();

                  //if (data.code == 200) {
          let profile = data[0]
          console.log( profile )

          this.username = profile.user.username;
          this.gender = profile.gender;
          this.birth = profile.birthday//data.userInfo.year + "年" + data.userInfo.month + "月" + data.userInfo.day + "日";
          this.year = profile.birthday && profile.birthday.substr(0,4);
          this.month = profile.birthday && profile.birthday.substr(5,2);
          this.day = profile.birthday && profile.birthday.substr(8,2);
          this.email = profile.email;
          this.id = profile.id;
          this.nickname = profile.nickname;
        //}
      } catch (error) {
        console.error( error )
        this.Toast("获取用户信息失败");
      }
    },

    confirm(val) {
      let d = new Date(val);
      this.year = d.getFullYear();
      this.month = d.getMonth() + 1;
      this.day = d.getDate();
      this.birth = this.year + "年" + this.month + "月" + this.day + "日";
      this.showBirth = false;
    },

    onChange(picker, value) {
      this.gender = value;
    },

    // 保存
    async post() {
      this.loading = true;
      let datas = {
        gender: this.gender,
        email: this.email,
        birthday: this.year+'-'+this.month+'-'+this.day,
        id: this.id,
        nickname: this.nickname
      };
      try {
        const { data } = await this.Api.saveUser(datas);

          this.loading = false;
          this.setUserInfo(data);
          this.Toast(data.msg);

      } catch (error) {
        this.loading = false;
        this.Toast("修改失败,网络错误");
      }
    },

    status(i) {
      if (i == 3) {
        this.$router.push({ path: "/my/evaluate" });
      } else {
        if (i == 4) {
          i = 3;
        }
        this.$router.push({ path: "/my/order", query: { status: i } });
      }
    }
  },

  async created() {
    if( !this.isLogon ) return

    try {
      const { data } = await this.Api.getOrderNum();
      //if (data.code == 200) {
        this.orderNum = data;
      //}
    } catch (error) {
      this.Toast("网络错误");
    }
  }
};
</script>

<style lang="less" scoped>
.avatar {
  width: 100%;
  display: flex;
  flex-direction: column;
  text-align: center;
  align-items: center;
  background: #e30c7b;
  padding: 10% 0 10% 0;
  box-sizing: border-box;
  position: relative;
  img {
    width: 70px;
    height: 70px;
    border-radius: 50%;
  }
  p {
    color: #fff;
    font-size: 14px;
    margin-top: 20px;
  }
}
.user {
  &-poster {
    width: 100%;
    height: 100%;
    display: block;
  }
  &-group {
    margin-bottom: 0.3rem;
  }
  &-links {
    padding: 15px 0;
    font-size: 14px;
    text-align: center;
    background-color: #fff;
    .van-icon {
      display: block;
      font-size: 24px;
      margin-bottom: 10px;
    }
  }
}
.van-cell {
  width: 100%;
  display: -webkit-box;
  display: -webkit-flex;
  display: flex;
  padding: 10px 15px;
  box-sizing: border-box;
  position: relative;
  background-color: #fff;
  color: #333;
  font-size: 14px;
  overflow: hidden;
  align-items: center;
  .van-cell__left-icon {
    font-size: 16px;
    line-height: 24px;
    margin-right: 5px;
  }
  .van-cell__right-icon {
    color: #999;
    font-size: 12px;
    line-height: 35px;
    margin-left: 5px;
  }
}
.usename {
  font-weight: 700;
  font-size: 18px !important;
}
.setting {
  color: #eee;
  font-size: 20px;
  position: absolute;
  top: 5px;
  right: 5px;
  padding: 10px;
}
.popup {
  height: 100%;
  width: 100%;
  background: #fff;
}
.normal {
  margin-top: 50px;
  text-align: center;
}
.normal-btn {
  width: 80%;
}
.normal-btn-default {
  margin-top: 10px;
}
.numlist {
  position: relative;
  width: 20%;
}
.numlist .num {
  position: absolute;
  right: 15px;
  top: -8px;
  color: #fff;
  background: #e0322b;
  display: inline-block;
  width: 20px;
  height: 20px;
  line-height: 20px;
  font-size: 14px;
  border-radius: 50%;
}
.set-avatar {
  height: 80px;
  line-height: 80px;
  display: flex;
  padding: 0 15px;
  position: relative;
  span {
    flex: 0 0 75%;
  }
  div {
    flex: 1;
    img {
      width: 55px;
      height: 55px;
      border-radius: 50%;
      margin-right: 5px;
    }
  }
}
.cropper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>