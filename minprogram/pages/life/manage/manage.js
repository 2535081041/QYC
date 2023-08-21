const globalData = getApp().globalData

// pages/life/manage/manage.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    item_id_emit_list:[], // 发表
    item_id_collect_list:[],  // 收藏
    item_id_com_list:[],  // 评论
    current_id_lists : [],   // 当前展示的内容
    type:1,   // 1，2, 3分别表示发表，收藏，参与评论
    items : {},
    col_com_num:{},   // 帖子的收藏评论数

    img_root: globalData.img_root,   // 图片的根目录
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this
    that.get_manage_info(that.data.type)
    // 提示操作方法
    wx.showModal({
      title: '说明',
      content: '长按"帖子"或"评论"可进行删除',
      showCancel:false
    })
  },

  onshow(){
    console.log("出现")
  },

  // ----- 1 响应函数
  // 1 跳转至帖子详细页面
  to_detail(e){
    let that = this
    const item_id = e.currentTarget.dataset.item_id
    const item = that.data.items[item_id]
    wx.navigateTo({
      url: '/pages/life/detail/detail',
      success(res){
        res.eventChannel.emit("item_to_detail", {
          item:item, 
          collect_num: that.data.col_com_num[item_id][0]
        })
      }
    })
  },

  // 2 选择不同的类型
  choose(e){
    const type = e.currentTarget.dataset.type
    this.setData({type})
    this.get_manage_info(type)
  },

  // 3 长按帖子进行删除
  delete_item(e){
    let that = this
    if(that.data.type==1){
      wx.showModal({
        title: '提示',
        content: '确定删除该帖子',
        complete: (res) => {
          if (res.confirm) {
            wx.showLoading({
              title: '删除中',
            })
            const form_data = {
              id: globalData.id,
              openid:globalData.openid,
              item_id:e.currentTarget.dataset.item_id
            }
            wx.request({
              url: globalData.path_ + '/life/delete_item/1',
              data:form_data,
              method:'POST',
              header:{'content-type': 'application/x-www-form-urlencoded'},
              success(res){
                wx.hideLoading()
                if(res.data=="1"){
                  wx.showToast({
                    title: '删除成功',
                  })
                  that.get_manage_info(1)
                }else{
                  wx.showToast({
                    title: '删除失败',
                    icon:'error'
                  })
                }
              },
              fail(err){
                console.log(err)
                wx.hideLoading()
                wx.showToast({
                  title: '删除失败',
                  icon:'error'
                })
              }
            })
          }
        }
      })
    }
  },


  // ----- 2 其他函数
  // 获得评论数
  get_col_com_num(item_ids){
    let that = this
    const form_data = {
      id:globalData.id,
      openid:globalData.openid,
      item_ids:item_ids
    }
    console.log(item_ids)
    wx.request({
      url: globalData.path_ + '/life/get_col_com_num',
      method:"GET",
      data:form_data,
      success(res){
        that.setData({col_com_num:res.data})
      }
    })
  },

  // 获得帖子
  get_item(){
    let that = this
    wx.request({
      url: globalData.path_ + '/life/get_manage_info/item',
      data:{
        id:globalData.id,
        openid:globalData.openid
      },
      success(res){
        that.setData({items:res.data})
      }
    })
  },

  // 1 帖子管理、获得用户参与了的帖子id
  get_manage_info(type){
    let that = this
    const form_data = {
      id: globalData.id,
      openid:globalData.openid
    } 
    wx.request({
      url: globalData.path_ + '/life/get_manage_info/' + String(type),
      data:form_data,
      method:'GET',
      success(res){
        console.log(res.data)
        that.setData({
          items: res.data.items,
          current_id_lists:res.data.item_id_list,
        })
        if(res.data.item_id_list.length!=0){
          that.get_col_com_num(res.data.item_id_list)
        }
      }
    })
  },
})