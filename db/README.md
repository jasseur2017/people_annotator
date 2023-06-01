## Postgres shell
- sudo apt-get install -y postgresql-client-common postgresql-client-13
<!-- inside server -->
- psql -h localhost -p 5433 -U postgres -d roadscan
<!-- outside server -->
- psql -h 172.16.202.128 -p 5433 -U postgres -d roadscan
<!-- execute script -->
- \i /docker-entrypoint-initdb.d/init.sql
<!-- list all schemas -->
- \dn
<!-- list all tables in crowdhuman schema -->
- \dt project.*
<!-- describe table -->
- \d project.annotations

## CSV to DB
- \copy project.annotations FROM '../../../data/2022-05-11/preds_images_signs.csv' DELIMITER ',' CSV HEADER;
- \copy project.filenames FROM '../../../data/2022-05-11/preds_images_signs_filenames.csv' DELIMITER ',' CSV HEADER;

## DB to CSV
- \copy project.annotations TO '../../../data/2022-05-11/labels.csv' DELIMITER ',' CSV HEADER;
