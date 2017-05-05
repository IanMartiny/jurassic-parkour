import random
import os
from flask import Flask, jsonify, request
application = Flask(__name__)
expNumber = 6

@application.route('/')
def webpage():
    return application.send_static_file("./index.html")

@application.route('/index.js')
def js():
    return application.send_static_file("./index.js")

@application.route('/index.css')
def css():
    return application.send_static_file("./index.css")

@application.route('/saveData/', methods=["POST"])
def saveData():
    trial      = request.form["trial"]
    avg        = request.form["avg"]
    eps        = request.form["eps"]
    expNum     = request.form["experiment"]
    alpha      = request.form["alpha"]
    jumpPen    = request.form["jumpPen"]
    idleRew    = request.form["idleRew"]
    successRew = request.form["successRew"]
    diePen     = request.form["diePen"]
    fileName = "averageSuccessfulJumpsPerRun" + str(expNum)

    if (os.path.isfile(fileName) == False):
        f = open(fileName,"w+")
        f.write("alpha: " + str(alpha))
        f.write("\tjumpPen: " + str(jumpPen))
        f.write("\tidleRew: " + str(idleRew))
        f.write("\tsuccessRew: " + str(successRew))
        f.write("\tdiePen: " + str(diePen) + "\n")
        f.write(str(trial) + "\t" + str(avg) + "\t" + str(eps) + "\n")
        f.close()
    else:
        f = open(fileName, "a+")
        f.write(str(trial) + "\t" + str(avg) + "\t" + str(eps) + "\n")
        f.close()

    return jsonify({})

@application.route('/updateThresh/', methods=["POST"])
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


@application.route('/assets/<path:path>')
def sendAssets(path):
    return application.send_static_file("./assets/" + str(path))

@application.route('/static/<path:path>')
def sendStatic(path):
    return application.send_static_file("./" + str(path))

@application.route('/expNum/')
def getExpNum():
    f = open("expNumber", "r")
    expNumber = int(f.read())
    f.close()
    f = open("expNumber", "w")
    f.write(str(expNumber + 1))
    f.close()
    return jsonify({'expNumber': expNumber})

if __name__== "__main__":
	application.run(host="0.0.0.0", port="8000")
