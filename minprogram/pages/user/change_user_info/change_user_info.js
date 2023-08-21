const globalData = getApp().globalData
// pages/user/change_user_info/change_user_info.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    photo_path:'',          // 记录原头像地址
    new_photo_path:'',      // 记录新头像地址
    name:'',  // 原昵称
    new_name:''   // 新昵称
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    const that = this
    const eventChannel = that.getOpenerEventChannel()
    // 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
    eventChannel.on('user_info_change', function(data) {
      that.setData({
        name: data.name,
        photo_path:data.photo_path,
        new_photo_path: data.photo_path
      })
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  // ----------- 1 响应函数
  //  1 选择本地文件中的照片，修改本地变量，使图片显示
  choose_photo(e){
    console.log(e.detail.avatarUrl)
    let that = this
    const tempFilePath = e.detail.avatarUrl
    wx.compressImage({    // 压缩图片
      src: tempFilePath,
      success(res){
        that.setData({new_photo_path:tempFilePath})
      }
    })
  },

  // 2 更新头像，包括服务器、本地、全局、缓存。（包装成为异步函数）
  upload_photo(photo_path){
    let that = this
    return new Promise(function(resolve, reject){
      wx.uploadFile({
        filePath: photo_path,
        name: 'photo',
        url: globalData.path_ + "/user/upload/photo",
        formData:{
          'id': globalData.id,
          'openid':globalData.openid,
        },
        success(res){     // 先上传至服务器，若服务器上保存成功，则修改本地、全局、缓存
          if(res.data=='1'){
            const fs = wx.getFileSystemManager()    // 打开文件管理系统
            fs.removeSavedFile({filePath: that.data.photo_path})    // 删除原头像
            that.photo_to_sto(photo_path)  // 保存新头像，设置缓存，修改全局变量
            that.setData({photo_path, new_photo_path:''})
            resolve("1")  // 放回1表示成功
          }else{
            resolve("0")  // 放回0表示失败
          }
        },
        fail(err){
          reject(err)
        }
      })
    })    
  },

  // 3 更新昵称，包括服务器、本地、全局、缓存。
  upload_name(name){
    let that = this
    return new Promise(function(resolve, reject){
      wx.request({
        url: globalData.path_ + "/user/upload/name",
        method:"POST",
        data:{
          "name":name,
          'id': globalData.id,
          'openid':globalData.openid,
        },
        header:{'content-type': 'application/x-www-form-urlencoded'},
        success(res){
          if(res.data=="1"){  // 上传成功，则修改本地，缓存，全局，
            wx.setStorage({key:'name', data: name})   // 修改缓存
            that.setData({name})
            globalData.name = name    // 全局变量的
            //  通过端口将name发送至user_home页面
            const eventChannel = that.getOpenerEventChannel()
            eventChannel.emit('user_info_change', {name: name});
            resolve("1")  
          }else{
            resolve("0")
          }
        },
        fail(err){
          reject(err)
        }
      })
    })

  },
  
  // 4 点击确认按钮时执行，检查用户是否修改头像和昵称，如果修改则进行处理
  acknowledge(e){
    wx.showToast({
      title: '修改中',
      icon:'loading',
      duration: 3000
    })

    const photo_path = this.data.photo_path
    const new_photo_path = this.data.new_photo_path
    const new_name = e.detail.value.name
    const name = this.data.name
    console.log(name, new_name)
    console.log(photo_path, new_photo_path)

    var uploadPromises = []   // 需要异步的操作

    // a 判断图片是否修改
    if(photo_path != new_photo_path){
      uploadPromises.push(this.upload_photo(new_photo_path))
    }

    // b 判断昵称是否已被修改
    if(name!= new_name){
      uploadPromises.push(this.upload_name(new_name))
    } 
    Promise.all(uploadPromises).then(function(results){
      if(results.includes("0")){
        wx.showToast({
          title: '错误！重新修改',
          icon:'error'
        })
      }else{
        wx.showToast({
          title: '修改成功',
          success(){
            setTimeout(function(){wx.navigateBack()}, 1500)
          }
        })
      }
    }).catch(function(error){
      wx.showToast({
        title: '错误！重新修改',
        icon:'error'
      })
    })
  },

  // 5 保存图片，并设置缓存
  photo_to_sto(tempFilePath){
    const that = this
    const fs = wx.getFileSystemManager()
    fs.saveFile({
      tempFilePath: tempFilePath, // 传入一个临时文件路径
      success(res) {
        globalData.photo_path = res.savedFilePath  // 修改全局变量
        wx.setStorage({
          key:'photo_path', 
          data: res.savedFilePath,
        })
      }
    })
  },
  
})