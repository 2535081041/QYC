const globalData = getApp().globalData

// pages/schedule/login/login.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    password:'',
    stu_id:''
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
    this.setData({
      stu_id: globalData.stu_id
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


  // ----------- 1 以下为事件响应函数
  // 1 表单提交函数
  submit(e){
    let that = this
    const stu_id = e.detail.value.stu_id
    const password = e.detail.value.password
    console.log(stu_id, password)
    if(!stu_id || !password){
      wx.showToast({
        title:"请先输入",
        icon:'error',
      })
    }else{
      wx.showToast({
        title:"同步中",
        icon:'loading',
        duration:10000
      })
      const data = {
        'id':  globalData.id,
        'openid': globalData.openid,
        'stu_id': stu_id,
        'password': password
      }
      wx.request({
        url: globalData.path_ + '/course/get_course',
        data:data,
        success(res){
          let status_code = res.data.status_code  // 获得返回的状态码,判断是否返回成功
          var title = ''
          switch(status_code){
            case '401':
              title = "账号密码有误"
              break
            case '403':
              title = "错误，联系作者"
              break
            case '500':
              title = "教务系统繁忙"
              break
          }
          if(status_code!='200'){   // 判断课表是否抓取成功
            wx.showToast({
              title:title,
              icon:'error',
            })
          }else{  // 抓取成功，将课表存入缓存，传递给课表页面，修改全局变量
            let course = res.data.course  
            const eventChannel = that.getOpenerEventChannel()
            console.log(eventChannel)
            if(eventChannel){
              eventChannel.emit('home_login', {course: course});  // 传递参数
            }
            wx.setStorage({key:'course', data:course})
            wx.setStorage({key:'stu_id', data:stu_id})
            // 修改全局变量
            globalData.course = course
            globalData.stu_id = stu_id
            that.setData({password: password})
            wx.showToast({    // 显示提示框
              title:"同步成功",
              icon:'success',
              duration:1500
            })
            setTimeout(function(){  // 1.5s后返回课表页面
              wx.navigateBack()
            }, 1500)
          }
        },
        fail(err){
          console.log(err)
        }
      })
    }
  },
  emit_data(course){

  },
 
})