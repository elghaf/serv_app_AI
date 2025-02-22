from pydantic import BaseModel, EmailStr


class create_user_schema(BaseModel):
    email: EmailStr
    password: str
