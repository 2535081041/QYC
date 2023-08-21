"""
对于user模块，主要的功能有：
登录：个人信息上传到数据库--- add()
修改：部分信息进行修改 ---   update
"""
import os.path

from flask import Blueprint, request
from my_app.user.user_func import *
from my_app.user import user_photo_path

user_V = Blueprint('user_V', __name__, url_prefix='/XM/TY/user')      # 注册蓝图


# 获得用户登录的code，换取唯一标识符，并录入数据库
@user_V.get('/login')
async def login():
    """
    获得用户登录的code，换取唯一标识符，并录入数据库，返回一定数据
    :return: 0 表示登录失败， json 前端需要缓存的数据
    """
    code  = request.args.get('code')      # 获得发来的code
    info = get_user_info(code)              # 请求成功获得openid 和session_key，反之获得errcode

    if info.get('errcode'):     # 获得失败
        print(info.get('errmsg'))
        return '0'
    else:           # 获得成功，记录数据并返回数据
        print(info)
        openid = info.get('openid')     # 获得唯一标识符
        session_key = info.get('session_key')   # session_key
        new_info = update_info(openid, session_key)      # 更新数据库，并获得新的用户信息，返回给前端
        return new_info


# 图片和头像修改接口
@user_V.post('/upload/<upload_type>')
async def upload(upload_type):
    """
    图片头像修改接口，
    当upload_type为name，表明为名称修改
    当upload_type为photo，表明为头像修改
    :return:   “1”修改成功
    """
    id = request.form.get('id')
    openid = request.form.get('openid')
    db.session.begin()
    user = User.query.get(id)
    if upload_type == 'photo':
        photo = request.files['photo']  # <FileStorage: 'zC1OeeeMiScd2beb3a1296e556c9b381a12c3e38379f.jpeg' ('image/jpeg')>
        # todo 先删除原有的图片
        old_photo_path = user_photo_path + id + '.' + str(user.photo_type)
        if os.path.exists(old_photo_path):
            os.remove(old_photo_path)

        # todo 保存新图片
        img_type = photo.filename.split('.')[-1]  # 获得照片的后缀
        new_photo_path = user_photo_path + id + '.' + img_type  # 保存路径
        user.photo_type = img_type
        photo.save(new_photo_path)
        db.session.commit()
        return "1"
    elif upload_type=='name':
        name = request.form.get('name')
        user.name = name
        db.session.commit()
        return "1"
    else:
        return "404"


