import os
import requests
from flask import Flask, jsonify, request, render_template
from dotenv import load_dotenv

# Load .env file (for NEWSAPI_KEY)
load_dotenv()

API_KEY = "1c6b446bbe2141a2bb12d5d8ab5ad2fc"
NEWS_BASE = "https://newsapi.org/v2"

app = Flask(__name__, static_folder="static", template_folder="templates")

def _newsapi_get(path, params):
    if not API_KEY:
        # Clear message that helps during setup
        return {"ok": False, "error": "Missing NEWSAPI_KEY. Create a .env file (copy from .env.example) and put your NewsAPI key."}, 500
    headers = {"X-Api-Key": API_KEY}
    try:
        resp = requests.get(f"{NEWS_BASE}{path}", params=params, headers=headers, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        return {"ok": True, "data": data}, 200
    except requests.HTTPError as e:
        try:
            j = resp.json()
            msg = j.get("message", str(e))
        except Exception:
            msg = str(e)
        return {"ok": False, "error": msg}, resp.status_code if resp is not None else 500
    except requests.RequestException as e:
        return {"ok": False, "error": str(e)}, 500

@app.route("/")
def home():
    # Render the minimal frontend
    return render_template("index.html")

@app.route("/api/top-headlines")
def top_headlines():
    country = request.args.get("country", "in")
    category = request.args.get("category")  # optional
    page_size = request.args.get("pageSize", "20")
    params = {"country": country, "pageSize": page_size}
    if category:
        params["category"] = category
    result, code = _newsapi_get("/top-headlines", params)
    return jsonify(result), code

@app.route("/api/search")
def search():
    q = request.args.get("q", "").strip()
    if not q:
        return jsonify({"ok": False, "error": "Query 'q' is required"}), 400
    page_size = request.args.get("pageSize", "20")
    language = request.args.get("language", "en")
    params = {"q": q, "pageSize": page_size, "language": language, "sortBy": "publishedAt"}
    result, code = _newsapi_get("/everything", params)
    return jsonify(result), code

if __name__ == "__main__":
    # Run the dev server
    app.run(host="127.0.0.1", port=5000, debug=True)
