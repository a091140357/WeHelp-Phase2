from fastapi import *
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import os
import json
import mysql.connector
from mysql.connector import pooling
from mysql.connector import Error
from dotenv import load_dotenv
import bcrypt
from pydantic import BaseModel
import jwt
import datetime

load_dotenv()

mysql_host = os.getenv("mysql_host")
mysql_user = os.getenv("mysql_user")
mysql_password = os.getenv("mysql_password")
mysql_database = os.getenv("mysql_database")

try:
	db_pool = pooling.MySQLConnectionPool(
		pool_name = "myDBpool",
		pool_size = 5,
		pool_reset_session = True,
		host = mysql_host,
		user = mysql_user,
		password = mysql_password,
		database = mysql_database
	)
	print(f"{"-"*40}連線池建立成功{"-"*40}")
except Exception as e:
	print(f"{"-"*40}連線池建立失敗 {e}{"-"*40}")
	db_pool = None

app=FastAPI()

# Static Pages (Never Modify Code in this Block)
@app.get("/", include_in_schema=False)
async def index(request: Request):
	return FileResponse("./static/index.html", media_type="text/html")
@app.get("/attraction/{id}", include_in_schema=False)
async def attraction(request: Request, id: int):
	return FileResponse("./static/attraction.html", media_type="text/html")
@app.get("/booking", include_in_schema=False)
async def booking(request: Request):
	return FileResponse("./static/booking.html", media_type="text/html")
@app.get("/thankyou", include_in_schema=False)
async def thankyou(request: Request):
	return FileResponse("./static/thankyou.html", media_type="text/html")


@app.get("/api/attractions")
def get_page_data(request:Request, page:int = 0, category:str = None, keyword:str = None):
	#如果沒有建立成功預設給None，讓後面finally作用
	cursor = None
	connection = None

	if page < 0: #防止page有輸入0或負數
		return JSONResponse(
			status_code = 400,
			content = {
				"error":True,
				"message":"page輸入錯誤"
			})
	
	if not db_pool: #確保資料庫連線池可以連線
		return JSONResponse(
			status_code = 500,
			content = {
				"error":True,
				"message":"連線池發生錯誤"
			})
	
	try:
		offset = page * 8
		limit = 9 #多拿一個資料，用於確認有沒有下一頁，但return時只取前8個
		next_page = None #用於如果沒有下一頁，預設給None

		#拿取資料池
		connection = db_pool.get_connection()
		cursor = connection.cursor(dictionary = True)
		
		if category and keyword:
			cursor.execute("SELECT * FROM attractions WHERE category = %s AND (mrt = %s OR name LIKE %s) ORDER BY id LIMIT %s OFFSET %s", (category, keyword, f"%{keyword}%", limit, offset))

		elif category: #如果有使用category查詢，完全對比category與資料庫的category資料
			cursor.execute("select * from attractions where category = %s order by id limit %s offset %s ",(category,limit, offset))
			
		elif keyword: #如果有使用keyword查詢，完全對比keyword與資料庫的mrt資料或模糊對比category與資料庫的category資料
			cursor.execute("select * from attractions where mrt = %s or name like %s order by id limit %s offset %s",(keyword, f"%{keyword}%", limit, offset))

		else:
			cursor.execute("select * from attractions order by id limit %s offset %s",(limit, offset))
		
		data = cursor.fetchall()

		for i in data: #把資料庫拿到資料中的images轉回json格式再放回去
			i["images"] = json.loads(i["images"])

		if len(data) > 8: #判斷有沒有下一頁
			data = data[:8]
			next_page = page + 1

		return {
			"nextPage":next_page,
			"data":data
			}

	except Exception as e:
		return JSONResponse(
			status_code = 500,
			content = {
				"error":True,
				"message":str(e)
			})
	finally:
		if cursor is not None:
			cursor.close()
		if connection is not None and connection.is_connected(): #如果一開始就沒連到或中間連線斷掉，就關閉資料池連線
			connection.close()

@app.get("/api/attraction/{attractionId}")
def get_id_data(request:Request, attractionId:int):
	#如果沒有建立成功預設給None，讓後面finally作用
	cursor = None
	connection = None
	
	#防止attractionId輸入0或負數
	if attractionId < 1:
		return JSONResponse(
			status_code = 400,
			content = {
				"error":True,
				"message":"attractionId 輸入錯誤"
		})

	try:
		#取得連線池
		connection = db_pool.get_connection()
		cursor = connection.cursor(dictionary = True)

		cursor.execute("select * from attractions where id = %s",(attractionId,))
		data = cursor.fetchone()
		if data: #如果資料庫有找到id有回傳data，沒有則return錯誤
			data["images"] = json.loads(data["images"]) ##把資料庫拿到資料中的images轉回json格式再放回去
			return {"data":data}
		else:
			return JSONResponse(
				status_code = 400,
				content = {
					"error":True,
					"message":"找不到id"
				})

	except Exception as e:
		return JSONResponse(
			status_code = 500,
			content = {
				"error":True,
				"message":str(e)
			})
	
	finally:
		if cursor is not None:
			cursor.close()
		if connection is not None and connection.is_connected(): #如果一開始就沒連到或中間連線斷掉，就關閉資料池連線
			connection.close()

@app.get("/api/categories")
def get_categories_list():
	cursor = None
	connection = None

	try:
	#拿取資料池
		connection = db_pool.get_connection()
		cursor = connection.cursor(dictionary = True)

		cursor.execute("select distinct category from attractions") #在attractions裡找出所有不重複的category
		data = cursor.fetchall()

		category_list = []
		for i in data:
			if i["category"]:
				category_list.append(i["category"])

		return {
			"data":category_list
		}
	except Exception as e:
		return JSONResponse(
			status_code = 500,
			content = {
				"error":True,
				"message":str(e)
			})
	finally:
		if cursor is not None:
			cursor.close()
		if connection is not None and connection.is_connected(): #如果一開始就沒連到或中間連線斷掉，就關閉資料池連線
			connection.close()

@app.get("/api/mrts")
def get_mrts_list():
	cursor = None
	connection = None

	try:
		#拿取資料池
		connection = db_pool.get_connection()
		cursor = connection.cursor(dictionary = True)

		cursor.execute("select mrt,count(mrt)as mrtCount from attractions group by mrt order by mrtCount desc") 
		data = cursor.fetchall()

		mrts_list = []
		for i in data:
			if i["mrt"]: #防止有的景點沒有mrt
				mrts_list.append(i["mrt"])

		return {
			"data":mrts_list
		}
	except Exception as e:
		return JSONResponse(
			status_code = 500,
			content = {
				"error":True,
				"message":str(e)
			})
	finally:
		if cursor is not None:
			cursor.close()
		if connection is not None and connection.is_connected(): #如果一開始就沒連到或中間連線斷掉，就關閉資料池連線
			connection.close()

class signup_user_data(BaseModel):
	name:str
	email:str
	password:str

class login_user_data(BaseModel):
	email:str
	password:str

#把密碼用bcrypt雜湊
def get_password_hash(password:str):
	pwd_bytes = password.encode("utf-8")
	hash_pwd_bytes = bcrypt.hashpw(pwd_bytes, bcrypt.gensalt())
	return hash_pwd_bytes.decode("utf-8")

#驗證輸入的密碼與雜湊的密碼是否一樣
def verify_password(password:str, hash_password:str):
	password_bytes = password.encode("utf-8")
	hash_password_bytes = hash_password.encode("utf-8")

	return bcrypt.checkpw(password_bytes, hash_password_bytes)

@app.post("/api/user")
def signup(user:signup_user_data):
	user_name = user.name
	user_email = user.email
	user_password = get_password_hash(user.password)
	print(f"{user_name},{user_email},{user_password}")

	connection = None
	cursor = None
	
	try:
		connection = db_pool.get_connection()
		cursor = connection.cursor(dictionary = True)
		cursor.execute("insert into userLoginData(user_name, user_email, user_password) values(%s, %s, %s)",(user_name, user_email, user_password))
		connection.commit()

		return {"ok": True}
	
	except mysql.connector.IntegrityError:
		return JSONResponse(
			status_code = 400,
			content = {
				"error":True,
				"message":"Email已經被註冊過了"
			}
		)
		
	except Error as e:
		return JSONResponse(
			status_code = 500,
			content = {
				"error":True,
				"message":"伺服器發生錯誤:{e}"
			}
		)

	finally:
		if cursor is not None:
			cursor.close()
		if connection is not None and connection.is_connected():
			connection.close()

jwt_secret_key = os.getenv("secret_key")

@app.put("/api/user/auth")
def login(user:login_user_data):
	user_email = user.email
	user_password = user.password

	connection = None
	cursor = None

	try:
		connection = db_pool.get_connection()
		cursor = connection.cursor(dictionary = True)
		cursor.execute("select id, user_name, user_password from userLoginData where user_email = %s",(user_email,))
		user_data = cursor.fetchone()

		if not user_data:
			return JSONResponse(
				status_code = 400,
				content = {
					"error":True,
					"message":"信箱或密碼錯誤"
				}
			)
		
		hash_password = user_data["user_password"]

		is_login = verify_password(user_password, hash_password)

		if not is_login:
			return JSONResponse(
				status_code = 400,
				content = {
					"error":True,
					"message":"信箱密碼錯誤"
				}
			)
		
		payload = {
			"id":user_data["id"],
			"name":user_data["user_name"],
			"email":user_email,
			"exp":datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days = 7)
		}
		
		token = jwt.encode(payload, jwt_secret_key, algorithm = "HS256")

		if token:
			return {"token":token}

	except Error as e:
		return JSONResponse(
			status_code = 500,
			content = {
				"error":True,
				"message":f"伺服器發生錯誤:{e}"
			}
		)
	
	finally:
		if cursor is not None:
			cursor.close()
		if connection is not None and connection.is_connected():
			connection.close()

@app.get("/api/user/auth")
def verify_user(request:Request):
	auth_header = request.headers.get("Authorization")

	if not auth_header or not auth_header.startswith("Bearer "):
		return {"data": None}
	
	token = auth_header.split(" ")[1]
	try:
		decode_data = jwt.decode(token, jwt_secret_key, algorithms=["HS256"])
		return {
            "data": {
                "id": decode_data["id"],
                "name": decode_data["name"],
                "email": decode_data["email"]
            }
        }
	except jwt.ExpiredSignatureError:
		return {"data": None}
	except jwt.InvalidTokenError:
		return {"data": None}
	
app.mount("/static", StaticFiles(directory = "static"), name = "static")