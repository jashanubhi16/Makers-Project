# app.py
from flask import Flask, render_template
from daemon_logic import run_script

app = Flask(__name__)

@app.route('/')
def daemon_home():
    return render_template('daemon_home.html')

@app.route('/run_script')
def run_script_route():
    run_script()
    return 'Keylogger has been stopped successfully'

if __name__ == '__main__':
    app.run(debug=True)
