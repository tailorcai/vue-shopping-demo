// 商品评论表
module.exports = app => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;

    const CommentSchema = new Schema({
        comment_uid: String,        // 评论人的id
        comment_nickname: String,   // 评论人的昵称
        cid: String,                // 商品的id
        comment_time: String,
        rate:Number,                // 商品评分
        anonymous: Boolean,         // 是否匿名评价
        content: {                  // 评论的内容
            type: String,
            required: true
        },
        comment_avatar: {            // 评论人的头像
            type:String,
            default: 'http://images.baixingliangfan.cn/compressedPic/20171219105440_2015.jpg'
        },     
    });

    return mongoose.model('Comment', CommentSchema, 'comment');
}