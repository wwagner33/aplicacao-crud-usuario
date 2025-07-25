const express = require("express");
const path = require("path");
const crypto = require("crypto");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Gera um token como hash(login + senha)
function gerarToken(email, senha) {
  return crypto
    .createHash("sha256")
    .update(email + senha)
    .digest("hex");
}

// Rota de login
app.post("/login", (req, res) => {
  const { email, senha } = req.body;

  if (
    email === process.env.ADMIN_EMAIL &&
    senha === process.env.ADMIN_PASSWORD
  ) {
    const token = gerarToken(email, senha);
    res.json({ token });
  } else {
    res.status(401).json({ error: "Credenciais inválidas" });
  }
});

// Middleware para verificar o token
function verificarToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1]; // Formato: "Bearer TOKEN"
  const tokenEsperado = gerarToken(
    process.env.ADMIN_EMAIL,
    process.env.ADMIN_PASSWORD
  );

  if (token === tokenEsperado) {
    next(); // Token válido
  } else {
    res.status(403).json({ error: "Acesso negado" });
  }
}

// Rota protegida (exemplo: API ou página HTML)
app.get("/protegida.html", verificarToken, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "protegida.html"));
});

app.listen(5001, () => console.log("Servidor rodando na porta 5001"));
