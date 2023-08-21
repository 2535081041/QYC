from my_app import app
from flask import request, abort
from my_app.user.user_models import User

# todo 钩子函数，每次请求前验证身份，并写入日志
@app.before_request
def text_request():
    if request.method == 'GET':
        id = request.args.get('id')
        openid = request.args.get('openid')
    elif request.method == 'POST':
        id = request.form.get('id')
        openid = request.form.get('openid')
    else:
        abort(404)

    user = User.query.get(id)
    if not user:
        abort(404)
    elif user.openid != openid:
        abort(404)
