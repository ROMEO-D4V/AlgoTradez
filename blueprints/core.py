import base64
import io

import qrcode
from flask import Blueprint, flash, jsonify, redirect, request, session, url_for

from blueprints.apikey import generate_api_key
from database.auth_db import upsert_api_key
from database.user_db import add_user, find_user_by_username
from utils.logging import get_logger

logger = get_logger(__name__)

core_bp = Blueprint("core_bp", __name__)


# Note: GET /setup is served by react_bp (React frontend)
# This route handles POST for both form submission and JSON API calls
@core_bp.route("/setup", methods=["POST"])
def setup():
    if find_user_by_username() is not None:
        # Check if this is an API call (JSON expected) or form submit
        if request.is_json or request.headers.get("Accept") == "application/json":
            return jsonify({"status": "error", "message": "Setup already completed. Please login."}), 400
        return redirect(url_for("auth.login"))

    # Support both JSON and form data
    if request.is_json:
        data = request.get_json()
        username = data.get("username", "").strip()
        email = data.get("email", "").strip()
        password = data.get("password", "")
    else:
        username = request.form.get("username", "").strip()
        email = request.form.get("email", "").strip()
        password = request.form.get("password", "")

    if not username or not email or not password:
        if request.is_json or request.headers.get("Accept") == "application/json":
            return jsonify({"status": "error", "message": "Username, email, and password are required."}), 400
        flash("All fields are required.", "error")
        return redirect(url_for("react.react_setup"))

    # Validate password strength
    from utils.auth_utils import validate_password_strength

    is_valid, error_message = validate_password_strength(password)
    if not is_valid:
        if request.is_json or request.headers.get("Accept") == "application/json":
            return jsonify({"status": "error", "message": error_message}), 400
        flash(error_message, "error")
        return redirect(url_for("react.react_setup"))

    # Add the new admin user
    user = add_user(username, email, password, is_admin=True)
    if user:
        logger.info(f"New admin user {username} created successfully")

        # Automatically generate and save API key
        api_key = generate_api_key()
        key_id = upsert_api_key(username, api_key)
        if not key_id:
            logger.error(f"Failed to create API key for user {username}")
        else:
            logger.info(f"API key created successfully for user {username}")

        # Generate QR code
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(user.get_totp_uri())
        qr.make(fit=True)

        # Create QR code image
        img_buffer = io.BytesIO()
        qr.make_image(fill_color="black", back_color="white").save(img_buffer, format="PNG")
        qr_code = base64.b64encode(img_buffer.getvalue()).decode()

        session["totp_setup"] = True
        session["username"] = username
        session["qr_code"] = qr_code

        if request.is_json or request.headers.get("Accept") == "application/json":
            return jsonify({"status": "success", "message": "Account created successfully. Please login."}), 201

        flash(
            "Account created successfully! Please configure your SMTP credentials in Profile settings for password recovery.",
            "success",
        )
        return redirect(url_for("auth.login"))
    else:
        logger.error(f"Failed to create admin user {username}")
        if request.is_json or request.headers.get("Accept") == "application/json":
            return jsonify({"status": "error", "message": "Username or email already exists."}), 409
        flash("User already exists or an error occurred", "error")
        return redirect(url_for("react.react_setup"))
