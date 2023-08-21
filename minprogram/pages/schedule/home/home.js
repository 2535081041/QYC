const globalData = getApp().globalData
var  time=0   // 访问页面的次数

// pages/text/text.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 学期相关


    // 显示相关
    day_name:["周日","周一","周二","周三","周四","周五","周六" ], 
    colors : [ '#F7DFD6', '#CBE0F4',"#E5E1EB", '#DCAED1','#F5E7EF', '#9BC4E0', '#E2B6D5' ,'#E3D7E6', '#CC92C1','#C7C9E0',   '#ECAE9B', '#CE755F', '#B7D1D5','#AE4C9D',
    ],
    // 课表相关：
    course_list:  globalData.course.course_list, 
    sjk_course_list : globalData.course.sjk_course_list,
    time_map_detail : globalData.course.time_map_detail,
    time_map_crude: globalData.course.time_map_crude,
    // 前端日期渲染相关
    semester_map:globalData.semester_info.semester_map,
    school_year: globalData.semester_info.school_year,   // 当前选择的学年
    semester: globalData.semester_info.semester,       // 当前选择的学期
    semester_options: globalData.semester_info.semester_options,// 可供选择的学期
     
    semester_start:'',    // 学期开始的时间戳
    current_week_index:'',  // 当前时间为第几周, 0表示属于假期
    current_swiper_index:'',  // 当前客户停留的滑块标号，也就是目前展示的周课表
    show_date:'',         // 展示的日期
    weeks_num: '',        // 本学期的课表个数

    course_index:'1' ,     // 遮罩层当前显示课程id

    // 周期选择的位置
    week_x:1000,   
    show_week_option: false,     
    // 课程详细的位置
    detail_x:1000,   
    show_detail: false,     
    // 底部栏的显示
    show_func_option:false,
    func_y:1000,  
  },



  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 检查登录状态：获得code验证用户，无法通过说明非法访问或者服务器问题
    if(globalData.id==''){
      this.text_login()
      // 获得校历
      this.get_semester_info()
    }else{
      this.set_current_week()
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    if(time!=0){
      if(!this.data.course_list){
        this.get_course()
      }
    }else{time=1}
  },


  // ------------- 以下都为数据处理函数
  // 1.0 课表框架（时间】周数）的初始化，需从全局变量中获取
  course_init(){
    let that = this
    const semester_info = globalData.semester_info
    that.setData({
      semester_map:semester_info.semester_map,
      school_year: semester_info.school_year,
      semester: semester_info.semester,
      semester_options: semester_info.semester_options
    },function(){
      that.set_current_week()   // 根据当前学年、学期以及此刻时间，获得此刻所在的周数，以及本学期的总周数
    })
  },

  // 1.1 获得当前的时间为第几周，若不属于第几周，则进入为-1，并设置周数
  set_current_week(){
    const semester_info = globalData.semester_info
    const school_year = semester_info.school_year
    const semester = semester_info.semester
    const weeks_num = semester_info.semester_map[school_year][semester][1]    // 本学期的周数
    var semester_start = semester_info.semester_map[school_year][semester][0] // 获得本学期的开始时间
    semester_start = Date.parse(semester_start)   // 转化为时间戳
    const now = new Date()
    const now_time = now.getTime()    // 获得当前的时间戳
    const diffTime = now_time - semester_start; // 计算两个时间之间相差的毫秒数
    const diffWeeks = diffTime / (1000 * 60 * 60 * 24 * 7); // 将毫秒数转换成周数
    if (diffWeeks <= weeks_num  & diffWeeks >= 0){
      var current_week_index = Math.ceil(diffWeeks)
    }else{
      var  current_week_index= 0  // 表明在假期中
    }
    let that = this
    that.setData({
      semester_start:semester_start,  // 学期开始时间戳
      current_week_index:current_week_index,    // 当前周数
      weeks_num: Array.from({length: weeks_num}, (_, index) => index + 1) // 本学期周数
    },function(){
      that.set_show_date(that.data.current_week_index)  // 根据当前所在周，设置初始状态下的日期显示
    }
    )
  },

  // 1.2 根据用户选择的周数，显示对应的日期
  set_show_date(week_index){
    if(week_index < 1){
      var show_date = "假期中"
    }else{
      const semester_start = this.data.semester_start   // 获得学期开始的时间戳
      // 创建一个Date对象，传入时间戳作为参数
      let week_start = new Date(semester_start);
      let week_end = new Date(semester_start);

      week_start.setDate(week_start.getDate() + 7 * (week_index - 1));    // 所在星期的开始时间
      week_end.setDate(week_end.getDate() + 7 * week_index);    // 所在星期的接受时间


      // 获取增加7天后的年份、月份、日期
      let year_start = week_start.getFullYear();
      let month_start = week_start.getMonth() + 1; // 月份从0开始，需要加1
      let day_start = week_start.getDate();
      let year_end = week_end.getFullYear();
      let month_end = week_end.getMonth() + 1; // 月份从0开始，需要加1
      let day_end = week_end.getDate();

      // 根据年份是否相同设置显示格式
      if(year_start == year_end){
        var show_date = year_start + '年 ' + month_start + '-' + day_start + '至' +  month_end + '-' + day_end
      }else{
        var show_date = year_start + '年 ' + month_start + '-' + day_start + '至' + year_end + '年' + month_end + '-' + day_end
      }

    }

    this.setData({
      show_date:show_date,
      current_swiper_index:week_index,  // 当前显示的滑块
    })
  },

  // 1.3 从全局变量中加载课程，或者跳转到同步页面
  get_course(){
    const course_list =  globalData.course.course_list
    let that = this
    if(course_list){
      that.setData({
        course_list : globalData.course.course_list,
        sjk_course_list : globalData.course.sjk_course_list,
        time_map_detail : globalData.course.time_map_detail,
        time_map_crude: globalData.course.time_map_crude,
      })
    }else{   // 初次加载时从全局变量中获取,
      wx.showModal({
        title:'还未同步数据，是否进行同步',
        cancelText:"否",
        confirmText:"是",
        complete: (res) => {
          if (res.cancel) {
            wx.showToast({
              title: '点击右下角悬浮窗可进行同步',
              icon:'none',
              duration:2000
            })
          }
          if (res.confirm) {
            that.ascyn_course()
          }
        }
      })
    }
  },
  
  // ------------- 2 以下都为事件响应函数
  // 2.1 课表滑动响应函数
  week_change(e){
    let current_swiper_index = e.detail.current // 获得滑动后显示的课表编号
    this.set_show_date(current_swiper_index)    // 修改显示时间
  },
  // 2.2 点击课表查看课表的详细情况
  show_course_detail(e){
    this.setData({
      course_index:e.currentTarget.dataset.course_index,
      show_detail:true
    },function(){
      this.setData({detail_x:0})
    })
  },
  // 2.3 关闭详细页面
  close_detail(){
    this.setData({
      show_detail:false,
      detail_x:1000,
    })
  },
  // 2.4 点击顶端选择周数时
  show_options(){
    this.setData({
      show_week_option:true,
    },function(){
      this.setData({
        week_x:0
      })
    })
  },
  // 2.6 取消选择时
  close_options(e){
    this.setData({
      show_week_option:false,
      week_x:1000,
    })
  },
  // 2.5 选择周数后
  select_options(e){
    let index = e.currentTarget.dataset.option
    this.setData({
      current_swiper_index: index,  
      show_week_option:true,
      week_x:1000,
      week_move:true
    })
  },


  // 2.6 点击左下角的悬浮按钮，显示功能栏
  show_function_option(){
    this.setData({
      show_func_option:true},function(){
      this.setData({
        func_y:0,
        semester_options:globalData.semester_info.semester_options
      })
    })
  },

  // 2.7 关闭功能栏
  close_function_option(){
    this.setData({
      show_func_option:false,
      func_y:1000
    })
  },
  

  // 2.8 跳转到同步课表
  ascyn_course(){
    let that = this
    wx.navigateTo({
      url: '/pages/schedule/login/login',
      events:{
        home_login:function(data){    // 监听同步页面传回来的课表
          const course = data.course
          that.setData({
            course_list: course.course_list, 
            sjk_course_list : course.sjk_course_list,
            time_map_detail : course.time_map_detail, 
            time_map_crude: course.time_map_crude , 
          })
          globalData.course = course
        },
      },
      success:function(res){
        res.eventChannel.on('home_login') // 监听端口
      }
    })
  },

  // 2.9 选择不同学期的课表切换
  change_semester(e){
    wx.showToast({
      title: '切换中',
      icon:"loading",
      duration: 5000
    })
    const semester_option = this.data.semester_options[e.detail.value]
    let that = this
    wx.request({
      url: globalData.path_ + '/course/change_course',
      data:{'semester':semester_option, 'stu_id': globalData.stu_id},
      success(res){
        const course = res.data
        that.setData({
          course_list: course.course_list, 
          sjk_course_list : course.sjk_course_list,
          time_map_detail : course.time_map_detail, 
          time_map_crude: course.time_map_crude , 
        }, function(){
          const school_year = semester_option.slice(0, 4); // 提取年份
          const semester = semester_option.slice(10, 11) // 提取学期
          that.setData({
            school_year: school_year,
            semester: semester,
          },function(){
            that.set_current_week()   // 根据当前学年、学期以及此刻时间，获得此刻所在的周数，以及本学期的总周数
          })
          wx.showToast({
            title: '切换成功',
            duration: 1000
          })
        })
      }      
    })
  },

  // -------- 3 加载函数
  // 1 用户登录函数，当检查不到缓存时执行
  user_login(){
    let that = this
    wx.login({          // a 获得临时的code                              
      success: (res) => {
        if(res.code){
          wx.request({    // b 将code发送至服务器
            url: globalData.path_ + '/user/login',
            method: 'GET',
            data: {'code':res.code},
            success (res){    // c 获得服务器返回的数据，存入缓存，修改全局变量
              if(res.statusCode!='200'){
                console.log("后端服务器有问题")
              }else{
                let data = res.data   // 接受来自后台的数据，若 data为'0'请求有问题
                if(data=='0'){
                  console.log('认证有误')
                }else{
                  // 获得用户头像
                  that.get_photo(data.user_id.id, data.photo_type)
                  // 将已获得的数据设置缓存
                  wx.setStorage({key:'user_id', data:data.user_id})    
                  wx.setStorage({key:'name', data:data.name})
                  wx.setStorage({key:'course', data:data.course})
                  wx.setStorage({key:'stu_id', data:data.stu_id})
                  console.log("登录成功，已开始异步设置缓存")
                  // 修改全局变量，表明已经登录
                  globalData.id = data.user_id.id      
                  globalData.openid = data.user_id.openid
                  globalData.name = data.name
                  globalData.course = data.course
                  globalData.stu_id = data.stu_id
                  // 加载课表
                  that.get_course()
                  // 获得用户收藏
                  that.get_item_id_collect_list()
                }
              }
            },
            fail (err){
              console.log(err)
            }
          })
        }
      },
    })
  },


  // 2 检查用户的登录状态，并判断是否重新登录，即 没有id，则得重新登录
  text_login(){
    let that = this
    wx.getStorage({
      key: 'user_id',   // 先取user_id 判断是否有登录状态
      success (res) {
        // 从缓存中提取名称和课表
        that.set_data_from_storage()
        globalData.id = res.data.id
        globalData.openid = res.data.openid
        that.get_item_id_collect_list()
      },
      fail (res){
        // 没有user_id
        that.user_login()
      }
    })
  },

  // 3 从缓存中获得需要的数据
  set_data_from_storage(){
    let that = this
    wx.getStorage({   
      key:'name',
      success(res){
        globalData.name = res.data
      }
    })
    wx.getStorage({   
      key:'course',
      success(res){
        globalData.course = res.data,
        that.get_course()
      }
    })
    wx.getStorage({
      key:'stu_id',
      success(res){
        globalData.stu_id = res.data
      }
    })
    wx.getStorage({
      key:'photo_path',
      success(res){
        globalData.photo_path = res.data
      }
    })
  },

  // 4 下载图片函数
  downloadFile(url){ 
    let  that = this
    wx.downloadFile({
      url: url,
      success(res){
        if (res.statusCode === 200) {
          const tempFilePath = res.tempFilePath
          that.photo_to_sto(tempFilePath)   // 放入内存
          globalData.photo_path = tempFilePath
        }
      }
    })
  },

  // 4 从服务器上获得头像，并放入缓存
  get_photo(id, photo_type){
    var url = globalData.img_root + '/dir1/user_photo/' + id + '.' + photo_type
    this.downloadFile(url)
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

  // 6 获得用户的收藏列表
  get_item_id_collect_list(){
    let that = this
    const form_data={
      id:globalData.id,
      openid:globalData.openid
    }
    wx.request({
      url: globalData.path_ + '/life/get_manage_info/2',
      method:'GET',
      data:form_data,
      success(res){
        globalData.item_id_collect_list = res.data.item_id_list
      }
    })
  },

  // 7 获得校历
  get_semester_info(){
    let that = this
    wx.request({
      url: globalData.path_ + '/course/get_semester',
      success(res){
        globalData.semester_info = res.data
        that.course_init()
      }
    })
  },
})