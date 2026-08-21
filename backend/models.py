"""
Pydantic models for data validation and serialization.
"""    

from pydantic import BaseModel
from typing import Optional, List

## type hiniting

class Product(BaseModel):
    """Product model for the store inventory."""
    name: str
    description: str
    price: int
    category: str
    size: List[str]  #m , # s # L # xl
    color: List[str] # red, blue, green, yellow, black, white, purple, pink, orange, brown, gray, etc.
    image: str  # url of picsum photos 


class Order(BaseModel):
    """Order placement model."""
    user_email: str
    product_name: str
    quantity: int
    price: int


class CartItem(BaseModel):
    """Shopping cart item model."""
    user_email: str
    product_name: str
    quantity: int


class UserRegister(BaseModel):
    """Registration payload: username, email, and plaintext password (hashed before storage)."""
    username: str
    email: str
    password: str


class UserLogin(BaseModel):
    """Login payload: email or username, plus password."""
    identifier: str
    password: str


class ProfileUpdate(BaseModel):
    """Edit-profile payload — current_password re-verifies identity before any change is applied."""
    current_email: str
    current_password: str
    new_username: Optional[str] = None
    new_email: Optional[str] = None
    new_password: Optional[str] = None


class AccountDelete(BaseModel):
    """Payload to permanently delete an account."""
    email: str
    password: str


class GoogleAuth(BaseModel):
    """Payload for Google Sign-In: the ID token JWT from Google Identity Services."""
    credential: str
