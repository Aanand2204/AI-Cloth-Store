"""
Password hashing, via bcrypt directly (not passlib — its bcrypt backend is
broken against bcrypt >=4.1, an unfixed upstream bug in the unmaintained
passlib project).
"""
import bcrypt


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
