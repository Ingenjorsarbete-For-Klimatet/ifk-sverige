FROM python:3.9-slim

RUN mkdir app
WORKDIR app
COPY pyproject.toml pyproject.toml
COPY src/text_search_server src/text_search_server
RUN pip install .

CMD [ "uvicorn", "autocomplete:app --reload" ]
