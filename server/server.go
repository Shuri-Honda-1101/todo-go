package main

import (
	"database/sql"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"gopkg.in/ini.v1"

	_ "github.com/go-sql-driver/mysql"
)

func main() {
	// .confの読み込み
	confPath := "mysql.conf"
	cfg, err := ini.Load(confPath)
	if err != nil {
		slog.Error("Fail to read file", "error", err)
		os.Exit(1)
	}

	dbUser := cfg.Section("client").Key("user").String()
	dbPassword := cfg.Section("client").Key("password").String()

	dbName := "todo_go"

	dsn := fmt.Sprintf("%s:%s@/%s?parseTime=true", dbUser, dbPassword, dbName)

	// DB接続
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		slog.Error("Fail to connect to DB", "error", err)
		panic(err)
	}
	defer db.Close()

	// インスタンスを作成
	e := echo.New()

	// CORSを設定
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"http://localhost:3000"}, // Next.jsアプリのホスト名とポートを設定
		AllowMethods: []string{http.MethodGet, http.MethodHead, http.MethodPut, http.MethodPatch, http.MethodPost, http.MethodDelete},
	}))

	// ルートを設定
	e.GET("/", hello) // ローカル環境の場合、http://localhost:1323/ にGETアクセスされるとhelloハンドラーを実行する
	e.POST("/task", func(c echo.Context) error {
		return createTask(c, db)
	})

	// サーバーをポート番号1323で起動
	e.Logger.Fatal(e.Start(":1323"))
}

// ハンドラーを定義
func hello(c echo.Context) error {
	return c.String(http.StatusOK, "Hello, World!")
}

type CreateTaskInput struct {
	Text string `json:"text"`
}

type Task struct {
	ID          int64      `json:"id"`
	Text        string     `json:"text"`
	DeletedAt   *time.Time `json:"deletedAt"`
	CompletedAt *time.Time `json:"completedAt"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
}

// createTask タスクを作成するハンドラー
func createTask(c echo.Context, db *sql.DB) error {
	// クライアントから渡されたjsonを構造体に変換する
	createTaskInput := CreateTaskInput{}
	if err := c.Bind(&createTaskInput); err != nil {
		slog.Error("Fail to bind", "error", err)
		return err
	}

	// TODO: ここにSQL文を書く
	sqlIns := ""

	// データベースにデータを挿入
	result, err := db.Exec(sqlIns, createTaskInput.Text)
	if err != nil {
		slog.Error("Fail to insert", "error", err)
		return err
	}

	// 挿入されたデータのIDを取得
	lastInsertId, err := result.LastInsertId()
	if err != nil {
		slog.Error("Fail to get last insert id", "error", err)
		return err
	}

	// 挿入されたデータを取得
	var task Task
	// TODO: ここにSQL文を書く
	sqlSelect := ""
	err = db.QueryRow(sqlSelect, lastInsertId).Scan(&task.ID, &task.Text, &task.CompletedAt, &task.DeletedAt, &task.CreatedAt, &task.UpdatedAt)
	if err != nil {
		slog.Error("Fail to retrieve task", "error", err)
		return err
	}

	// クライアントにタスクを返す
	return c.JSON(http.StatusOK, task)
}
