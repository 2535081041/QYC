import asyncio
import json
import threading
from my_app.app_func.grab_func import JW
from my_app.user.user_models import User
from my_app import  db
import os

# 记录最近5年的所有学年学期
year_sem = ["2023-2024-1",
            "2022-2023-2", "2022-2023-1",
            "2021-2022-2", "2021-2022-1",
            "2020-2021-2", "2020-2021-1",
            "2019-2020-2", "2019-2020-1",
            "2018-2019-1"]

# todo 获取课表函数接口
def get_stu_course(id, openid, stu_id, password):
    """
    根据学号密码抓取课表，检查是否已经记录有该学号的课表，如果有only_latest为true表示只抓取最近的课表
    :param id:
    :param openid:
    :param password:
    :param stu_id:
    :param only_latest: 为true表示只抓取最近课表，用于同步更新操作；为False表示抓取所有课表，用于第一次登录操作，在这种情况下，除最新课表外，其他课表都将异步进行
    :return: 请求成功返回字典形式的课表
    """

    # todo 0 验证接口身份
    user = User.query.filter_by(id=id).first()
    if not user or user.openid != openid:       # 未通过接口认证，没有访问限权
        status_code = '403'
        course = ''
    else:
        # todo 1 尝试连接，获得状态码，200 连接成功，500广大服务器有问题，401 学号密码有误
        stu_client = JW(stu_id,  password)  # 初始化连接
        try:
            status_code = stu_client.login()
        except Exception as e:
            print(e)
            print("服务器有问题")
            status_code = '500'
        print(status_code)
        if status_code != '200':
            course = ''
        else:
            # todo 2  将学号写入数据库
            user.stu_id = stu_id
            db.session.commit()

            # todo 3 抓取课表
            # course = ''
            course = stu_client.get_course(year_sem=year_sem[0])        # 最近的课表

            # todo 4 开启新线程，写入课表，抓取其他课表
            threading.Thread(target=write_and_get_other_course, args=(stu_client, course)).start()

    return {'status_code': status_code, 'course': "course"}



# todo  将课表写入文件
def write_to_json(stu_id, time_name, course):
    """
    将课表写入文件
    :param stu_id:  学号
    :param time_name: 文件名，以学期为名
    :param course: 要写入的课程
    :return:
    """
    dir_ = '../course/' + stu_id + '/'
    name_ = time_name + '.json'
    if not os.path.exists(dir_):        # 判断是否已经有文件夹
        os.makedirs(dir_)
    with open(dir_ + name_, 'w', encoding='utf-8') as f:
        json.dump(course, f,ensure_ascii=False, indent=4)


# todo  异步将最近课表写入服务器，以及获取其他文件
def write_and_get_other_course(stu_client:JW, course):
    """
    新线程，将最近课表写入文件，并抓取新的课表
    :param stu_client: 教务系统的连接类
    :param course: 最近课表
    :return:
    """
    print("多线程开始")

    stu_id = stu_client.username
    if len(course['course_list']) != 0:
        write_to_json(stu_id, year_sem[0], course)

    async  def get_other_course2(time_name):
        path = '../course/' + stu_id + '/' + time_name + '.json'
        if not os.path.exists(path):
            other_course = stu_client.get_course(time_name)
            write_to_json(stu_id, time_name, other_course)

    async def get_other_course1():
        tasks = []
        for time_name in year_sem[1:]:
            tasks.append(get_other_course2(time_name))
        await asyncio.gather(*tasks)

    try:
        asyncio.run(get_other_course1())
    except Exception as e:
        print(e)

# todo  获得非最近课表
def get_other_course(stu_id, semester):
    """
    获取非最近学期的课表，接收学号，以及学期
    :param stu_id:
    :param semester:
    :return:
    """
    path = '../course/' + stu_id + '/' + semester + '.json'
    with open(path, 'r') as f:
        course = json.loads(f.read())
        f.close()
    return  course