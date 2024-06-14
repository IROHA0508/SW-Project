from flask import Flask, send_from_directory
from create_db import init_db
from auth import auth
from upload import upload
from dm import dm
import os


UPLOAD_FOLDER = os.path.join(os.getcwd(), 'image')


app = Flask(__name__)
app.config['SECRET_KEY'] = 'sw_engineering_project_0615'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# 정적 파일 서빙을 위한 라우트 추가
@app.route('/image/<path:filename>')
def serve_image(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)


app.register_blueprint(auth)
app.register_blueprint(upload)
app.register_blueprint(dm)



if __name__ == "__main__":
    init_db()
    app.run(port=5000, debug=True)