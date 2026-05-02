from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def home():
    return "Revortana Secure Server: ACTIVE"

# This is a generic responder to stop Cortana from hanging
@app.route('/<path:path>', methods=['GET', 'POST'])
def catch_all(path):
    print(f"Revortana received a request for: /{path}")
    return jsonify({"status": "Success", "message": "Revortana is handling this."})

if __name__ == '__main__':
    # Using the +4 files you just created
    app.run(host='127.0.0.1', port=443, ssl_context=('localhost+4.pem', 'localhost+4-key.pem'))
