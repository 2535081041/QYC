# -*- coding:utf-8 # -*-
"""
作者：86153
日期：2023年07月08日
"""
import urllib.parse
import ssl

# todo 设置ssl的传输文件
SSL_CONTEXT = ssl.SSLContext(ssl.PROTOCOL_TLSv1_2)
SSL_CONTEXT.set_ciphers('ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE')   # 传输算法
SSL_CONTEXT.load_cert_chain('/project/ssl_proof/cxjweb.top_bundle.crt', '/project/ssl_proof/cxjweb.top.key')    # 证书


# todo 数据库相关配置
DATABASE_HOSTNAME = "127.0.0.1"  # 数据库ip
DATABASE_PORT = 3306  # 数据库端口
quoted_username = urllib.parse.quote_plus('root')  # 用户
quoted_password = urllib.parse.quote_plus("Cxj20011019!")  # 密码
tem_DATABASE = 'tem_xiaomeng_db'  # 测试环境数据库名称
DATABASE = 'xiaomeng_db'  # 生产数据库名称

# todo 运行相关配置
# session_expire_time =   259200 # session的过期时间为3天
session_expire_time =   30 # session的过期时间为0

class DevelopmentConfig:  # 测试环境配置
    DEBUG = True
    SECRET_KEY = '1112233'
    SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{quoted_username}:{quoted_password}@{DATABASE_HOSTNAME}:{DATABASE_PORT}/{tem_DATABASE}?charset=utf8"
    PERMANENT_SESSION_LIFETIME = session_expire_time
    SSL_CONTEXT=SSL_CONTEXT
    MAX_CONTENT_LENGTH = 100 * 1024 * 1024

class ProductionConfig:  # 生产环境配置
    DEBUG = True
    SECRET_KEY = '1112233'
    SQLALCHEMY_DATABASE_URI = f"mysql+pymysql://{quoted_username}:{quoted_password}@{DATABASE_HOSTNAME}:{DATABASE_PORT}/{DATABASE}?charset=utf8"
    PERMANENT_SESSION_LIFETIME = session_expire_time
    SSL_CONTEXT=SSL_CONTEXT
    MAX_CONTENT_LENGTH = 100 * 1024 * 1024

