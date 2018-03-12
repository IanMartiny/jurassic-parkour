# jurassic-parkour

Source code extracted from chromium, clone [here](https://github.com/wayou/t-rex-runner)

Notes for reinforcement learning: [lectures](https://github.com/chrisketelsen/courses/blob/master/csci5622/resources/schedule.md) and [AI: A modern approach](http://aima.cs.berkeley.edu/)

# Setup

This project currently uses a local server to compute the weights used to determine when our dinosaur should jump.

You can see Flask's guide to installing [here](http://flask.pocoo.org/docs/0.12/installation/#installation).

This setup is necessary only once, after `virtualenv` and `Flask` are installed a user can simply enter their virtual environment and start a server.

## Virtual environment setup

The basic steps are to install a virtual environment (for a Linux environment):

`$ sudo pip install virtualenv`

Then create the virtual environment:

`$ virtualenv venv`

Now activate the virtual environment:

`$ source venv/bin/activate`

At any point you can leave the virtual environment with:

`$ deactivate`

## Flask setup

While in the virtual environment install Flask with:

`(venv) $ pip install Flask`

Possibly you may need to use:

`(venv) $ sudo pip install Flask`

# Run local server

While in the virtual environment the server can be started as:

```
(venv) $ export FLASK_APP=server.py
(venv) $ flask run
 * Serving Flask app "server"
 * Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
```
The local server is now running on the given port (usually 5000). Visiting `localhost:5000` on any browser will show the t-rex game.
