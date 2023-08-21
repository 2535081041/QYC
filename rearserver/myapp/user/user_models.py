"""
user模块的的数据库模型
user:
    id：自增，作为主键
    openid：每一个微信的唯一标识符
    stu_id:学号
    photo_type：记录图片格式
    name：用户昵称
    session_key：其他微信授权的东西
"""

from my_app import db

class User(db.Model):   # 必须继承 db.Model
    __tablename__ = "user"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)      # 自增主键
    openid = db.Column(db.Text)     # 微信号的唯一标识符
    stu_id = db.Column(db.String(15))
    name = db.Column(db.String(8), default='不留名校友')
    session_key = db.Column(db.Text)
    photo_type = db.Column(db.String(13))
    # 建立双向绑定的ORM模型，指定以本模型为id为外键的模型
    # 第一个参数表示关联的模型，第二个参数表示该模型中用于关联本模型的属性
    item = db.relationship("Item", back_populates='user')
