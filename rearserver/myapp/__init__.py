# -*- coding:utf-8 # -*-
"""
作者：86153
日期：2023年07月08日
"""

"""
应用程序的配置文件
"""
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import  Migrate
from my_app.myconfig import DevelopmentConfig, ProductionConfig

# todo 注册对象
app = Flask(__name__, root_path='/XM/TY', static_folder='./static', template_folder='./templates')

# todo 导入配置
app.config.from_object(ProductionConfig)


# todo 链接数据库
db = SQLAlchemy(app)
migrate = Migrate(app,db)

# todo 导入蓝图
from my_app.user.user_views import user_V
app.register_blueprint(user_V)
from my_app.course.course_views import course_V
app.register_blueprint(course_V)
from my_app.life.life_views import life_V
app.register_blueprint(life_V)
from my_app.other.other_views import other_V
app.register_blueprint(other_V)

# todo 导入其他需要的函数，比如钩子函数
# from my_app.app_func.other_func import  *

