const express = require("express");
const db = require("./database");
const app = express();
app.use(express.json());
app.use(express.static("public"));

const erro = (res, mensagem) => res.status(400).json({ erro: mensagem });
const quarto = id => db.prepare("SELECT * FROM quartos WHERE id=?").get(id);
const reserva = id => db.prepare("SELECT * FROM reservas WHERE id=?").get(id);

// QUARTOS: listar, cadastrar, editar e excluir
app.get("/api/quartos", (req, res) => res.json(db.prepare("SELECT * FROM quartos ORDER BY numero").all()));
app.post("/api/quartos", (req, res) => {
  const { numero, tipo, capacidade, diaria } = req.body;
  if (!numero || !tipo || Number(capacidade) < 1 || Number(diaria) <= 0) return erro(res, "Preencha os campos corretamente.");
  try {
    const r = db.prepare("INSERT INTO quartos (numero,tipo,capacidade,diaria) VALUES (?,?,?,?)").run(numero, tipo, Number(capacidade), Number(diaria));
    res.status(201).json(quarto(r.lastInsertRowid));
  } catch { erro(res, "Número de quarto já cadastrado."); }
});
app.put("/api/quartos/:id", (req, res) => {
  const { numero, tipo, capacidade, diaria } = req.body;
  if (!quarto(req.params.id)) return res.status(404).json({ erro: "Quarto não encontrado." });
  if (!numero || !tipo || Number(capacidade) < 1 || Number(diaria) <= 0) return erro(res, "Preencha os campos corretamente.");
  try {
    db.prepare("UPDATE quartos SET numero=?,tipo=?,capacidade=?,diaria=? WHERE id=?").run(numero, tipo, Number(capacidade), Number(diaria), req.params.id);
    res.json(quarto(req.params.id));
  } catch { erro(res, "Número de quarto já cadastrado."); }
});
app.delete("/api/quartos/:id", (req, res) => {
  if (db.prepare("SELECT id FROM reservas WHERE quarto_id=?").get(req.params.id)) return erro(res, "Exclua as reservas deste quarto primeiro.");
  db.prepare("DELETE FROM quartos WHERE id=?").run(req.params.id); res.json({ ok: true });
});

// RESERVAS: listar, cadastrar, editar e excluir
app.get("/api/reservas", (req, res) => res.json(db.prepare(`SELECT reservas.*, quartos.numero AS numero_quarto FROM reservas JOIN quartos ON quartos.id=reservas.quarto_id ORDER BY entrada`).all()));
function validarReserva(d, id=0) {
  const q = quarto(d.quarto_id);
  if (!q || !d.hospede || !d.telefone || !d.entrada || !d.saida || Number(d.pessoas)<1) return "Preencha os campos corretamente.";
  if (d.saida <= d.entrada) return "A saída deve ser depois da entrada.";
  if (Number(d.pessoas) > q.capacidade) return `O quarto comporta até ${q.capacidade} pessoa(s).`;
  const conflito = db.prepare(`SELECT id FROM reservas WHERE quarto_id=? AND id!=? AND entrada<? AND saida>?`).get(d.quarto_id, id, d.saida, d.entrada);
  return conflito ? "Já existe uma reserva neste período." : null;
}
app.post("/api/reservas", (req, res) => {
  const e = validarReserva(req.body); if (e) return erro(res, e);
  const d = req.body;
  const r = db.prepare("INSERT INTO reservas (quarto_id,hospede,telefone,entrada,saida,pessoas) VALUES (?,?,?,?,?,?)").run(d.quarto_id,d.hospede,d.telefone,d.entrada,d.saida,d.pessoas);
  res.status(201).json(reserva(r.lastInsertRowid));
});
app.put("/api/reservas/:id", (req, res) => {
  const id = Number(req.params.id); if (!reserva(id)) return res.status(404).json({ erro: "Reserva não encontrada." });
  const e = validarReserva(req.body, id); if (e) return erro(res, e);
  const d = req.body;
  db.prepare("UPDATE reservas SET quarto_id=?,hospede=?,telefone=?,entrada=?,saida=?,pessoas=? WHERE id=?").run(d.quarto_id,d.hospede,d.telefone,d.entrada,d.saida,d.pessoas,id);
  res.json(reserva(id));
});
app.delete("/api/reservas/:id", (req, res) => { db.prepare("DELETE FROM reservas WHERE id=?").run(req.params.id); res.json({ ok: true }); });

app.listen(process.env.PORT || 3000, () => console.log("Pousada aberta em http://localhost:3000"));
