import base64

import requests
path = 'https://cxjweb.top/XM/TY'

def text1():
    import requests
    form = {
        "v_id": 100,
        "name": 10
    }
    params ={
        'code': "0d3upM0w3egO513ZQK1w3lWeSi4upM0j"
    }
    url = 'https://cxjweb.top' + '/user'
    res = requests.get(url=url)
    print(res.text)
    print(res)

def text2():
    import requests

    url = 'https://api.weixin.qq.com/sns/jscode2session?'

    params = {
        "appid": 'wxc2fc7af90be4eecd',
        "secret" : '378894de65095f44d5dc9bc9b9eb20ce',
        'grant_type': 'authorization_code',
        'js_code': '0a3Ug60005bkpQ1icF200tUpen1Ug60q'
    }
    info = requests.get(url=url, params=params)
    print(info.json())

# 获得本地的json文件
def text3():
    import json
    stu_id = '2007200032'
    semester = '20231'
    path = '../course/' + stu_id + '/' + semester + '.json'
    with open(path) as f:
        data = json.load(f)
    print(data)
    return


# 爬取课表
def text4():
    import requests

    url = path + '/course' +'/get_course'

    params = {
        'id' : '1',
        'openid': 'oFyyI64D0v111nctStkGwXITGshc',
        'stu_id' : '2007200032',
        'password': 'Cxj20011019!'
    }

    info = requests.get(url=url, params=params)
    print(info.json())

def text5():
    data = {
        "index": 0
    }
    url = path + '/life/emit'
    info = requests.post(url, data=data)
    print(info)

def text6():
    url = path + '/life/'
    res = requests.get(url)
    print(res.text)

def text7():
    url = path + '/life/emit/img'
    data = {
        "index": 0
    }
    headers = {'Content-Type': 'multipart/form-data'}

    with open("./text.py","rb") as f:
        data = f.read()
    data = {"data": data}
    requests.post(url,  files=data)
    pass

def text8():
    url = path + '/life/get_col_com_num'
    params = {
        "id": 2,
    }
    res = requests.get(url, params=params)


    print(res.text)


def text9():
    url = path + '/life/get_manage_info/1'
    params = {
        "item_ids":[]
    }
    res = requests.get(url, params=params)


    print(res.text)

if __name__ == "__main__":
    text4()
