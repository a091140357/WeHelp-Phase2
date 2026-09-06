from fastapi import Request
import jwt, os
from dotenv import load_dotenv

load_dotenv()

jwt_secret_key = os.getenv("secret_key")

def verify_user(request:Request):
	auth_header = request.headers.get("Authorization")

	if not auth_header or not auth_header.startswith("Bearer "):
		return
	
	token = auth_header.split(" ")[1]
	try:
		print("ok")
		decode_data = jwt.decode(token, jwt_secret_key, algorithms=["HS256"])
		return {
            "data": {
                "id": decode_data["id"],
                "name": decode_data["name"],
                "email": decode_data["email"]
            }
        }
	except jwt.ExpiredSignatureError:
		return
	except jwt.InvalidTokenError:
		return