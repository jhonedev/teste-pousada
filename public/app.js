const $ = id => document.getElementById(id);
let quartos = [], reservas = [];
function mostrar(tela) { $("quartos").hidden = tela !== "quartos"; $("reservas").hidden = tela !== "reservas"; }
function mensagem(texto) { $("mensagem").textContent = texto; }
async function api(url, opcoes={}) {
  const resposta = await fetch(url, { headers:{"Content-Type":"application/json"}, ...opcoes });
  const texto = await resposta.text();
  let dados = {};
  try { dados = texto ? JSON.parse(texto) : {}; }
  catch { throw new Error("Resposta inválida do servidor. Inicie o projeto com npm start."); }
  if (!resposta.ok) throw new Error(dados.erro || "Não foi possível concluir.");
  return dados;
}
function valores(form) { return Object.fromEntries(new FormData(form)); }
function limpar(tipo) { $("form-"+tipo).reset(); $("form-"+tipo).elements.id.value=""; }
function tabela(cabecalho, linhas) { return `<table><thead><tr>${cabecalho.map(x=>`<th>${x}</th>`).join("")}</tr></thead><tbody>${linhas.join("")}</tbody></table>`; }
function botoes(tipo, id) { return `<button onclick="editar('${tipo}',${id})">Editar</button><button onclick="excluir('${tipo}',${id})">Excluir</button>`; }
async function carregar() {
  [quartos,reservas] = await Promise.all([api("/api/quartos"),api("/api/reservas")]);
  $("lista-quartos").innerHTML = tabela(["Número","Tipo","Capacidade","Diária","Ações"], quartos.map(q=>`<tr><td>${q.numero}</td><td>${q.tipo}</td><td>${q.capacidade}</td><td>R$ ${Number(q.diaria).toFixed(2)}</td><td>${botoes("quarto",q.id)}</td></tr>`));
  $("escolha-quarto").innerHTML = '<option value="">Selecione o quarto</option>' + quartos.map(q=>`<option value="${q.id}">${q.numero} - ${q.tipo}</option>`).join("");
  $("lista-reservas").innerHTML = tabela(["Hóspede","Quarto","Entrada","Saída","Pessoas","Ações"], reservas.map(r=>`<tr><td>${r.hospede}</td><td>${r.numero_quarto}</td><td>${r.entrada}</td><td>${r.saida}</td><td>${r.pessoas}</td><td>${botoes("reserva",r.id)}</td></tr>`));
}
$("form-quarto").onsubmit = async e => {
  e.preventDefault(); const f=e.target, d=valores(f), id=d.id; delete d.id;
  try { await api(id?`/api/quartos/${id}`:"/api/quartos",{method:id?"PUT":"POST",body:JSON.stringify(d)}); limpar("quarto"); await carregar(); mensagem("Quarto salvo!"); } catch(err){mensagem(err.message);}
};
$("form-reserva").onsubmit = async e => {
  e.preventDefault(); const f=e.target,d=valores(f),id=d.id; delete d.id; d.quarto_id=Number(d.quarto_id); d.pessoas=Number(d.pessoas);
  try { await api(id?`/api/reservas/${id}`:"/api/reservas",{method:id?"PUT":"POST",body:JSON.stringify(d)}); limpar("reserva"); await carregar(); mensagem("Reserva salva!"); } catch(err){mensagem(err.message);}
};
function editar(tipo,id) {
  const item = (tipo==="quarto"?quartos:reservas).find(x=>x.id===id), f=$("form-"+tipo);
  Object.keys(item).forEach(chave=>{if(f.elements[chave]) f.elements[chave].value=item[chave];});
  mostrar(tipo==="quarto"?"quartos":"reservas");
}
async function excluir(tipo,id) {
  if(!confirm("Deseja excluir este registro?")) return;
  try { await api(`/api/${tipo==="quarto"?"quartos":"reservas"}/${id}`,{method:"DELETE"}); await carregar(); mensagem("Registro excluído."); }
  catch(err){mensagem(err.message);}
}
carregar().catch(() => mensagem("Não foi possível conectar ao servidor. Abra o terminal na pasta do projeto e execute: npm start"));
