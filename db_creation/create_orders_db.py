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
        create table if not exists orders(
                    id int UNSIGNED not null auto_increment primary key,
                    order_number varchar(20) not null UNIQUE,
                    user_id int UNSIGNED not null,
                    price int UNSIGNED not null,
                    attraction_id int UNSIGNED not null,
                    attraction_name varchar(100) not null,
                    attraction_address varchar(200) not null,
                    attraction_image varchar(500) not null,
                    date varchar(20) not null,
                    time varchar(20) not null,
                    contact_name varchar(20) not null,
                    contact_email varchar(50) not null,
                    contact_phone varchar(20) not null,
                    status int UNSIGNED default 0,
                    payment_msg varchar(200) default '',
                    create_at datetime default current_timestamp,
                    foreign key (user_id) references userLoginData(id) on delete cascade)
                    """)
        db.commit()
        print(f"{"-"*50}user資料庫建立完成{"-"*50}")

except Error as e:
    print(e)

finally:
    if cursor is not None:
        cursor.close()
    if db is not None and db.is_connected():
        db.close()
        print("資料庫關閉")