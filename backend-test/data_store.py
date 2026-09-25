from pwdlib import PasswordHash


password_hash = PasswordHash.recommended()

users = {
    "employee@demo.com": {
        "id": "1",
        "name": "Employee Demo",
        "email": "employee@demo.com",
        "role": "employee",
        "hashed_password": password_hash.hash("123456"),
        "disabled": False,
    },
    "manager@demo.com": {
        "id": "2",
        "name": "Manager Demo",
        "email": "manager@demo.com",
        "role": "manager",
        "hashed_password": password_hash.hash("123456"),
        "disabled": False,
    },
    "finance@demo.com": {
        "id": "3",
        "name": "Finance Demo",
        "email": "finance@demo.com",
        "role": "finance",
        "hashed_password": password_hash.hash("123456"),
        "disabled": False,
    },
    "procurement@demo.com": {
        "id": "4",
        "name": "Procurement Demo",
        "email": "procurement@demo.com",
        "role": "procurement",
        "hashed_password": password_hash.hash("123456"),
        "disabled": False,
    },
    "admin@demo.com": {
        "id": "5",
        "name": "System Administrator",
        "email": "admin@demo.com",
        "role": "admin",
        "hashed_password": password_hash.hash("123456"),
        "disabled": False,
    },
}

ROLE_PERMISSIONS = {
    "employee": ["request:create", "request:view"],
    "manager": [
        "request:view",
        "request:approve",
        "request:reject",
        "request:revision",
    ],
    "finance": ["budget:view", "budget:check"],
    "procurement": [
        "supplier:manage",
        "quotation:manage",
        "quotation:compare",
        "po:create",
        "receiving:manage",
    ],
    "admin": [
        "request:create",
        "request:view",
        "request:approve",
        "request:reject",
        "budget:view",
        "budget:check",
        "supplier:manage",
        "quotation:manage",
        "quotation:compare",
        "po:create",
        "receiving:manage",
        "user:manage",
    ],
}

budgets = {
    "Operations": {"limit": 300_000_000, "spent": 184_500_000},
    "Marketing": {"limit": 180_000_000, "spent": 126_800_000},
    "Engineering": {"limit": 500_000_000, "spent": 318_200_000},
}

requests: list[dict] = []
