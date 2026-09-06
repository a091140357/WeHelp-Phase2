import json, re, os, mysql.connector
from json import load
from dotenv import load_dotenv

load_dotenv()

mysql_host = os.getenv("mysql_host")
mysql_user = os.getenv("mysql_user")
mysql_password = os.getenv("mysql_password")
mysql_database = os.getenv("mysql_database")

#建立資料庫
db = mysql.connector.connect(
    host = mysql_host,
    user = mysql_user,
    password = mysql_password,
)
cursor = db.cursor()
cursor.execute(f"create database if not exists {mysql_database};") #建立從.env檔案中設定的mysql_database 資料庫
cursor.execute(f"use {mysql_database};")

cursor.execute("""
create table if not exists attractions(
               id int UNSIGNED not null primary key,
               name varchar(100) not null,
               category varchar(50) not null,
               description text not null,
               address varchar(200) not null,
               transport text not null,
               mrt varchar(50) not null,
               lat varchar(50) not null,
               lng varchar(50) not null,
               images json not null
               )
               """) #加入if not exists可以

with open("data/taipei-attractions.json", "r", encoding = "utf-8") as f:
    data = json.load(f)
    data_num_of_time = len(data["list"]) #資料數量

#整理資料並存入資料庫
def data_processing(data:dict,num:int):
    img_host = data["img_host"]
    data_list = data["list"]

    id = data_list[num]["_id"]
    name = data_list[num]["name"]
    category = data_list[num]["CAT"]
    description = data_list[num]["description"]
    address = data_list[num]["address"]
    transport = data_list[num]["direction"]
    mrt = data_list[num]["MRT"] or ""
    lat = data_list[num]["latitude"]
    lng = data_list[num]["longitude"]
    images = img_host + data_list[num]["imgurls"]

    #切分imgurls裡面所有圖片並重新組合成圖片網址
    role = re.compile(r"\.jpg",re.IGNORECASE) #IGNORECASE可以忽略大小寫
    img_urls_list = role.split(data_list[num]["imgurls"])
    img_urls_list.remove("") #刪掉用split多餘的部分

    img_urls = []
    for i in img_urls_list:
        img_urls.append(img_host + i + ".jpg")

    images = json.dumps(img_urls) #list轉成json

    #資料存入資料庫
    cursor.execute("insert into attractions(id,name,category,description,address,transport,mrt,lat,lng,images) values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
                   ,(id,name,category,description,address,transport,mrt,lat,lng,images))
    return

save_time_of_num = 0
for num in range(data_num_of_time):
    a = data_processing(data,num)
    save_time_of_num = save_time_of_num + 1

db.commit()
cursor.close()
db.close()


print(f"{"-"*50}成功儲存{save_time_of_num}筆資料{"-"*50}")
