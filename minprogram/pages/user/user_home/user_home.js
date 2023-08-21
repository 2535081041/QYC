const globalData = getApp().globalData

// pages/user/user_home/user_home.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imageData:globalData.path_+ '/img' +  '/ima.png',
    photo_path:'',
    photo_size:'',
    stu_id:'',
    name:'',
    time:0,
    id:'',

    
    // 帖子管理相关的数据
    item_id_lists:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setData({
      photo_path:globalData.photo_path?globalData.photo_path:"/staic/img/user.png",
      stu_id: globalData.stu_id,
      name: globalData.name ? globalData.name : "用户"+ globalData.id,
      time: 1,
      id:globalData.id
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    if(this.data.time!=0){    // 每次显示都从全局变量中获取
      this.setData({
        photo_path:globalData.photo_path,
        stu_id:globalData.stu_id
      })
    }
    if(this.data.name){
      this.setData({
        name: globalData.name
      })
    }
  },

  // -------- 1 响应事件
  // 1. 跳转至修改头像昵称页面
  to_change_user_info(){
    let that = this
    wx.navigateTo({
      url: '/pages/user/change_user_info/change_user_info',
      events:{
        user_info_change:function(data){  // 设置监听端口，监听个人信息的变化
          const new_name = data.name
          console.log("端口接收到的数据未" )
          console.log(data)
          that.setData({
            name: new_name
          })
        }
      },
      success:function(res){
        res.eventChannel.emit('user_info_change', {   // 传递参数
          name: that.data.name ? that.data.name : '不留名校友',
          photo_path:that.data.photo_path ? that.data.photo_path : '/staic/img/user.png'
        })
        res.eventChannel.on('user_info_change')
      }
    })
  },

  // 2 跳转至学号绑定页面
  to_user_login(){
    wx.navigateTo({
      url: '/pages/schedule/login/login',
    })
  },

  // 3 跳转到帖子管理页面
  to_manage(){
    let that = this
    wx.navigateTo({
      url: '/pages/life/manage/manage',
    })
  },

  // 4 跳转到其他页面
  to_else(){
    wx.navigateTo({
      url: '/pages/else/else',
    })
  },

  // 跳转到测试页面
  to_text(){
    wx.navigateTo({
      url: '/pages/text/text',
    })
  },



})