import json

from flask import Blueprint, request
from my_app.course.course_func import *
from my_app.course import semester_info

course_V = Blueprint('course_V', __name__, url_prefix='/XM/TY/course') # 注册蓝图

# 获取学期信息接口
@course_V.get('/get_semester')
def get_semester():
    return semester_info

# 接收账号密码，爬虫课表接口
@course_V.get('/get_course')
async def get_course():
    """
    接收账号密码，爬虫该学生课表，先判断id和opencd id，再验证密码
    若密码正确爬取最近课表并返回，异步保存旧课表。
    若密码错误，返回错误信息
    :return: 最近课表，或错误信息
            ('200'：成功获得课表，'403':没有访问限权，’401‘学号密码错误，’500‘教务系统繁忙
    """
    params = {
        'id' : request.args.get('id'),
        'openid': request.args.get('openid'),
        'stu_id' : request.args.get('stu_id'),
        'password': request.args.get('password')
    }

    return get_stu_course(**params)

# 更改课表函数接口
@course_V.get('/change_course')
async def change_course():
    params = {
        'stu_id' : request.args.get('stu_id'),
        'semester': request.args.get('semester')
    }
    return get_other_course(**params)


