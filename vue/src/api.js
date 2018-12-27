import axios from 'axios'
import store from '@/store'

// 所有接口的api封装
export default class Api {
    static searchTransformer (r)  {
        return r.map( item => {
            return { id: item.id,
            name: item.name }
        })
   
    };

    static detailTransformer(r) {
        return r
    }

    static Get(path, transformer) {
        if( path.indexOf('?')> 0)
            path = path + '&format=json'
        else    
            path = path + '?format=json'
        
        let headers;
        if( store.state.token != null )
            headers = {
                Authorization: 'Token '+store.state.token
            }
        else    
            headers = null
        return new Promise((resolve, reject) => {
            axios.get(path,  {
                    headers: headers
                }).then( r => {
                if( transformer != null ) 
                    r.data = transformer(r.data)
                resolve( r )
            }).catch( error => {
                reject( error )
            })
        })
    }

    static Post(path,data,action="post") {
        let headers = {
            Authorization: 'Token '+store.state.token
        }
    
        return new Promise((resolve, reject) => {
            axios({
                url: path,
                method:action,
                data: data,
                headers: headers
            }).then( r => {
                resolve( r )
            }).catch( error => {
                reject( error )
            })
        })
    }
    /**
     * 首页(Home)所有接口
     * recommend            首页的默认数据
     * search               搜索 参数： value：搜索关键词
     * keeplogin            保持登录
     */
    static recommend() {
        return Api.Get('/api/recommend/')
    }

    static search(value) {
        return Api.Get(`/api/goods/?search=${value}`, Api.searchTransformer)
    }

    static keeplogin() {
        return Api.Post('/api/keeplogin')
    }
    // ===============================================================================================================
    /**
     * 分类页面(Category)所有接口
     * category 分类查询  参数id：默认分类的id
     */
    static category(id) {
        return Api.Get(`/api/classifications/?category_id=${id}`, r => {
            return { dataList: r.map( i => { return Api.detailTransformer(i); } ) }
        })
    }

    // ===============================================================================================================
    /**
     * 购物车(ShoppingCart)所有接口
     * getCard      查询获取购物车数据
     * editCart     购物车加减商品      参数 ： 数量  商品id 价格
     * deleteShop   购物车商品删除      参数 id：需要删除的商品id
     */
    static getCard() {
        return Api.Get(`/api/cart/items/`, r => {
            return { shopList: r.map( item => {
                item.check= false
                return item
            }) }
        })
    }

    static editCart(count, id) {
        return Api.Post(`/api/cart/items/${id}/`, {
            qty:count
        },"patch")
    }

    static deleteShop(id) {
        return Api.Post(`/api/cart/items/`, {id}, 'delete')
    }

    // ===============================================================================================================

    /**
     * 购物车支付页面(ShoppingPayMent)所有接口
     * placeOrder 提交订单 参数：address:收货地址,tel:电话，orderId：所有商品的id，totalPrice：总价格,idDirect:用来判断是购物车结算还是直接购买,count:商品数量
     */
    static placeOrder({ ...args }) {
        return Api.Post('/api/placeorder/', args)
    }

    // ===============================================================================================================
    /**
     * 商品详情页面(Details)所有接口
     * goodOne          请求单个商品详情,        参数： id:商品的id
     * collection       收藏单个商品            参数：  goods:商品的详情信息
     * cancelCollection 取消收藏单个商品        参数：  id:商品的id
     * isCollection     查询商品是否已收藏      参数：  id:商品的id
     * addShop          加入购物车             参数：  id:商品的id
     */
    static goodOne(id) {
        return Api.Get(`/api/goods/${id}/`,Api.detailTransformer )
        //return axios.get(`/api/goods/${id}/?format=json`)
    }

    static collection(goods) {
        return axios.post('/api/collection', goods)
    }

    static cancelCollection(id) {
        return axios.post('/api/cancelCollection', { id })
    }

    static isCollection(id) {
        return axios.post(`/api/isCollection`, { id })
    }

    static addShop(id) {
        return Api.Post(`/api/cart/items/`, { good:id })
    }
    // ===============================================================================================================

    /**
     * 会员中心(My)所有接口
     * loginOut 退出登录
     * user     获取用户信息
     * saveUser 修改保存用户信息
     * getOrderNum 查询用户订单数量
     * comment  商品评论
     */
    static loginOut() {
        //return axios.post(`/api/loginOut`)
    }

    static user() {
        return Api.Get(`/api/profile/`)
    }

    static saveUser({ ...args }) {
        return Api.Post(`/api/profile/1/`, args, 'PUT')
    }

    static getOrderNum() {
        return Api.Get(`/api/orderNum/`)
    }

    static comment({ ...args }) {
        return axios.post(`/api/cart/comment`, args)
    }
    // ===============================================================================================================
    /**
     * 用户相关(user文件夹下)所有接口
     * getAddress           查询用户收货地址 
     * getDefaultAddress    查询默认收货地址
     * setDefaultAddress    设置默认收货地址    参数：id：地址id
     * postAddress          增加收货地址        参数：name:用户名,tel:电话，address:详情地址，isDefault：是否默认
            *                                province：省，city：市，county：区，addressDetail：详情地址，
            *                                areaCode：地区代码，id：修改地址时候要传id
     * deleteAddress        删除地址            参数： id：地址id
     * getCollection        查询我的收藏
     * register             注册
     * login                登录
     * getMyOrder           订单查询        参数：evaluate：用来判断是不是查询订单，默认false
     * alreadyEvaluated     查询已评价      参数： page：页面
     * tobeEvaluated        查询待评价      参数： page：页面
     * evaluateOne          查询单条评论    参数： id：商品id，_id：数据库的那条id
     */
    static getAddress() {
        return Api.Get(`/api/address/`)
    }

    static getDefaultAddress() {
        return Api.Get(`/api/address/?is_default=true`)
    }

    static setDefaultAddress(id) {
        return Api.Post(`/api/address/${id}/`, { id:id, is_default:true }, 'patch')
    }

    static postAddress(id, args) {
        if( id == undefined )    
            return Api.Post(`/api/address/`, args)
        else
            return Api.Post(`/api/address/${id}/`, args, 'put')
    }

    static deleteAddress(id) {
        return Api.Post(`/api/address/${id}`, {
            id
        },'delete')
    }

    static getCollection() {
        return axios.get(`/api/collection/list`)
    }

    static register(nickname, password) {
        return axios.post('/api/register', {
            nickname,
            password
        })
    }

    static login(nickname, password) {
        return axios.post('/api-token-auth/', {
            username:nickname,
            password
        })
    }

    static getMyOrder() {
        return Api.Get(`/api/orders/`)
    }

    static alreadyEvaluated(page = 1) {
        return axios.get('/api/alreadyEvaluated', {
            params: { page }
        })
    }

    static tobeEvaluated(page = 1) {
        return axios.get('/api/tobeEvaluated', {
            params: { page }
        })
    }

    static evaluateOne(_id) {
        return axios.post('/api/evaluateOne', {
            _id
        })
    }
}