const Database = require("better-sqlite3");
const db = new Database("pousada.db");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS quartos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero TEXT NOT NULL UNIQUE,
    tipo TEXT NOT NULL,
    capacidade INTEGER NOT NULL,
    diaria REAL NOT NULL
  );
  CREATE TABLE IF NOT EXISTS reservas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quarto_id INTEGER NOT NULL,
    hospede TEXT NOT NULL,
    telefone TEXT NOT NULL,
    entrada TEXT NOT NULL,
    saida TEXT NOT NULL,
    pessoas INTEGER NOT NULL,
    FOREIGN KEY (quarto_id) REFERENCES quartos(id)
  );
`);

if (!db.prepare("SELECT id FROM quartos LIMIT 1").get()) {
  db.prepare("INSERT INTO quartos (numero,tipo,capacidade,diaria) VALUES (?,?,?,?)")
    .run("01", "Casal", 2, 180);
}

module.exports = db;
