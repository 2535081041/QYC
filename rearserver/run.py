
from my_app import app

run_host = "0.0.0.0"        # 必须以这个为host，否则无法连接
KF_PORT = 5002
TY_PORT = 5001
app.run(host=run_host, port=TY_PORT, ssl_context=app.config['SSL_CONTEXT'])

