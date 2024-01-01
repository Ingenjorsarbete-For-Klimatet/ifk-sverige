FROM python:3.9.18-slim-bookworm

RUN apt update && \
    apt upgrade && \
    apt install -y software-properties-common && \
    apt update && \
    apt install -y python3-launchpadlib && \
    add-apt-repository ppa:ubuntugis/ppa && \
    apt update && \
    apt update && \
    apt install -y gdal-bin && \
    apt install -y libgdal-dev && \
    apt install -y g++

ENV CPLUS_INCLUDE_PATH=/usr/include/gdal
ENV C_INCLUDE_PATH=/usr/include/gdal

RUN mkdir app
WORKDIR app
COPY pyproject.toml pyproject.toml
COPY src/text_search_server src/text_search_server
RUN pip install .

CMD [ "uvicorn", "autocomplete:app --reload" ]
