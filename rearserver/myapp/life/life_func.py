import os.path

from sqlalchemy import and_

from my_app.life.life_models import Item, Item_Comment, Comment, User_Item_Com
from my_app.user.user_models import User
from my_app import db
from my_app.life import item_img_path

def create_item(time, timestamp, title, body, img_num,img_type, user_id):
    """
    创建帖子，修改数据如下
    1 记录帖子的详细信息，填comment中添加一条数据
    2 为帖子创建评论空间， 再item_comment中创建一条记录
    3 更新用户发表的帖子情况， 修改user_item_com中的item_id_emit_list
    :return: 返回帖子的item_id
    """
    item_id = '-1'
    db.session.begin()
    try:
        # todo 新建一条item记录
        user = User.query.get(user_id)
        item = Item(item_time=time,
                    item_timestamp= timestamp,
                    item_title=title,
                    item_body=body,
                    item_img_num=img_num,
                    item_img_type=img_type,
                    user=user)
        db.session.add(item)

        # todo 为帖子创建评论空间， 再item_comment中创建一条记录
        item_id = item.item_id
        item_comment = Item_Comment(item_id=item_id)
        db.session.add(item_comment)

        # todo 更新用户发表的帖子情况， 修改user_item_com中的item_id_emit_list
        user_item_com = User_Item_Com.query.get(user_id)
        user_item_com.item_id_emit_list += str(item_id) + ' '

        db.session.commit()
        condition = "1"
        print("建立成功")
    except Exception as e:
        db.session.rollback()
        print(e)
        condition = "0"
    return  condition, item_id


def del_item(user_id, item_id):
    """
    删除帖子，删除前需确认item_id的user_id 为id
    :param user_id: 发起请求的用户id
    :param item_id: 删除的帖子id
    :return:
    """
    db.session.begin()
    try:
        item = Item.query.get(item_id)
        timestamp = item.item_timestamp
        img_num = item.item_img_num
        img_type = item.item_img_type
        if item.user_id == int(user_id):     # 确保身份后进行再进行删除操作
            # 先删除数据中的数据
            db.session.delete(item)

            # 删除图片
            if int(img_num)>0:
                img_type = img_type.split(" ")
                for i, type_ in enumerate(img_type):
                    img_path = item_img_path + timestamp + '_' + user_id + '_' + str(i) + '.' + type_
                    if os.path.exists(img_path):
                        os.remove(img_path)
            db.session.commit()
            return "1"
        return "0"
    except Exception as e:
        db.session.rollback()
        print(e)
        return "0"

def hidden_item(user_id, item_id):
    """
    删除用户的帖子：，需先确定身份
    1 修改item，隐藏该帖子
    2 修改user_item_com,修改用户已经发表的帖子
    :return:
    """
    db.session.begin()
    try:
        # todo 修改帖子情况
        item = Item.query.get(item_id)
        if item.user_id != user_id:
            return "0"
        item.item_status = '0'

        # todo  修改用户发表的帖子情况
        user_item_com = User_Item_Com.query.get(user_id)
        item_id_emit_list:list = user_item_com.item_id_emit_list.split(" ")[:-1]
        item_id_emit_list.remove(str(item_id))
        user_item_com.item_id_emit_list = ' '.join(item_id_emit_list) + ' '

        db.session.commit()
        return "1"
    except Exception as e:
        print(e)
        db.session.rollback()
        return "0"
    pass


def create_comment( com_time, com_value, com_father, com_father_name, item_id, user_id):
    """
    创建评论：
    1 创建评论
    2 记录每一个帖子的评论情况，修改item_comment数据库
    3 记录每一个用户的评论情况，修改user_item_com数据库中的item_id_com_list字段
    :return: 修改结果
    """
    db.session.begin()
    try:
        # 创建评论
        comment = Comment(
            com_time=com_time,
            com_value=com_value,
            com_father=com_father,
            com_father_name=com_father_name,
            item_id=item_id,
            user_id=user_id,
        )
        print(db.session.add(comment))


        # todo 记录每一个用户的评论情况，修改user_item_com数据库中的item_id_com_list字段
        user_item_com = User_Item_Com.query.get(user_id)
        user_item_com.item_id_com_list += str(item_id) + ' '

        # todo 记录每一个帖子的评论情况，修改item_comment数据库
        item_comment = Item_Comment.query.get(item_id)
        old_com_id_list = item_comment.com_id_list
        old_com_num = item_comment.com_num
        print(comment.com_id)
        print(old_com_id_list)
        item_comment.com_id_list = old_com_id_list + str(comment.com_id) + ' '
        print(item_comment)
        item_comment.com_num = old_com_num + 1


        # 提交
        db.session.commit()
        return "1", comment.info()
    except Exception as e:
        db.session.rollback()
        print(e)
        return "0", {}

def del_comment(user_id, item_id, com_id):
    """
    删除评论函数，用户user_id删除了在帖子item_id中的评论com_id，事务
    1 更新user_id的个人评论情况，user_item_com中的item_id_com_list（因为其可能会有子评论）
    2 更新item_id的评论情况，item_comment中的com_num，但不修改com_id_list
    3 更新com_id的状态， comment中的status
    :param user_id: 发起者
    :param item_id: 所在帖子
    :param com_id: 被删除的评论
    :return:
    """
    db.session.begin()
    try:
        comment = Comment.query.get(com_id)
        if comment.user_id != int(user_id):  return "0" # 确保身份再删除

        # todo  更新user_id的个人评论情况
        user_item_com = User_Item_Com.query.get(user_id)
        item_id_com_list:list = user_item_com.item_id_com_list.split(" ")[:-1]
        item_id_com_list.remove(str(item_id))   # 移除已评论的帖子id
        user_item_com.item_id_com_list = " ".join(item_id_com_list) + ' '

        # todo 更新item_id的评论情况
        item_comment = Item_Comment.query.get(item_id)
        item_comment.com_num -= 1   # 评论数键1

        # todo 更新评论的情况
        comment.com_status = "0"    # 删除状态

        db.session.commit()
        return "1"
    except Exception as e:
        print(e)
        return "0"


def fliter_comments(comments):
    """
    根据status对评论进行筛选
    根据com_father对评论进行排序，实现区分父评论和子评论的效果，父评论为列表，子评论为字典，以父评论id为键，子评论id列表为值
    :param commnets: 待排序的评论列表，已经按时间排序
    :return: [[父评论的com_id，子评论的com_id, ...], ...]
    """
    com_id_lists = []   # 用com_id来区分父子评论，列表的第一个元素为父评论id，之后为对应子评论id
    father_comments = []    # 父评论结果集
    child_comments = {} # 子评论结果集
    father_com_del  = []    # 为删除状态的父评论

    for comment in comments:
        com_id = comment["com_id"]
        com_status = comment["com_status"]
        com_father = comment["com_father"]
        if com_father == 0:     # 为父评论
            com_id_lists.append([com_id])
            child_comments[com_id] = []
            if int(com_status) == 0:     # 父评论为被删除状态，进行特殊处理
                father_com_del.append((com_id, len(father_comments)))
                comment['com_value'] = ''
                comment['user_name'] = ''
                comment['user_photo_url'] = ''
                father_comments.append(comment)
            else:
                father_comments.append(comment)
        else:   # 为子评论
            for com_id_list in com_id_lists:
                if com_father in com_id_list:
                    com_id_list.append(com_id)
                    if int(com_status) == 1:
                        i = com_id_list[0]
                        child_comments[i].append(comment)
                    break


    for father_com_id, index in father_com_del[::-1]:
        if len(child_comments[father_com_id]) == 0:
            father_comments.pop(index)
    return father_comments, child_comments


def update_collect_info(user_id, item_id, post_type):
    """
    更新user_id和item_id的收藏信息，
    当ost_type=='collect'时，表示收藏帖子
    当post_type=='dis_collect'时，表示取消收藏帖子
    对于user_id而言，其收藏帖子增加/删除了item_id，修改user_item_com中的item_id_collect_list
    对于item_id而言，其收藏数量增加/减少，修改item_comment的collect_num
    :param post_type: 更新形式
    :param user_id: 用户id
    :param item_id: 帖子id
    :return: 修改结果
    """
    db.session.begin()
    try:
        if post_type == 'collect':      # 收藏帖子
            # todo 更新用户修改信息
            user_item_com = User_Item_Com.query.get(user_id)
            user_item_com.item_id_collect_list += str(item_id) + ' '
            # todo 更新帖子收藏信息
            item_comment = Item_Comment.query.get(item_id)
            item_comment.collect_num += 1
        elif post_type == 'dis_collect':    # 取消收藏帖子
            # todo 更新用户修改信息
            user_item_com = User_Item_Com.query.get(user_id)
            item_id_collect_list = user_item_com.item_id_collect_list.split(" ")[:-1]
            item_id_collect_list.remove(str(item_id))
            user_item_com.item_id_collect_list = ' '.join(item_id_collect_list) + ' '
            # todo 更新帖子收藏信息
            item_comment = Item_Comment.query.get(item_id)
            item_comment.collect_num -= 1
        else:   return "0"
        db.session.commit()
        return "1"
    except Exception as e:
        print(e)
        db.session.rollback()
        return  "0"
    pass


