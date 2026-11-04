# Pousada Vento Leste

Projeto simples para cadastro de quartos e reservas.

## Como executar

**Não abra o `index.html` com o Live Server do VS Code.** O Live Server mostra arquivos estáticos, mas este projeto precisa do servidor Node.js e do banco SQLite.

1. Instale o Node.js.
2. Abra a pasta `pousada_vento_leste` no VS Code.
3. Abra o terminal nessa pasta.
4. Execute `npm install` (só na primeira vez).
5. Execute `npm start`.
6. Acesse `http://localhost:3000` no navegador.

Mantenha o terminal aberto enquanto usa o site. Para parar o servidor, pressione `Ctrl + C` no terminal.

## O que o sistema faz

- Cadastra, lista, edita e exclui quartos.
- Cadastra, lista, edita e exclui reservas.
- Salva os dados em um banco SQLite.
- Valida campos básicos e conflito de datas de reservas.
