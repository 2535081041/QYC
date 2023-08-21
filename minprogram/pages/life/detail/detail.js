const globalData = getApp().globalData
var father_index = -1    // 父评论的序号
var grafather_index = -1   // 爷评论的序号
var com_father_name = ''    // 父评论的名字（发送给后端）
var com_father_id = 0      // 父评论的id（发送给后端）
// pages/life/detail/detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    item:'',  // 主页传来的item
    father_comments:[],   // 父评论
    child_comments:{},     // 子评论
    com_num:0,    // 评论数

    img_root: globalData.img_root,   // 图片的根目录
    showInput:false,
    bottom:0,   // 输入框的位置
    focus: false,    // 输入框是否聚焦 
    placeholder:'所思所想',   // 输入框占位符号

    collect:false,    // 是否收藏
    heart:'/staic/img/heart0.png',     // 底部爱心的图标
    collect_num: 0,   // 收藏数
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this
    // 1 监听键盘高度
    wx.onKeyboardHeightChange(res => {
      that.setData({bottom:res.height * 2})
    })
    // 2 获得访问帖子的信息，并请求该帖子的评论
    const eventChannel = that.getOpenerEventChannel()
    eventChannel.on('item_to_detail', function(data) {
      that.setData({
        item:data.item,
        collect_num:data.collect_num
      },function(){
        that.judegment_collect()
      }
      )
      that.get_comment(data.item.item_id)
    })
  },

  // -------- 1 事件响应函数
  // 1 点击图片显示详细
  show_img_detail(e){
    const path = this.data.item.img_path
    const index = e.currentTarget.dataset.index
    var urls = []
    for(let i = 0; i<path.length; i++){
      urls.push(globalData.img_root + path[i])
    }
    wx.previewImage({
      urls: urls,
      current:urls[index],
      referrerPolicy:'origin',
      fail(err){console.log(res)}
    })
  },

  // 2 点击输入评论
  showInput(e){
    father_index = e.currentTarget.dataset.father_index
    grafather_index = e.currentTarget.dataset.grafather_index
    if(father_index==-1){  // 直接回复帖子
      com_father_name = ''
      com_father_id = 0
    }else if(grafather_index==-1){   // 回复父评论
      const father_comment = this.data.father_comments[father_index]
      com_father_name = father_comment.user_name
      com_father_id = father_comment.com_id
    }else{    // 回复子评论
      const grafather_com_id = this.data.father_comments[grafather_index].com_id
      console.log(grafather_com_id)
      const father_comment = this.data.child_comments[grafather_com_id][father_index]
      console.log(father_comment)
      com_father_name = father_comment.user_name
      com_father_id = father_comment.com_id
    }
    this.setData({
      showInput:true,
      placeholder:com_father_name?"回复 " + com_father_name + ":":'所思所想'
    })
  },

  // 3 点击发送评论
  send_comment(e){

    const comment = e.detail.value.value
    if(comment){
      wx.showToast({
        title: '正在发送',
        icon:"loading"
      })
      const form_data = {
        id: globalData.id,
        openid:globalData.openid,
        com_value: comment,
        com_father: com_father_id,   // 此评论的父评论
        com_father_name: com_father_name,
        item_id:this.data.item.item_id,
      }
      let that = this
      wx.request({
        url: globalData.path_ + '/life/emit_comment',
        method:"POST",
        header:{'content-type': 'application/x-www-form-urlencoded'},
        data:form_data,
        success(res){
          if(res.data.status=='1'){
            wx.hideToast()
            wx.showToast({
              title: '回复成功',
            })
            const new_comment = res.data.new_comment  // 接收发送成功的评论
            const com_num = that.data.com_num + 1
            if(father_index==-1){  // 直接回复帖子，添加到父评论
              var father_comments = that.data.father_comments
              var child_comments = that.data.child_comments
              father_comments.push(new_comment)
              child_comments[new_comment.com_id] = []
              that.setData({father_comments, com_num, child_comments})
              
            }else if(grafather_index==-1){   // 回复父评论，添加到父评论的子评论
              var child_comments = that.data.child_comments
              child_comments[com_father_id].push(new_comment)
              that.setData({child_comments, com_num})
            }else{        // 回复子评论，添加到父评论的子评论
              const grafather_com_id = that.data.father_comments[grafather_index].com_id
              var child_comments = that.data.child_comments
              child_comments[grafather_com_id].push(new_comment)
              that.setData({child_comments, com_num})
            }
          }else{
            wx.hideToast()
            wx.showToast({
              title: '回复失败',
              icon:'error'
            })
          }
        },
        fail(err){
          wx.hideToast()
          wx.showToast({
            title: '回复失败',
            icon:'error'
          })
        }
      })
      this.setData({showInput:false})
    }
  },

  // 4 当输入框失去焦点时
  losefocus(e){
    const value = e.detail.value
    if(value){   // 失去焦点，但是有输入内容，则收起键盘，但是不收起输入框
      this.setData({focus:false})
    }else{
      this.setData({showInput:false})
    }
  },

  // 5 点击底部收藏图标时
  bind_collect(){
    wx.showLoading()
    let that = this
    const item_id = this.data.item.item_id

    if(that.data.collect){    // 取消收藏
      wx.request({
        url: globalData.path_ + '/life/collect/dis_collect',
        method:'POST',
        header:{'content-type': 'application/x-www-form-urlencoded'},
        data:{
          id:globalData.id,
          openid:globalData.openid,
          item_id:item_id
        },
        success(res){
          if(res.data=="1"){
            const index = globalData.item_id_collect_list.indexOf(item_id)
            globalData.item_id_collect_list.splice(index, 1)
            that.setData({
              heart:'/staic/img/heart0.png',
              collect:false,
              collect_num: that.data.collect_num - 1
            })
            wx.hideLoading()
            wx.showToast({
              title: '取消收藏成功',
            })
          }
        }
      })
    }else{    // 收藏
      wx.request({
        url: globalData.path_ + '/life/collect/collect',
        method:'POST',
        header:{'content-type': 'application/x-www-form-urlencoded'},
        data:{
          id:globalData.id,
          openid:globalData.openid,
          item_id:item_id
        },
        success(res){
          if(res.data=="1"){
            globalData.item_id_collect_list.push(item_id)
            that.setData({  
              heart:'/staic/img/heart1.png',
              collect:true,
              collect_num: that.data.collect_num + 1
            })
            wx.hideLoading()
            wx.showToast({
              title: '收藏成功',
            })
          }
        }
      })
    }
  },

  // 6 长按删除评论
  delete_comment(e){
    let that = this
    const father_index = e.currentTarget.dataset.father_index
    const grafather_index = e.currentTarget.dataset.grafather_index
    if(grafather_index==-1){
      var cur_comment = that.data.father_comments[father_index]
    }else{
      const grafather_comment = that.data.father_comments[grafather_index]
      var cur_comment = that.data.child_comments[grafather_comment.com_id][father_index]
    }

    //  判断是否有限权删除
    if(cur_comment.user_id == globalData.id){
      wx.showModal({
        title: '提示',
        content: '确定删除该评论',
        complete: (res) => {
          if (res.confirm) {
            wx.showLoading({title: '删除中',})

            const form_data = {
              id:globalData.id,
              openid : globalData.openid,
              item_id: cur_comment.item_id,
              com_id : cur_comment.com_id
            }
            console.log(form_data)
            wx.request({
              url: globalData.path_ + '/life/delete_comment',
              method:"POST",
              header:{'content-type': 'application/x-www-form-urlencoded'},
              data: form_data,
              success(res){
                if(res.data=="1"){
                  that.get_comment(cur_comment.item_id)
                  wx.hideLoading()
                  wx.showToast({title: '删除成功',})
                }
              },
              fail(err){
                console.log(err)
              }
            })
          }
        }
      })
    }

  },

  // ------- 2 其他函数
  // 1 向服务器请求item_id的评论
  get_comment(item_id){
    const form_data = {
      id: globalData.id,
      openid:globalData.openid,
      item_id:item_id
    }
    let that = this
    wx.request({
      url: globalData.path_  + '/life/get_comment',
      data:form_data,
      method:'GET',
      success(res){
        that.setData({
          father_comments:res.data.father_comments,
          child_comments:res.data.child_comments,
          com_num: res.data.com_num
        })
      }
    })
  },

  // 2 判断当前帖子的收藏情况
  judegment_collect(){
    const item_id  = this.data.item.item_id
    const item_id_collect_list = globalData.item_id_collect_list
    if( item_id_collect_list.includes(item_id) ){
      this.setData({
        collect:true,
        heart:'/staic/img/heart1.png',
      })
    }
  },

  
})


