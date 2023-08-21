from flask import Blueprint, request
from my_app.course.course_func import *

other_V = Blueprint('other_V', __name__, url_prefix='/XM/TY/other') # 注册蓝图


# 获取其他页面中的信息
@other_V.get('/get_info')
def get_info():
    info = [{
        "title":'关于体验版',
        "body":'目前所在版本为体验版，体验版中的数据将将在正式版上线后被删除 ',
    },
    ]
    return info

"""
弹窗无法出现，接口onload问题未解决
"""