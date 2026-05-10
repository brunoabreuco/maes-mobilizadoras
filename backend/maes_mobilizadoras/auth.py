from functools import wraps

from flask import current_app, g, jsonify, request


def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        header = request.headers.get("Authorization", "")
        if not header.startswith("Bearer "):
            return jsonify({"error": "Token ausente"}), 401

        token = header.removeprefix("Bearer ").strip()
        try:
            supabase = current_app.extensions["supabase"]
            resp = supabase.auth.get_user(token)
            g.current_user_id = resp.user.id
            g.access_token = token
        except Exception:
            return jsonify({"error": "Token inválido ou expirado"}), 401

        return f(*args, **kwargs)

    return decorated