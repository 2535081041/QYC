const globalData = getApp().globalData
let getting = false   // 表明是否正在请求更多数据
let update_status =  false  // 表明是否在请求更新数据
let show_time = 0  // 进入此页面的次数
// pages/life/life_home/life_home.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    img_root: globalData.img_root,   // 图片的根目录
  
    item_ids:globalData.item_ids,    // 记录帖子的id
    items:globalData.items,     // 记录帖子的详细数据
    col_com_num:{},   // 记录每一个帖子的收藏数与评论数

    update_status:false,  // 当前是否属于下拉刷新状态
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 1 获得帖子
    if(globalData.item_ids.length==0){    // 全局变量中没有帖子记录，则第一次请求帖子
      this.get_item('0', '0')
    }else{    // 更新数据
      const length = globalData.item_ids.length
      this.get_item(globalData.item_ids[length-1], '-1')
    }
  },

  onShow(){
    console.log(show_time)
    if(show_time!=0){this.get_col_com_num()}
    else{show_time=1}
  },


  // ------- 1 以下为事件响应函数
  // 1 前往发布页面
  to_emit(){
    wx.navigateTo({
      url: '/pages/life/emit/emit',
    })
  },

  // 2 接近底部时执行
  get_more_item(){
    const item_ids = this.data.item_ids
    if(!getting){   // 如果前一次更新还未结束，无法再次触发
      getting = true
      this.get_item(item_ids[item_ids.length-1], '1')
    }else{
      console.log("正在更新中")
    }
  },

  // 3 下拉是刷新，获得新的item
  get_new_item(){
    let that = this
    const item_ids = that.data.item_ids
    if(!that.data.update_status){
      that.get_item(item_ids[item_ids.length-1], '-1')
    }
  },

  // 4 跳转至帖子详细页面
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

  // -------- 2 其他函数
  // 1 获取帖子信息
  get_item(item_id, get_type='0'){
    let that = this
    wx.request({
      url: globalData.path_ + '/life/get_item/' + item_id + '/' + get_type,
      method:'GET',
      data:{id:globalData.id, openid:globalData.openid},
      success(res){
        if(res.data){   // 如果有数据的话
          const new_items = res.data.items
          const new_item_ids = res.data.item_ids
          if(get_type=='0'){    // 第一次请求
            globalData.items = new_items
            globalData.item_ids = new_item_ids
            that.setData({
              item_ids:new_item_ids,
              items: new_items
            })
            that.get_col_com_num()  // 获得评论数与收藏数

          }else if(get_type=='1'){  // 滚动到底部
            globalData.items = Object.assign(globalData.items, new_items)
            globalData.item_ids = globalData.item_ids.concat(new_item_ids)
            that.setData({
              items: Object.assign(that.data.items, new_items),
              item_ids: that.data.item_ids.concat(new_item_ids),
            },function(){
              getting = false
            })
            that.get_col_com_num()  // 获得评论数与收藏数
          }else if(get_type=="-1"){   // 下拉刷新
            globalData.items = new_items
            globalData.item_ids = new_item_ids
            that.setData({
              items:new_items,
              item_ids:new_item_ids,
              update_status:false,
             })
            that.get_col_com_num(true)  // 更新获得评论数与收藏数
            wx.showToast({
              title: '更新成功',
              duration:1000
            })
          }
        }else{
          if(get_type==-1){
            getting = false
            that.setData({update_status: false})
            that.get_col_com_num(true)
            wx.showToast({
              title: '更新成功',
              duration:1000
            })
          }
        }
      },
    })
  },

  // 3 获得每一个帖子的收藏与评论数，区间为oldest_item_id, latest_item_id
  get_col_com_num(update=false){
    let that = this
    const form_data = {
      id:globalData.id,
      openid:globalData.openid,
      item_ids:globalData.item_ids
    }
    wx.request({
      url: globalData.path_ + '/life/get_col_com_num',
      method:"GET",
      data:form_data,
      success(res){
        if(update){   // 更新评论和收藏数
          that.setData({col_com_num:res.data})
        }else{
          const new_col_com = Object.assign(that.data.col_com_num, res.data)
          that.setData({col_com_num: new_col_com})
        }
      }
    })
  },

})