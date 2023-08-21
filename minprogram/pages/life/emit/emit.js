
const globalData = getApp().globalData

// pages/life/emit/emit.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    img_num: 0,    // 记录图片数量
    img_path:[],    // 记录图片的路径
    title:'',
    body:'',      // 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this
    wx.getStorage({
      key:'img_num',
      success(res){that.setData({img_num:res.data})}
    })
    wx.getStorage({
      key:'img_path',
      success(res){that.setData({img_path:res.data?res.data:[]})}
    })    
    wx.getStorage({
      key:'title',
      success(res){that.setData({title:res.data})}
    })    
    wx.getStorage({
      key:'body',
      success(res){that.setData({body:res.data})}
    })
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

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload(e) {
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

  // -------- 1 以下为事件响应函数
  //  1 添加图片函数
  add_img(){
    const that=this
    wx.chooseMedia({
      count: 3 - that.data.img_num,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      maxDuration: 10,
      sizeType:['compressed', 'original'],
      camera: 'back',
      success(res) {
        const img_path = that.data.img_path
        const img_num = res.tempFiles.length
        var img_sto = []   // 记录图片大小
        for(let i=0; i<img_num; i++){
          if (res.tempFiles[i].size < 2100000){
            img_path.push(res.tempFiles[i].tempFilePath)            
          }
          img_sto.push(res.tempFiles[i].size)
        }
        console.log(img_sto)
        that.setData({
          img_path:img_path,
          img_num:img_path.length
        })
      }
    })
  },

  // 2 删除图片函数
  delete_img(e){
    const index = e.currentTarget.dataset.index
    let that = this
    wx.showModal({
      title: '提示',
      content: '是否删除图片',
      cancelText:'否',
      confirmText:'是',
      success (res) {
        if (res.confirm) {
          const img_path = that.data.img_path
          img_path.splice(index, 1)
          that.setData({
            img_path:img_path,
            img_num:img_path.length
          })
        }
      }
    })
 
  },

  // 3.1 上传文本数据，将返回处理状态condition，和item_id
  emit_txt_data(form_data){
    let that = this
    return new Promise(function(resolve, reject){
      wx.request({
        url: globalData.path_ + '/life/emit_item/txt',
        method: 'POST',
        header:{'content-type': 'application/x-www-form-urlencoded'},
        data:form_data,
        success(res){
          const condition = res.data.condition
          const item_id  = res.data.item_id
          resolve([condition,item_id])
        },
        fail(error){reject(error)}
      })
    })
  },

  // 3.2 上传图片数据，返回处理状态
  emit_img_data(form_data, img_path){
    let that = this
    return new Promise(function(resolve, reject){
      wx.uploadFile({
        filePath: img_path,
        name: 'img',
        url: globalData.path_ + "/life/emit_item/img",
        formData:form_data,
        success(res){resolve(res.data)},
        fail(err){reject(err)}
      })
    })    
  },


  // 3.3 当发表中途失败时，删除已经保存的数据
  delete_data(item_id, timestamp){
    console.log('开始删除')
    console.log(item_id)
    wx.request({
      url: globalData.path_ + '/life/delete_item/0',
      method:'POST',
      data:{
        "id": globalData.id,
        "openid": globalData.openid,
        "item_id": item_id
      },
      header:{'content-type': 'application/x-www-form-urlencoded'},
      success(res){console.log(res)}
    })
  },

  // 3.4 当发表失败时，或者用户退出时，先缓存用户已经填写的数据
  save_sto(title, body){
    let that = this
    wx.setStorage({key:'img_path', data:that.data.img_path})
    wx.setStorage({key:'img_num', data:that.data.img_num})
    wx.setStorage({key:'title', data:title})
    wx.setStorage({key:'body', data:body})
  },

  // 3.5 发表成功时，删除缓存
  delete_sto(){
    wx.setStorage({key:'img_path', data:''})
    wx.setStorage({key:'img_num', data:0})
    wx.setStorage({key:'title', data:''})
    wx.setStorage({key:'body', data:''})
  }, 

  // 3.6 显示发表状态,0表示发表中，1表示发表成功，-1表示发表失败
  show_emit_status(type, title='', body='', item_id='', timestamp='' ){
    let that = this
    if(type==0){    
      wx.showToast({
        title: '已于后台发表',
        icon:'loading',
        success(){
          setTimeout(function(){wx.navigateBack()}, 1500)
        }
      })
    }else if(type==1){  // 发表成功
      wx.hideToast()
      wx.showToast({
        title: '帖子发表成功',
      })
      that.delete_sto()   // 删除缓存
    }else if(type==-1){
      wx.hideToast()
      wx.showToast({
        title: '发表失败',
        icon:'error'
      })
      that.save_sto(title, body)
      if(item_id){that.delete_data(item_id, timestamp)}
    }
  },

  // 3 发送帖子、或保存草稿，文本数据与图片数据分开处理，且异步进行
  emit_item(e){
    const title = e.detail.value.title  // 获得输入内容
    const body = e.detail.value.body
    const img_path = this.data.img_path
    const img_num = this.data.img_num
    console.log(img_num)
    if(!title && !body && img_path.length==0){   // 没有数据内容
      wx.showToast({
        title: '未输入内容',
        icon:'error'
      })
      return 
    }

    if(e.detail.target.dataset.type != "1"){  // 保存草稿
      this.save_sto(title, body)
      wx.showToast({
        title: '保存成功',
        icon:'success'
      })
      return
    }
    let that = this

    wx.showModal({
      title: '提示',
      content: '发表需要一定时间，点击确认后将于后台发表，发表成功后将会有弹窗提示',
      complete: (res) => {
        if (res.confirm) {
          that.show_emit_status(0)    // 显示正在发表

          const timestamp = new Date().getTime();  // 当前时间戳  
          var img_type = '' //记录图片格式
          if(img_num>0){
            for(let i = 0; i<img_num; i++){
              img_type = img_type  + img_path[i].split('.').pop() + ' '
            }
          }
          var uploadPromises = [];  // 异步进行的函数
          const form_data = {
            'id': globalData.id,
            'openid':globalData.openid,
            "title":title, 
            "body":body,
            "timestamp": timestamp,
            "img_num":img_num,
            "img_type":img_type
          }
          uploadPromises.push(that.emit_txt_data(form_data))  // 待异步
          if(img_num>0){  // 存在图片数据
            for(let i=0; i<img_num; i++){
              const form_data={
                'id': globalData.id,
                'openid':globalData.openid,
                "timestamp": timestamp,
                "index": i,
              }
              uploadPromises.push(that.emit_img_data(form_data, img_path[i]))
            }
          }
          // 使用Promise.all()等待所有上传操作完成
          Promise.all(uploadPromises)
          .then(function(results) {
            let item_id = '-1'
            let success = true
            for(let i=0;i<results.length;i++){
              if(results[i].length>1){
                 item_id = results[i][1]
                if(results[i][0]=='0'){ success=false; break} // 执行失败
              }else{
                if(results[i]=='0'){ success=false}
              }
            }
            if(success){  // 发表成功
              that.show_emit_status(1)
            }else{  // 发表失败，根据item_id,timestamp删除已经保存的数据
              that.show_emit_status(-1, item_id, timestamp, title, body)
            }
          })
          .catch(function(error) {
            // 上传过程中出现错误
            that.show_emit_status(-1, title, body)
          });
        }
      }
    })

  
  },

})

