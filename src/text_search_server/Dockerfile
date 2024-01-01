FROM python:3.9-slim

RUN add-apt-repository ppa:ubuntugis/ppa && sudo apt-get update && \
    apt-get update && \
    apt-get install gdal-bin && \
    apt-get install libgdal-dev

ENV CPLUS_INCLUDE_PATH=/usr/include/gdal
ENV C_INCLUDE_PATH=/usr/include/gdal

RUN mkdir app
WORKDIR app
COPY pyproject.toml pyproject.toml
COPY src/text_search_server src/text_search_server
RUN pip install .

CMD [ "uvicorn", "autocomplete:app --reload" ]
