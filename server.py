import random
from flask import Flask, jsonify, request
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

@app.route('/saveData/', methods=["POST"])
def saveData():
    trial = request.form["trial"]
    avg = request.form["avg"]
    eps = request.form["eps"]
    f = open("averageSuccessfulJumpsPerRun", "a+")
    f.write(str(trial) + "\t" + str(avg) + "\t" + str(eps) + "\n")
    f.close();

    return jsonify({})

@app.route('/updateThresh/', methods=["POST"])
def updateThresh():
    model = request.form["model"]
    if model == "random":
        return randThresh()
    elif model == "increase":
        return increaseThresh(float(request.form["distance"]), float(request.form["thresh"]))

def randThresh():
    return jsonify({'thresh': random.random()})

def increaseThresh(score, thresh):
    if 1000 <= score <= 2000:
        return jsonify({'thresh': thresh + (1-thresh)/10})
    elif 2001 <= score <= 4000:
        return jsonify({'thresh': thresh + (1-thresh)/50})
    else:
        return jsonify({'thresh': thresh + (1-thresh)/100})


@app.route('/assets/<path:path>')
def sendAssets(path):
    return app.send_static_file("./assets/" + str(path))
