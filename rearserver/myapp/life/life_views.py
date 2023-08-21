from flask import Blueprint, request, abort
from datetime import datetime
from my_app.life.life_func import *
from my_app.life import item_img_path
from my_app.life.life_models import Item_Comment, User_Item_Com

life_V = Blueprint('life_V', __name__, url_prefix='/XM/TY/life')      # 注册蓝图

@life_V.get('/')
def text():
    # db.create_all()
    return "0"

# 发表帖子函数，接收图片，主题，内容
@life_V.post('/emit_item/<item_type>')
async def emit_item(item_type):
    if item_type == 'txt': # 处理帖子的文本数据
        args = {
            'time' : datetime.now(),  # 获得当前时间,
            'timestamp' : request.form.get('timestamp'),  # 获得发布时的时间戳
            'title' : request.form.get('title'),
            'body' : request.form.get('body'),
            'img_num' : request.form.get('img_num'),
            'img_type' : request.form.get('img_type'),
            'user_id': request.form.get('id'),
        }
        print(args)
        condition, item_id = create_item(**args)

        return {"condition": condition, "item_id" : item_id}
    elif item_type == 'img':     # 处理图片数据
        try:
            id = request.form.get('id')
            timestamp = request.form.get('timestamp')
            index = request.form.get('index')

            img = request.files['img']
            img_type = img.filename.split('.')[-1]  # 获得照片的后缀
            filename = str(timestamp) + '_' + id + '_' + index +  '.' + img_type  # 文件名 时间戳_id_index
            save_path = item_img_path + filename     # 保存路径,
            img.save(save_path)
            print("图片保存成功")
            return "1"
        except Exception as e:
            print(e)
            return "0"
    else:
        return  "0"

# 对于发表失败的item直接进行删除，对于用户主动删除的item，设置为不可见
@life_V.post('/delete_item/<del_type>')
async def delete_item(del_type):
    """
    接收客户发送的item_id，将该item进行删除或隐藏。
    del_type==0：表示发表失败造成的请求，对item进行删除
    del_type==1：表示用户手段发起的请求，对item进行隐藏
    :return: 操作结构
    """
    user_id = int(request.form.get('id'))
    item_id = int(request.form.get("item_id"))
    if del_type == "0":
        status = del_item(user_id, item_id)
        return status
    elif del_type == "1":
        status = hidden_item(user_id, item_id)
        return status
    else:
        return "0"

# 帖子获取接口
@life_V.get('/get_item/<item_id>/<get_type>')
def get_item(item_id, get_type):
    """
    客户端可以通过此段来获得帖子，每次发送都是5条记录，
    :param get_type: 表明请求的类型
    :param item_id: 表示用户已经请求了的最小item_id，
            当get_type == 0 & item_id == 0：表示第一次请求，此时的item_id为0，返回最新的n条记录
            当get_type == 1 & item_id == x：表示请求更多item，此时将返回比item_id更早的前n条数据
            当get_type == -1 & item_id == x：表示请求更新的数据，此时将返回比item_id更晚的全部数据
    :return: item_info 帖子的信息，为字典列表：[{},{},{}...]
            包含：item_time\item_title、item_body、name、photo_path、img_path:[]
    """
    n = 10      # 表示每次返回的帖子数
    if item_id == '0':
        items = Item.query.filter(Item.item_status=="1").order_by(Item.item_id.desc()).limit(n).all()
    elif get_type=="1":
        items = Item.query.filter(and_(Item.item_id<item_id, Item.item_status=='1')).order_by(Item.item_id.desc()).limit(n).all()
    elif get_type == "-1":
        items = Item.query.filter(and_(Item.item_id>=item_id, Item.item_status=='1')).order_by(Item.item_id.desc()).all()
    else:
        abort(404)
        items = [Item]

    if len(items) == 0:
        return ''
    else:
        item_ids = []
        result = {}
        for item in items:
            item_ids.append(item.item_id)
            result[item.item_id] = item.info()

        return {"items":result, "item_ids":item_ids}


# 评论发布接口
@life_V.post('/emit_comment')
async def emit_comment():
    """
    发表评论接口，根据获得的评论，在comment中建立一条记录，再根据com_id修改item_comment数据库
    :return:
    """

    args = {
        "com_time" : datetime.now(),
        "com_value"  : request.form.get('com_value'),
        "com_father"  : request.form.get('com_father'),
        "com_father_name": request.form.get("com_father_name"),
        "item_id" : request.form.get('item_id'),
        "user_id"  : request.form.get('id')
    }
    status, new_comment = create_comment(**args)
    return {"status":status, "new_comment":new_comment}

# 评论删除接口
@life_V.post('/delete_comment')
async def delete_comment():
    user_id = request.form.get("id")
    item_id = request.form.get("item_id")
    com_id = request.form.get("com_id")
    status = del_comment(user_id, item_id, com_id)
    return status


# 评论获取接口
@life_V.get('/get_comment')
def get_comment():
    """
    根据上传来的item_id获得该评论
    :return:
    """
    item_id = int(request.args.get('item_id'))
    item_comment = Item_Comment.query.get(item_id)
    com_num = item_comment.com_num
    if com_num > 0:
        com_id_list: str = item_comment.com_id_list
        com_id_list:list = com_id_list.split(' ')[:-1]
        comments = Comment.query.filter(Comment.com_id.in_(com_id_list)).all()  # 获得orm模型的列表
        comments = list(map(lambda  comment:comment.info(), comments))       # 将orm模型转化为字典
        father_comments,  child_comments = fliter_comments(comments)
    else:
        father_comments,child_comments = [],{}
    return {"father_comments":father_comments, "child_comments": child_comments, "com_num":com_num}


# 帖子管理模块，用户参与的帖子的信息
@life_V.get('/get_manage_info/<info_index>')
def get_manage_info(info_index):
    """
    获得user_id的发表、收藏、评论的帖子id和帖子
    :param info_index:
        当info_index = 1 表示获得发表的
        当info_index = 2 表示收藏
        当info_index = 3 表示评论
    :return: 收藏、评论、发表的帖子列表组成的字典， 和 对应的帖子
    """
    user_id = request.args.get('id')
    user_item_com = User_Item_Com.query.get(user_id)
    # todo 获得需要item_id
    item_id_list = user_item_com.info(info_index)
    item_id_list = list(set(item_id_list))
    # todo 根据item_id获得内容
    del_item_id = []    # 记录已经删除的记录
    new_item_id_list = []
    result = {}
    items = Item.query.filter(Item.item_id.in_(item_id_list)).all()
    for item in items:
        if item.item_status == '1':
            result[item.item_id] = item.info()
            new_item_id_list.append(item.item_id)
        else:
            del_item_id.append(item.item_id)
    # todo 根据已经删除的记录修改user_item_com模型
    # user_item_com.update(info_index, del_item_id)
    return {"items": result, "item_id_list":new_item_id_list[::-1]}

# 收藏帖子接口
@life_V.post('/collect/<post_type>')
async def collect(post_type):
    """
    收藏帖子接口，根据用户提交的user_id，item_id来更新收藏信息（user_item_com,item_comment)
    当ost_type=='collect'时，表示收藏帖子
    当post_type=='dis_collect'时，表示取消收藏帖子
    :return: 更新结果
    """
    user_id = request.form.get('id')
    item_id = request.form.get('item_id')
    status = update_collect_info(user_id, item_id, post_type)
    return status

# 帖子评论数，收藏数的获取接口
@life_V.get('/get_col_com_num')
def get_col_com_num():
    item_ids = request.args.get('item_ids')     # 获得的是字符串：’[1,2,3]'
    print(item_ids)
    item_ids = list(map(int,item_ids[1:-1].split(',')))         # 转化为int列表
    item_comments = Item_Comment.query.filter(Item_Comment.item_id.in_(item_ids))
    result = {}
    for item_comment in item_comments:
        result[item_comment.item_id] = item_comment.get_num()
    return  result




"""
1 删除了的帖子还是会显示
"""