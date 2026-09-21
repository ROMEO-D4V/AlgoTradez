from database.user_db import find_user_by_username, db_session
u = find_user_by_username()
if u:
    print(f"User exists: {u.username} - deleting for fresh setup")
    db_session.delete(u)
    db_session.commit()
    print("Deleted. Run setup again.")
else:
    print("No user exists. Setup should work.")
