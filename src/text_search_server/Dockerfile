FROM python:3.9-slim

RUN add-apt-repository ppa:ubuntugis/ppa && \
    apt-get update && \
    apt-get update && \
    apt-get install -y gdal-bin && \
    apt-get install -y libgdal-dev

ENV CPLUS_INCLUDE_PATH=/usr/include/gdal
ENV C_INCLUDE_PATH=/usr/include/gdal

RUN mkdir app
WORKDIR app
COPY pyproject.toml pyproject.toml
COPY src/text_search_server src/text_search_server
RUN pip install .

CMD [ "uvicorn", "autocomplete:app --reload" ]
