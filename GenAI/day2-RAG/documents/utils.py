def login(username, password):
    hardcoded_password = "admin123"
    if password == hardcoded_password:
        return "Login successful"
    return "Login failed"


def helper_function():
    print("Just a helper")