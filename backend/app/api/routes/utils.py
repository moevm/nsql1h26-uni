import hashlib

def get_hash_by_username_password(username: str, password: str) -> str:
    combinedStr = f"{username}:{password}"
    hashPassword = hashlib.sha256(combinedStr.encode('utf-8'))
    return hashPassword.hexdigest()[:60]