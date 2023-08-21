"""
帖子模块模型：
item:
    item_id:自增id，主键
    item_time:帖子发布的时间
    item_title：主题，
    item_body: 帖子的内容，text数据类型
    item_img_num:帖子图片的数量，string(1)
    item_img_type:帖子图片的格式，
    item_status:帖子的状态，string(1)
    id:外键
"""
import os

from my_app import db
from my_app.user.user_models import User
class Item(db.Model):
    __tablename__ = "item"

    # 字段
    item_id = db.Column(db.Integer, primary_key=True, autoincrement=True)      # 自增主键
    item_time = db.Column(db.DateTime)      # 帖子入库时间
    item_timestamp = db.Column(db.String(20))   # 用户点击发布时间戳
    item_title = db.Column(db.String(15))
    item_body = db.Column(db.Text)
    item_img_num = db.Column(db.String(1))
    item_img_type = db.Column(db.String(15))
    item_status = db.Column(db.String(1), default='1')
    # 外键，关联user表中的id
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))

    # 建立ORM模型，以及双向绑定，
    # 第一个参数表示关联的模型，第二个参数表示该模型中用于关联本模型的属性
    user = db.relationship("User", back_populates='item')

    def info(self):
        """
        返回当前帖子的信息，字典类型
        :return:
        """
        name = self.user.name
        # 发布者的id
        user_id = str(self.user_id)
        # 获得发布者的头像路径
        photo_path = '/user_photo/' + user_id + '.' + self.user.photo_type
        # 获得帖子图片路径
        img_path = []
        item_timestamp = self.item_timestamp
        item_img_num = self.item_img_num
        item_img_type = self.item_img_type.split(" ")
        for index in range(int(item_img_num)):
            path = "/item_img/dir1/" + item_timestamp + '_' + user_id + '_' + str(index) + '.' + item_img_type[index]
            if os.path.exists("../img" + path):
                img_path.append(path)
            pass
        return {
            "item_id": self.item_id,
            "item_time": str(self.item_time)[:-3],  # 帖子发布时间
            "item_title": self.item_title,  # 帖子主题
            "item_body": self.item_body,  # 帖子内容
            "name": name,  # 发布者名称
            "photo_path": photo_path,  # 发布者头像路径
            "img_path": img_path,  # 帖子图片路径
        }


class Comment(db.Model):
    __tablename__ = "comment"

    com_id = db.Column(db.Integer, primary_key=True, autoincrement=True)    # 主键
    com_time = db.Column(db.DateTime)
    com_value = db.Column(db.Text)
    com_father = db.Column(db.Integer)
    com_father_name = db.Column(db.String(8), default='')
    com_status = db.Column(db.String(1), default='1')
    item_id = db.Column(db.Integer)     # 帖子id
    user_id = db.Column(db.Integer)     # 发表人id

    def info(self):
        """
        将某个评论的信息转化为json格式，用于返回给前端，在此处会对评论近处理，
        即会查找user_photo_url,usr_name，以及判断评论的状态来决定返回的数据情况
        :return:
        """
        user = User.query.get(self.user_id)
        if not user.photo_type:
            photo_type = ''
        else:
            photo_type = '/user_photo/' + str(user.id) + '.' + user.photo_type
        return {
            "com_id" : self.com_id,
            "com_time":str(self.com_time)[:-3],
            "com_value" : self.com_value,
            "com_father" : self.com_father,
            "com_father_name" : self.com_father_name,
            "com_status": self.com_status,
            "item_id" : self.item_id,
            "user_id":self.user_id,
            "user_name":user.name,
            "user_photo_url": photo_type,
        }


class Item_Comment(db.Model):
    __tablename__ = 'item_comment'

    item_id = db.Column(db.Integer, primary_key = True, index=True)
    com_id_list = db.Column(db.Text, default='')
    com_num = db.Column(db.Integer, default=0)
    collect_num = db.Column(db.Integer, default=0)

    def get_num(self):
        """
        获得某个帖子的评论数与收藏数组成的元组，
        :return: (com_num, collect_num)
        """
        return self.collect_num, self.com_num

class User_Item_Com(db.Model):
    __tablename__ = 'user_item_com'

    user_id = db.Column(db.Integer, primary_key=True, index=True)
    item_id_emit_list = db.Column(db.Text, default='')   # 用户发布的帖子id
    item_id_collect_list = db.Column(db.Text, default='')   # 用户收藏的帖子id
    item_id_com_list = db.Column(db.Text, default='')   # 用户参与评论的帖子id
    com_id_list = db.Column(db.Text, default='')    # 用户的评论id

    def info(self, index):
        """
        返回指定的item_id列表
        :param index:
            index = '1' 表示获得发表的
            index = '2' 表示收藏
            index = '3' 表示评论
        :return:
        """
        if index == '1':
            item_id_emit_list = self.item_id_emit_list
            if not item_id_emit_list:
                return []
            else:
                return list(map(int,item_id_emit_list.strip().split(" ")))
        elif index == '2':
            item_id_collect_list = self.item_id_collect_list
            if not item_id_collect_list:
                return []
            else:
                return list(map(int,item_id_collect_list.strip().split(" ")))
        elif index == '3':
            item_id_com_list = self.item_id_com_list
            if not item_id_com_list:
                return []
            else:
                item_id_com_list = list(map(int,set(item_id_com_list.strip().split(" "))))
                return item_id_com_list
        else:
            return []




    def update(self, index, del_item_id):
        """
        根据del_item_id修改模型
        :param index: 修改的字段
        :param del_item_id: 被删除了的帖子id
        :return:
        """
        if len(del_item_id) == 0:
            return "1"
        else:
            db.session.begin()
            try:
                if index == '1':    # 修改发表字段
                    item_id_emit_list: list = self.info(index)
                    for item_id in del_item_id:
                        item_id_emit_list.remove(item_id)
                    self.item_id_emit_list = ' '.join(item_id_emit_list) + ' '
                elif index == '2':  # 修改收藏字段
                    item_id_collect_list: list = self.info(index)
                    print(item_id_collect_list)
                    print(del_item_id)
                    for item_id in del_item_id:
                        item_id_collect_list.remove(item_id)
                    print(item_id_collect_list)
                    self.item_id_collect_list = ' '.join(item_id_collect_list) + ' '
                    print(self.item_id_collect_list)
                elif index == '3':
                    item_id_com_list: list = list(map(int, self.item_id_com_list.strip(" ")[:-1]))
                    for item_id in del_item_id:
                        count = item_id_com_list.count(item_id)
                        for _ in range(count):
                            i = item_id_com_list.index(item_id)
                            del item_id_com_list[i]
                    self.item_id_com_list = " ".join(item_id_com_list)+' '
                else:
                    db.session.rollback()
                    return "0"
                print("这里")
                db.session.commit()
                return '1'
            except Exception as e:
                db.session.rollback()
                print(e)
                return "0"
