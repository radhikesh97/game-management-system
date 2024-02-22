FROM python:3.10

WORKDIR /usr/src/app
COPY requirements.txt ./
RUN pip install -r requirements.txt
COPY . .

EXPOSE 8000
#CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
CMD ["uwsgi", "--http", ":8000", "--module", "SD_backend.wsgi"]