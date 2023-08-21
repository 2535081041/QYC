const globalData = getApp().globalData
// pages/else/else.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    data:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this
    wx.request({
      url: globalData.path_ + '/other/get_info',
      success(res){
        that.setData({
          data:res.data
        })
      }
    })
  },
  // 1 点击获得联系方式
  get_connact(){
    wx.showModal({
      title: '获得哪种联系方式',
      content:'点击即可自动复制',
      cancelText:'微信号',
      confirmText:'邮箱地址',
      cancelColor:'#576B95',
      complete: (res) => {
        if (res.cancel) {
          wx.setClipboardData({
            data: 'cc2535081041',
          })
        }
        if (res.confirm) {
          wx.setClipboardData({
            data: 'cxjweb_top@163.com',
          })
        }
      }
    })
  }
})