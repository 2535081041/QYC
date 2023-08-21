import json

import requests
from my_app.user.user_models import User
from flask import jsonify
from my_app import db
from my_app.course.course_func import year_sem
from my_app.life.life_models import User_Item_Com

""" 重要数据 """
appid = ''
secret = ''
grant_type = ''

# todo 根据code换取用户信息
def get_user_info(code):
    url = 'https://api.weixin.qq.com/sns/jscode2session?'

    params = {
        "appid": appid,
        "secret" : secret,
        'grant_type': grant_type,
        'js_code': code,
    }
    info = requests.get(url=url, params=params)
    return  info.json()

# todo 用户没有缓存时，更新用户信息，并返回给客户端
def update_info(openid, session_key):
    """
    传入用户的openid，session_key，判断是否已经存在openid，存在则更新session_key,反之新建记录
    :param openid:
    :param session_key:
    :return: 前端所需json数据，返回'0'说明数据库提取数据失败
    """
    db.session.begin()      # 开启事务
    try:
        user = User.query.filter_by(openid=openid).first()
        if user:
            user.session_key = session_key  # 修改数据库中的session_key
            print("openid已经存在")
        else:
            user = User(openid=openid, session_key=session_key)  # 新建user记录
            db.session.add(user)
            user_item_com = User_Item_Com(user_id = user.id)    # 新建user_item_com记录
            db.session.add(user_item_com)
        db.session.commit()     # 事务提交
    except Exception as e:
        db.session.rollback()   # 事务回滚
        print(e)
        return '0'

    if user.stu_id:     # 学号为空说明用户未同步课表
        stu_id = user.stu_id
        semester = year_sem[0]
        path = '../course/' + str(stu_id) + '/' + semester + '.json'
        with open(path) as f:
            course = json.load(f)
    else:           # 学号不为空说明课表可能已经存在
        course = ''     # 所以课表为空
        pass

    res = {
        'user_id':{
            'id': user.id,
            'openid': user.openid,
        },
        'name':user.name,
        'course': course,
        'stu_id':user.stu_id,
        'photo_type': user.photo_type
    }

    return jsonify(res)     # 转化为json进行返回

