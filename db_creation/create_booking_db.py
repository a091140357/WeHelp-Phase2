import os, mysql.connector
from dotenv import load_dotenv
from mysql.connector import Error

load_dotenv()

mysql_host = os.getenv("mysql_host")
mysql_user = os.getenv("mysql_user")
mysql_password = os.getenv("mysql_password")
mysql_database = os.getenv("mysql_database")

db = None
cursor = None

try:
    db = mysql.connector.connect(
        host = mysql_host,
        user = mysql_user,
        password = mysql_password,
    )
    
    if db.is_connected():
        cursor = db.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {mysql_database};")
        cursor.execute(f"use {mysql_database};")

        cursor.execute("""
        create table if not exists userBookingData(
                    booking_id int UNSIGNED not null auto_increment primary key,
                    user_id int UNSIGNED not null UNIQUE,
                    attractionId int UNSIGNED not null,
                    date date not null,
                    time varchar(20) not null,
                    price int UNSIGNED not null,
                    foreign key (user_id) references userLoginData(id) on delete cascade)
                    """)
        db.commit()
        print(f"{"-"*50}booking資料庫建立完成{"-"*50}")

except Error as e:
    print(e)

finally:
    if cursor is not None:
        cursor.close()
    if db is not None and db.is_connected():
        db.close()
        print("資料庫關閉")