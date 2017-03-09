from flask import Flask
app = Flask(__name__)

@app.route('/')
def webpage():
    return app.send_static_file("./index.html")

@app.route('/index.js')
def js():
    return app.send_static_file("./index.js")

@app.route('/index.css')
def css():
    return app.send_static_file("./index.css")

@app.route('/assets/<path:path>')
def sendAssets(path):
    return app.send_static_file("./assets/" + str(path))
