from fastapi import *
from fastapi.responses import FileResponse, JSONResponse
import os
import json
import mysql.connector
from mysql.connector import pooling
from mysql.connector import Error
from dotenv import load_dotenv

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

		if category: #如果有使用category查詢，完全對比category與資料庫的category資料
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