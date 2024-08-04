#!/bin/bash

# マイグレーションファイルが保存されているディレクトリを指定
MIGRATION_DIR="sql/migrations"
CONFIG_FILE="mysql.conf"
DB_NAME="todo_go"

# マイグレーションファイルを順に処理
for file in $(ls -v $MIGRATION_DIR/*.sql); do
    # ファイル名をディレクトリ名を除いて取得
    filename=$(basename $file)

    # ファイル名がschema_migrationsテーブルにないか確認
    if ! mysql --defaults-file=$CONFIG_FILE $DB_NAME -e "SELECT migration FROM schema_migrations WHERE migration = '$filename'" | grep -q $filename; then
        # トランザクション開始
        mysql --defaults-file=$CONFIG_FILE $DB_NAME -e "START TRANSACTION;"

        # マイグレーションを適用
        if ! mysql --defaults-file=$CONFIG_FILE $DB_NAME < $file; then
            echo "$filename の適用に失敗しました。$(date)" >&2
            mysql --defaults-file=$CONFIG_FILE $DB_NAME -e "ROLLBACK;"
            continue
        fi

        # schema_migrationsテーブルに記録
        if ! mysql --defaults-file=$CONFIG_FILE $DB_NAME -e "INSERT INTO schema_migrations (migration) VALUES ('$filename')"; then
            echo "$filename をschema_migrationsに記録するのに失敗しました。$(date)" >&2
            mysql --defaults-file=$CONFIG_FILE $DB_NAME -e "ROLLBACK;"
            continue
        fi

        # トランザクションをコミット
        mysql --defaults-file=$CONFIG_FILE $DB_NAME -e "COMMIT;"
        echo "$filename を適用し、記録しました。"
    fi
done