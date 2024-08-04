#!/bin/bash

# データベース設定ファイルのパス
CONFIG_FILE="mysql.conf"

DB_NAME="todo_go"

# データベースのドロップ
if ! mysql --defaults-file=$CONFIG_FILE -e "DROP DATABASE IF EXISTS $DB_NAME;"; then
    echo "$DB_NAME データベースの削除に失敗しました。$(date)" >&2
    exit 1
fi

# データベースの作成
if ! mysql --defaults-file=$CONFIG_FILE -e "CREATE DATABASE $DB_NAME;"; then
    echo "$DB_NAME データベースの作成に失敗しました。$(date)" >&2
    exit 1
fi

echo "$DB_NAME データベースがリセットされました。"
