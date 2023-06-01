import psycopg2
from psycopg2 import sql


class DAO(object):

    def __init__(self, user, password, dbname):
        super().__init__()
        host = "annotator-db"
        port = 5432
        self.conn = psycopg2.connect(
            host=host, port=port, dbname=dbname, user=user, password=password
        )
        self.cur = self.conn.cursor()

    def getFilenames(self, k):
        try:
            self.cur.execute(
                sql.SQL("WITH rows AS (SELECT image_name FROM project.filenames WHERE status = STATUS('todo') LIMIT %s) "
                "UPDATE project.filenames AS n SET status = STATUS('doing') FROM rows "
                "WHERE n.image_name = rows.image_name RETURNING n.image_name;"),
                [k]
            )
            filenames = self.cur.fetchall()
            self.conn.commit()
            return filenames
        except psycopg2.DatabaseError:
            self.conn.rollback()
            raise psycopg2.DatabaseError

    def getAnnotations(self, image_name):
        try:
            self.cur.execute(sql.SQL(
                "SELECT ROW_TO_JSON(d) from ("
                "SELECT shape, label FROM project.annotations WHERE image_name = %s) d;"
            ), [image_name])
            annotations = self.cur.fetchall()
            annotations = [annotation[0] for annotation in annotations]
            self.cur.execute(sql.SQL(
                "UPDATE project.filenames SET status = STATUS('done') WHERE image_name = %s;"
            ), [image_name])
            self.conn.commit()
            return annotations
        except psycopg2.DatabaseError:
            self.conn.rollback()
            raise psycopg2.DatabaseError

    def updateAnnotations(self, image_name, annotations):
        try:
            self.cur.execute(sql.SQL(
                "DELETE FROM project.annotations WHERE image_name = %s;"
            ), [image_name])
            self.cur.executemany(sql.SQL(
                "INSERT INTO project.annotations(image_name, shape, label) VALUES(%s, %s, %s);"
            ), [[image_name, annotation["shape"], annotation["label"]]
                for annotation in annotations]
            )
            self.conn.commit()
        except psycopg2.DatabaseError:
            self.conn.rollback()
            raise psycopg2.DatabaseError
