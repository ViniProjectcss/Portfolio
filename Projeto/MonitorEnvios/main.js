// ============================================================
//  MONITOR DE ENVIOS — Versão Portfólio (Front-end Puro)
//  Autor: [Seu Nome]
//  Descrição: Simulador 100% client-side do sistema original.
//             Toda lógica de backend foi migrada para JS puro.
//             Dados persistidos via localStorage.
// ============================================================

// ============================================================
// MÓDULO 1 — DADOS SIMULADOS (substitui o banco MySQL + JSON)
// ============================================================

// Escopo global para permitir acesso entre módulos
let estadoAtual = "AGUARDANDO";
let pedidoAtual = null;

const LOJAS = ["Mercado Livre", "Shopee", "Magalu", "NuvemShop"];

const NOMES_CLIENTES = [
  "Ana Paula Silva", "Carlos Eduardo Lima", "Fernanda Rocha",
  "João Pedro Souza"
];

const PRODUTOS_MOCK = [
  { codigo: "CAM-001-P", nome: "Camiseta Dry-Fit Azul P", preco: 59.90 },
  { codigo: "CAM-001-M", nome: "Camiseta Dry-Fit Azul M", preco: 59.90 },
  { codigo: "CAL-002-G", nome: "Calção Esportivo Preto G", preco: 89.90 },
  { codigo: "TEN-003-42", nome: "Tênis Running Pro 42", preco: 199.90 },
  { codigo: "MEI-004", nome: "Meias Esportivas Kit 3", preco: 39.90 },
  { codigo: "BOL-005", nome: "Bolsa Academia Preta", preco: 129.90 },
  { codigo: "REG-006-M", nome: "Regata Compressão Cinza M", preco: 79.90 },
];

const FRETES = ["PAC", "SEDEX", "SEDEX 10"];

// ============================================================
// MÓDULO 2 — PERSISTÊNCIA LOCAL (substitui os arquivos .json)
// Usa localStorage como "banco de dados" do simulador
// ============================================================

const Storage = {
  get(chave) {
    try {
      return JSON.parse(localStorage.getItem(chave)) || [];
    } catch {
      return [];
    }
  },
  set(chave, dados) {
    localStorage.setItem(chave, JSON.stringify(dados));
  },
  PENDENTES: "monitor_pendentes",
  CONCLUIDOS: "monitor_concluidos",
};

function atualizarPainelDemo() {
  const lista = document.getElementById("demo-lista-pedidos");
  const titulo = document.getElementById("demo-titulo");
  if (!lista) return;

  lista.innerHTML = "";

  // ESTADO 1: Aguardando bipar pedido
  if (estadoAtual === "AGUARDANDO") {
    if (titulo) titulo.textContent = "1️⃣ Bipe um pedido para iniciar:";

    const pendentes = Storage.get(Storage.PENDENTES);

    if (pendentes.length === 0) {
      lista.innerHTML = `<p style="color:#94a3b8;font-size:0.8rem;">Nenhum pedido pendente.</p>`;
      return;
    }

    pendentes.forEach(p => {
      const btn = document.createElement("button");
      btn.className = "demo-pedido-btn";
      btn.innerHTML = `
        <span class="demo-id">#${p.idPedido}</span>
        <span class="demo-info">${p.cliente} · ${p.nome_loja}</span>
      `;
      btn.addEventListener("click", () => simularBipi(String(p.idPedido)));
      lista.appendChild(btn);
    });

  // ESTADO 2: Pedido carregado, bipando produtos
  } else if (estadoAtual === "PEDIDO" && pedidoAtual) {
    if (titulo) titulo.textContent = "2️⃣ Bipe cada produto:";

    pedidoAtual.produtos.forEach(produto => {
      const completo = produto.conferido >= produto.qtd;

      const btn = document.createElement("button");
      btn.className = `demo-pedido-btn ${completo ? "demo-produto-ok" : ""}`;
      btn.disabled = completo;
      btn.innerHTML = `
        <span class="demo-id">${produto.codigo}</span>
        <span class="demo-info">${produto.nome}</span>
        <span class="demo-progresso">${produto.conferido}/${produto.qtd} ${completo ? "✅" : "⬜"}</span>
      `;
      btn.addEventListener("click", () => simularBipi(produto.codigo));
      lista.appendChild(btn);
    });
  }
}

function simularBipi(codigo) {
  const input = document.getElementById("scanner-input");
  if (!input) return;
  input.value = codigo;
  input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  setTimeout(atualizarPainelDemo, 100);
}

// Toggle do painel
document.getElementById("toggle-demo")?.addEventListener("click", () => {
  const conteudo = document.getElementById("demo-conteudo");
  const btn = document.getElementById("toggle-demo");
  const aberto = !conteudo.classList.contains("hidden");
  conteudo.classList.toggle("hidden", aberto);
  btn.textContent = aberto ? "🎯 Modo Demo" : "✕ Fechar Demo";
  if (!aberto) atualizarPainelDemo(); // atualiza lista ao abrir
});

// ============================================================
// MÓDULO 3 — GERADOR DE PEDIDOS (substitui processar_dados_para_monitor)
// No sistema real, o Python buscava pedidos de uma API (Bling/marketplaces)
// Aqui simulamos a chegada de novos pedidos com dados aleatórios
// ============================================================

function gerarIdUnico() {
  return Math.floor(100000000 + Math.random() * 900000000);
}

function sortear(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function gerarCodigoRastreio() {
  const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const sufixo = "BR";
  const codigo = Array.from({ length: 8 }, () => String(Math.floor(Math.random() * 10))).join("");
  const prefixo = letras[Math.floor(Math.random() * letras.length)] + letras[Math.floor(Math.random() * letras.length)];
  return `${prefixo}${codigo}${sufixo}`;
}

function gerarPedidoNovo() {
  const qtdItens = Math.floor(1 + Math.random() * 3);
  const itens = [];

  for (let i = 0; i < qtdItens; i++) {
    const produto = sortear(PRODUTOS_MOCK);

    // Se o produto já existe na lista, soma a quantidade em vez de duplicar
    const existente = itens.find(item => item.codigo === produto.codigo);
    if (existente) {
      existente.quantidade += 1;
    } else {
      itens.push({
        codigo: produto.codigo,
        nome: produto.nome,
        quantidade: Math.floor(1 + Math.random() * 2),
        imagem_url: `https://placehold.co/60x60/e2e8f0/64748b?text=${encodeURIComponent(produto.codigo.slice(0, 3))}`,
      });
    }
  }
  const agora = new Date();
  const frete = sortear(FRETES);

  // ======================================================
  // CONTROLE DE MARKETPLACE — sistema de fila rotativa
  // ======================================================

  let filaRotacao = [];

  try {
    const salvo = localStorage.getItem("fila_rotacao_lojas");
    filaRotacao = salvo ? JSON.parse(salvo) : [];
    // Valida se é array com strings válidas de LOJAS
    if (!Array.isArray(filaRotacao) || filaRotacao.some(l => !LOJAS.includes(l))) {
      filaRotacao = [];
    }
  } catch {
    filaRotacao = [];
  }

  // Reabastece a fila embaralhada quando vazia
  if (filaRotacao.length === 0) {
    filaRotacao = [...LOJAS].sort(() => Math.random() - 0.5);
  }

  const loja = filaRotacao.shift();
  localStorage.setItem("fila_rotacao_lojas", JSON.stringify(filaRotacao));

  // ======================================================

  return {
    idPedido: gerarIdUnico(),
    cliente: sortear(NOMES_CLIENTES),
    nome_loja: loja,
    frete,
    itens,
    status_texto: "Pode enviar",
    status_classe: "status-ok",
    data: agora.toISOString().split("T")[0],
    Horario: agora.toTimeString().slice(0, 5),
    etiqueta_status: "Pendente",
    conferencia: false,
    codigo_rastreio: null,
  };
}


// ============================================================
// MÓDULO 4 — API SIMULADA (substitui todas as rotas Flask)
//
// MAPEAMENTO ORIGINAL → SIMULADO:
//   GET  /api/pedidos                → SimAPI.getPedidos()
//   POST /api/confirmar              → SimAPI.confirmarEnvio(id)
//   POST /api/gerar-etiqueta         → SimAPI.gerarEtiqueta(id)
//   POST /api/gerar-etiquetas-massa  → SimAPI.gerarEtiquetasMassa(ids)
//   POST /api/conferencia            → SimAPI.buscarPedidoPorBipi(bipi)
//   POST /api/confirmar_conferencia  → SimAPI.confirmarConferencia(id)
//   POST /api/imprimir-etiqueta      → SimAPI.imprimirEtiqueta(id) [simulado]
//   POST /api/imprimir-declaracao    → SimAPI.imprimirDeclaracao(id) [simulado]
//   POST /gerar-picking-list         → SimAPI.gerarPickingList(ids) [simulado]
//
// Funções REMOVIDAS (sem equivalente no front-end):
//   - buscar_token_bling()           → depende de banco MySQL seguro
//   - enviar_para_portal_postal()    → chamada SOAP para API externa
//   - converter_pdf_para_zpl()       → processamento de arquivo servidor
//   - gerar_declaracao_conteudo()    → renderização HTML → PDF (WeasyPrint)
//   - gerar_nota_fiscal()            → integração API Bling
//   - enviar_email_rastreio()        → envio SMTP
//   - worker_atualizar_dados()       → thread de background (setInterval substitui)
// ============================================================

const SimAPI = {

  // Simula GET /api/pedidos
  getPedidos() {
    return Storage.get(Storage.PENDENTES);
  },

  // Simula POST /api/confirmar
  confirmarEnvio(pedidoId) {
    const pendentes = Storage.get(Storage.PENDENTES);
    const concluidos = Storage.get(Storage.CONCLUIDOS);

    const novos = pendentes.filter(p => String(p.idPedido) !== String(pedidoId));
    if (!concluidos.includes(String(pedidoId))) {
      concluidos.push(String(pedidoId));
    }

    Storage.set(Storage.PENDENTES, novos);
    Storage.set(Storage.CONCLUIDOS, concluidos);
    return { status: "sucesso" };
  },

  // Simula POST /api/gerar-etiqueta (com delay para parecer processamento real)
  async gerarEtiqueta(pedidoId) {
    await _delay(1500 + Math.random() * 1000);

    const pendentes = Storage.get(Storage.PENDENTES);
    const pedido = pendentes.find(p => String(p.idPedido) === String(pedidoId));

    if (!pedido) return { status: "falha", mensagem: "Pedido não encontrado" };
    if (pedido.etiqueta_status === "Gerada") {
      return { status: "sucesso", mensagem: "Etiqueta já existia", codigo_rastreio: pedido.codigo_rastreio };
    }

    const rastreio = gerarCodigoRastreio();
    pedido.etiqueta_status = "Gerada";
    pedido.codigo_rastreio = rastreio;
    Storage.set(Storage.PENDENTES, pendentes);

    return { status: "sucesso", codigo_rastreio: rastreio };
  },

  // Simula POST /api/gerar-etiquetas-massa
  async gerarEtiquetasMassa(ids) {
    const resultados = [];
    const erros = [];

    for (const id of ids) {
      await _delay(400);
      const resultado = await SimAPI.gerarEtiqueta(id);
      if (resultado.status === "sucesso") resultados.push({ pedido_id: id, ...resultado });
      else erros.push({ pedido_id: id, erro: resultado.mensagem });
    }

    return {
      status: "sucesso",
      mensagem: `${resultados.length} etiqueta(s) gerada(s) com sucesso.`,
      processados: resultados.length,
      erros,
    };
  },

  // Simula POST /api/conferencia (busca pedido pelo ID/bipi)
  buscarPedidoPorBipi(bipi) {
    const pendentes = Storage.get(Storage.PENDENTES);
    const pedido = pendentes.find(p => String(p.idPedido) === String(bipi));

    if (!pedido) return null;

    return {
      idPedido: pedido.idPedido,
      numero: pedido.idPedido,
      cliente: pedido.cliente,
      loja: pedido.nome_loja,
      itens: pedido.itens.map(i => ({
        codigo: i.codigo,
        nome: i.nome,
        quantidade: i.quantidade,
      })),
    };
  },

  // Simula POST /api/confirmar_conferencia
  confirmarConferencia(pedidoId) {
    const pendentes = Storage.get(Storage.PENDENTES);
    const pedido = pendentes.find(p => String(p.idPedido) === String(pedidoId));
    if (!pedido) return { status: "falha" };
    pedido.conferencia = true;
    Storage.set(Storage.PENDENTES, pendentes);
    return { status: "ok" };
  },

  // Simula POST /api/imprimir-etiqueta (no portfólio, apenas confirma que existiria)
  async imprimirEtiqueta(pedidoId) {
    await _delay(500);
    const pendentes = Storage.get(Storage.PENDENTES);
    const pedido = pendentes.find(p => String(p.idPedido) === String(pedidoId));

    if (!pedido || !pedido.codigo_rastreio) {
      return { status: "falha", mensagem: "Etiqueta não gerada ainda" };
    }

    // No sistema real, retornaria o ZPL para a Zebra
    // Aqui simulamos o ZPL como uma string de demonstração
    const zplDemo = `^XA^FO50,50^ADN,36,20^FD${pedido.codigo_rastreio}^FS^XZ`;
    return { status: "sucesso", zpl: zplDemo, rastreio: pedido.codigo_rastreio };
  },

  // Simula POST /api/imprimir-declaracao
  async imprimirDeclaracao(pedidoId) {
    await _delay(400);
    const pendentes = Storage.get(Storage.PENDENTES);
    const pedido = pendentes.find(p => String(p.idPedido) === String(pedidoId));

    if (!pedido) return { status: "falha", mensagem: "Pedido não encontrado" };

    // No sistema real, retornaria um PDF base64 da declaração de conteúdo
    // No portfólio, geramos um PDF simples via canvas/Blob para demonstração
    const pdfBase64 = _gerarPdfDeclaracaoDemo(pedido);
    return { status: "sucesso", pdfBase64 };
  },

  // Simula POST /gerar-picking-list
  async gerarPickingList(ids) {
  await _delay(800);
  const pendentes = Storage.get(Storage.PENDENTES);
  const selecionados = pendentes.filter(p => ids.includes(String(p.idPedido)));

  if (!selecionados.length) return { status: "falha", mensagem: "Nenhum pedido encontrado" };

  const htmlConteudo = _gerarPickingListDemo(selecionados);
  return { status: "sucesso", htmlConteudo };
},
};

// ============================================================
// MÓDULO 5 — FUNÇÕES AUXILIARES PRIVADAS
// ============================================================

function _delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Gera PDF simples de declaração (demo para portfólio, sem WeasyPrint)
function _gerarPdfDeclaracaoDemo(pedido) {
  const linhas = [
    `DECLARAÇÃO DE CONTEÚDO`,
    ``,
    `Pedido: #${pedido.idPedido}`,
    `Cliente: ${pedido.cliente}`,
    `Data: ${pedido.data}   Horário: ${pedido.Horario}`,
    `Rastreio: ${pedido.codigo_rastreio || "Pendente"}`,
    ``,
    `ITENS:`,
    ...pedido.itens.map(i => `  - ${i.nome} (SKU: ${i.codigo}) x${i.quantidade}`),
    ``,
    `[Documento gerado pelo Monitor de Envios - Portfólio Demo]`,
  ];

  // Cria um blob de texto simples para demonstração
  // Em produção real, seria um PDF gerado pelo WeasyPrint no servidor
  const conteudo = linhas.join("\n");
  const bytes = new TextEncoder().encode(conteudo);
  let binario = "";
  bytes.forEach(b => (binario += String.fromCharCode(b)));
  return btoa(binario);
}

// Gera picking list demo
function _gerarPickingListDemo(pedidos) {

  function getBadgeClass(loja) {
    const l = loja.toLowerCase();

    if (l.includes("nuvemshop")) return "badge-nuvemshop";
    if (l.includes("mercado")) return "badge-mercadolivre";
    if (l.includes("shopee")) return "badge-shopee";
    if (l.includes("magalu")) return "badge-magalu";

    return "badge-default";
  }

  const folhas = pedidos.map(p => `

    <div class="folha">

      <div class="header">

        <div class="empresa-info">

          <div class="nome-empresa">
            Sua Empresa Logística
          </div>

          <div style="font-size:10px;color:#666;">
            Controle de Fluxo Interno
          </div>

        </div>

        <div class="doc-info">

          <div class="doc-titulo">
            LISTA DE SEPARAÇÃO
          </div>

          <div style="font-size:11px;">
            Pedido: <strong>#${p.idPedido}</strong>
          </div>

        </div>

      </div>

      <div class="info-pedido-extra">

        <div class="info-item">

          <div class="pedido-label">
            Cliente
          </div>

          <div class="pedido-value nome-cliente">
            ${p.cliente}
          </div>

        </div>

        <div class="info-item">

          <div class="pedido-label">
            Tipo de Frete
          </div>

          <div class="pedido-value frete-badge">
            ${p.frete}
          </div>

        </div>

      </div>

      <div class="info-card">

        <div class="info-label">
          Canal de Venda
        </div>

        <div class="info-value">

          <span class="badge ${getBadgeClass(p.nome_loja)}">
            ${p.nome_loja}
          </span>

        </div>

      </div>

      <table class="tabela-produtos">

        <thead>

          <tr>
            <th width="40">PICK</th>
            <th width="120">SKU</th>
            <th>PRODUTO / VARIAÇÃO</th>
            <th width="80" style="text-align:center;">
              QTD
            </th>
          </tr>

        </thead>

        <tbody>

          ${p.itens.map(item => `

            <tr>

              <td>
                <div class="check-box"></div>
              </td>

              <td>
                <strong style="font-family:monospace;font-size:14px;">
                  ${item.codigo}
                </strong>
              </td>

              <td>

                <div style="font-weight:600;">
                  ${item.nome}
                </div>

                <div style="font-size:10px;color:#666;margin-top:4px;">
                  Loc: Prateleira A-12
                </div>

              </td>

              <td class="col-qty">
                ${item.quantidade}
              </td>

            </tr>

          `).join("")}

        </tbody>

      </table>

      <div class="secao-extra">

        <div class="obs-box">

          <div class="info-label">
            Observações da Separação
          </div>

          <div style="border-bottom:1px solid #eee;margin-top:15px;"></div>

          <div style="border-bottom:1px solid #eee;margin-top:15px;"></div>

        </div>

        <div class="status-steps">

          <div class="step-item">
            <span></span> SEPARADO
          </div>

          <div class="step-item">
            <span></span> CONFERIDO
          </div>

          <div class="step-item">
            <span></span> EMBALADO
          </div>

        </div>

      </div>

      <div class="footer">

        <div>

          <span style="font-size:11px;">
            ID: ${p.idPedido} | Volumes: ____
          </span>

        </div>

        <div class="assinatura-area">

          <div class="linha-assinatura"></div>

          <div class="info-label" style="text-align:center;">
            Responsável pela Separação
          </div>

        </div>

      </div>

    </div>

  `).join("");

  return `

<!DOCTYPE html>

<html lang="pt-br">

<head>

<meta charset="UTF-8">

<title>Picking List</title>

<style>

@page {
    size: A4;
    margin: 10mm;
}

* {
    box-sizing: border-box;
    print-color-adjust: exact;
}

body {
    font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    margin: 0;
    color: #333;
    background-color: #fff;
    font-size: 12px;
    padding: 20px;
}

.folha {
    width: 100%;
    max-width: 210mm;
    margin: 0 auto;
    min-height: 140mm;
    padding-bottom: 20px;
    border-bottom: 1px dashed #ccc;
    margin-bottom: 30px;
    position: relative;
    display: flex;
    flex-direction: column;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 15px;
    border-bottom: 2px solid #333;
    margin-bottom: 20px;
}

.nome-empresa {
    font-size: 20px;
    font-weight: 800;
    text-transform: uppercase;
}

.doc-titulo {
    font-size: 16px;
    font-weight: 700;
    color: #2e7dff;
}

.info-pedido-extra {
    display: flex;
    gap: 60px;
    margin: 18px 0;
    padding: 16px 20px;
    background: #f1f5f9;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
}

.info-item {
    display: flex;
    flex-direction: column;
    min-width: 220px;
}

.pedido-label {
    font-size: 10px;
    text-transform: uppercase;
    color: #64748b;
    font-weight: 700;
    margin-bottom: 6px;
}

.pedido-value {
    font-size: 15px;
    font-weight: 700;
    color: #0f172a;
}

.nome-cliente {
    font-size: 16px;
}

.frete-badge {
    font-size: 13px;
    font-weight: 700;
    color: #1e293b;
}

.info-card {
    border: 1px solid #e0e0e0;
    padding: 12px;
    border-radius: 6px;
    background: #fafafa;
    margin-bottom: 20px;
}

.info-label {
    font-size: 9px;
    color: #666;
    text-transform: uppercase;
    font-weight: 700;
    margin-bottom: 5px;
}

.info-value {
    font-size: 13px;
    font-weight: 600;
}

.tabela-produtos {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
}

.tabela-produtos thead th {
    background-color: #333;
    color: #fff;
    text-align: left;
    padding: 12px;
    font-size: 11px;
}

.tabela-produtos tbody td {
    padding: 15px 12px;
    border-bottom: 1px solid #eee;
}

.col-qty {
    font-size: 18px;
    font-weight: 800;
    text-align: center;
    background: #f9f9f9;
}

.check-box {
    width: 22px;
    height: 22px;
    border: 2px solid #333;
    border-radius: 4px;
}

.secao-extra {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-top: 10px;
}

.obs-box {
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    padding: 10px;
    min-height: 80px;
}

.status-steps {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
}

.step-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    color: #888;
}

.step-item span {
    width: 15px;
    height: 15px;
    border: 2px solid #ccc;
    border-radius: 50%;
}

.footer {
    margin-top: auto;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    padding-top: 20px;
}

.assinatura-area {
    width: 200px;
    text-align: center;
}

.linha-assinatura {
    border-bottom: 1.5px solid #000;
    margin-bottom: 5px;
}

.badge {
    display: inline-block;
    padding: 4px 12px;
    font-size: 11px;
    font-weight: 800;
    border-radius: 4px;
    color: #fff;
    text-transform: uppercase;
}

.badge-nuvemshop { background-color: #2e7dff; }
.badge-mercadolivre { background-color: #ffe600; color: #000; }
.badge-shopee { background-color: #ee4d2d; }
.badge-magalu { background-color: #0086ff; }
.badge-default { background-color: #666; }

</style>

</head>

<body>

${folhas}

</body>

</html>

`;
}
// ============================================================
// MÓDULO 6 — SIMULAÇÃO DE CHEGADA DE PEDIDOS
// Substitui o worker_atualizar_dados() e processar_dados_para_monitor()
// do Python. Em vez de ler um arquivo JSON do servidor a cada 10s,
// geramos novos pedidos aleatoriamente para simular o fluxo.
// ============================================================

function simularChegadaDePedidos() {

  const concluidos = new Set(
    Storage.get(Storage.CONCLUIDOS).map(String)
  );

  const pendentes = Storage.get(Storage.PENDENTES);

  const LIMITE_MAXIMO = 6;

  // Mantém sempre 6 pedidos
  if (pendentes.length >= LIMITE_MAXIMO) {
    return;
  }

  const idsExistentes = new Set(
    pendentes.map(p => String(p.idPedido))
  );

  const novoPedido = gerarPedidoNovo();

  // Evita ID duplicado
  if (idsExistentes.has(String(novoPedido.idPedido))) return;
  if (concluidos.has(String(novoPedido.idPedido))) return;

  pendentes.push(novoPedido);

  Storage.set(Storage.PENDENTES, pendentes);
}

// ============================================================
// MÓDULO 7 — INICIALIZAÇÃO COM DADOS DE EXEMPLO
// Garante que o portfólio sempre tem dados ao abrir pela primeira vez
// ============================================================

function inicializarDadosDemo() {
  const pendentes = Storage.get(Storage.PENDENTES);
  if (pendentes.length > 0) return; // Já tem dados, não precisa recriar

  const pedidosIniciais = [];

  // Cria pedidos demo com estados variados para mostrar todas as funcionalidades
  const demos = [
    { conferencia: true, etiqueta_status: "Gerada", codigo_rastreio: gerarCodigoRastreio() },
    { conferencia: true, etiqueta_status: "Pendente", codigo_rastreio: null },
    { conferencia: false, etiqueta_status: "Pendente", codigo_rastreio: null },
    { conferencia: false, etiqueta_status: "Pendente", codigo_rastreio: null },
  ];

  demos.forEach(estado => {
    const p = gerarPedidoNovo();
    Object.assign(p, estado);
    pedidosIniciais.push(p);
  });

  Storage.set(Storage.PENDENTES, pedidosIniciais);
}

// ============================================================
// MÓDULO 8 — IMPRESSÃO SIMULADA (substitui imprimirZPL e imprimirPDF)
// No sistema real, essas funções enviavam dados para um servidor
// local (192.168.137.1:3333) que controlava as impressoras físicas.
// No portfólio, simulamos com toast de confirmação.
// ============================================================

async function imprimirZPL(zpl) {
  // Simulação: no sistema real, enviaria para http://192.168.137.1:3333/imprimir
  console.log("[SIMULAÇÃO] ZPL enviado para Zebra:", zpl.substring(0, 50) + "...");
  await _delay(800);
  _mostrarToast("🖨️ Etiqueta ZPL enviada para impressora Zebra (simulado)", "success");
}

async function imprimirPDF(pdfBase64) {
  // Simulação: no sistema real, enviaria para http://192.168.137.1:3333/imprimir-a4
  console.log("[SIMULAÇÃO] PDF A4 enviado para impressora:", pdfBase64.substring(0, 30) + "...");
  await _delay(600);
  _mostrarToast("📄 Documento A4 enviado para impressora (simulado)", "success");
}

function _mostrarToast(mensagem, tipo = "info") {
  // Toast visual simples para feedback de ações simuladas
  const toast = document.createElement("div");
  toast.style.cssText = `
    position: fixed; bottom: 20px; right: 20px; z-index: 9999;
    background: ${tipo === "success" ? "#10b981" : "#3b82f6"};
    color: white; padding: 12px 20px; border-radius: 8px;
    font-size: 0.85rem; font-weight: 500; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease; max-width: 320px;
  `;
  toast.textContent = mensagem;

  // Injeta animação se ainda não existir
  if (!document.getElementById("toast-style")) {
    const style = document.createElement("style");
    style.id = "toast-style";
    style.textContent = `@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ============================================================
// MÓDULO 9 — LÓGICA PRINCIPAL DA INTERFACE
// Mantida próxima do original; apenas as chamadas fetch() foram
// substituídas por chamadas ao SimAPI
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

  // --- Inicializa dados de demonstração na primeira visita ---
  inicializarDadosDemo();

  // ----- Seletores de elementos -----
  const btnGerarMassa = document.getElementById("btn-gerar-massa");
  const btnConferencia = document.getElementById("btn-conferencia");
  const telaPrincipal = document.getElementById("tela-principal");
  const telaConferencia = document.getElementById("tela-conferencia");
  const btnVoltar = document.getElementById("btn-voltar");
  const inputScanner = document.getElementById("scanner-input");
  const pedidosContainer = document.getElementById("pedidos-container");
  const soundToggleButton = document.getElementById("sound-toggle-btn");
  const soundIcon = document.getElementById("sound-icon");
  const soundText = document.getElementById("sound-text");
  const filtroLoja = document.getElementById("filtro-loja");

  // ----- Estado da interface -----
  let pedidosExibidos = new Set();
  let isSoundEnabled = true;
  let audioLiberado = false;
  let processandoFilaPedidos = false;
  const filaPedidos = [];
  let audioQueue = [];
  let isPlayingAudio = false;
  let audioAbortController = { aborted: false };

  const REPETICOES_PADRAO = 3;
  const PAUSA_ENTRE_SONS = 800;

  // ----- Áudio dos marketplaces -----
  const audioMap = {
    "Mercado Livre": new Audio("/static/sounds/Mercado Livre.mp3"),
    "Shopee": new Audio("/static/sounds/Shopee.mp3"),
    "Magalu": new Audio("/static/sounds/Magalu.mp3"),
    "NuvemShop": new Audio("/static/sounds/Nuvemshop.mp3"),
  };

  Object.values(audioMap).forEach(a => { a.preload = "auto"; a.volume = 1.0; });

  // Sincroniza botão de som com estado inicial
  soundToggleButton.classList.add("active");
  soundToggleButton.classList.remove("muted");
  if (soundIcon) soundIcon.textContent = "🔊";
  if (soundText) soundText.textContent = "Som Ativado";

  // ----- Navegação entre telas -----

  if (btnConferencia) {
    btnConferencia.addEventListener("click", () => {
      telaPrincipal.classList.add("hidden");
      telaConferencia.classList.remove("hidden");
      atualizarPainelDemo();
    });
  }

  if (btnVoltar) {
    btnVoltar.addEventListener("click", () => {
      telaConferencia.classList.add("hidden");
      telaPrincipal.classList.remove("hidden");
    });
  }

  // ----- Foco no scanner -----

  function manterFoco() {
    if (inputScanner && document.activeElement !== inputScanner) {
      inputScanner.focus();
    }
  }

  window.addEventListener("load", () => inputScanner && inputScanner.focus());
  setInterval(manterFoco, 300);

  // ----- Seleção em massa -----

  const btnSelectAll = document.getElementById("btn-select-all");

  if (btnSelectAll) {
    btnSelectAll.addEventListener("click", () => {
      const checkboxes = document.querySelectorAll(".select-pedido");
      const todosMarcados = [...checkboxes].every(cb => cb.checked);
      checkboxes.forEach(cb => {
        cb.checked = !todosMarcados;
        cb.closest(".card-pedido")?.classList.toggle("selecionado", !todosMarcados);
      });
      btnSelectAll.classList.toggle("ativo", !todosMarcados);
      atualizarVisibilidadeBotaoMassa();
      validarBotoesMassa();
    });
  }

  document.addEventListener("change", (e) => {
    if (e.target.classList.contains("select-pedido")) {
      const card = e.target.closest(".card-pedido");
      card?.classList.toggle("selecionado", e.target.checked);
      atualizarVisibilidadeBotaoMassa();
      validarBotoesMassa();
    }
  });

  if (btnGerarMassa) {
    btnGerarMassa.addEventListener("click", gerarEtiquetasEmMassa);
  }

  const btnCancelarPedido = document.getElementById("btn-cancelar-pedido");
  if (btnCancelarPedido) {
    btnCancelarPedido.addEventListener("click", () => {
      resetConferencia();
      if (inputScanner) { inputScanner.value = ""; inputScanner.focus(); }
      const msg = document.getElementById("mensagem-conferencia");
      if (msg) { msg.style.display = "none"; msg.classList.add("hidden"); }
    });
  }

  // ----- Visibilidade botões de massa -----

  function atualizarVisibilidadeBotaoMassa() {
    const marcados = document.querySelectorAll(".select-pedido:checked").length;
    const acoesMassa = document.getElementById("acoes-massa");
    if (!acoesMassa) return;
    if (marcados > 0) {
      acoesMassa.classList.remove("oculto");
      acoesMassa.style.display = "flex";
    } else {
      acoesMassa.classList.add("oculto");
      acoesMassa.style.display = "none";
    }
  }

  function validarBotoesMassa() {
    const selecionados = document.querySelectorAll(".select-pedido:checked");
    const btnGerar = document.getElementById("btn-gerar-massa");
    const btnImprimir = document.getElementById("btn-imprimir-massa");
    if (selecionados.length === 0) return;

    const todosConferidos = [...selecionados].every(cb =>
      cb.closest(".card-pedido")?.classList.contains("pedido-conferido-sucesso")
    );

    [btnGerar, btnImprimir].forEach(btn => {
      if (!btn) return;
      btn.disabled = !todosConferidos;
      btn.style.opacity = todosConferidos ? "1" : "0.5";
      btn.style.cursor = todosConferidos ? "pointer" : "not-allowed";
      btn.title = todosConferidos ? "" : "Alguns pedidos aguardam conferência.";

      if (btn.id === "btn-gerar-massa") {
        btn.textContent = todosConferidos
          ? `Gerar em Massa (${selecionados.length})`
          : "Bloqueado: Pendente Conferência";
      }
    });
  }

  function atualizarBotaoMassa() {
    const selecionados = document.querySelectorAll(".select-pedido:checked").length;
    const btn = document.getElementById("btn-gerar-massa");
    if (!btn) return;
    if (selecionados > 0) {
      btn.style.display = "inline-block";
      btn.textContent = `Gerar em Massa (${selecionados})`;
    } else {
      btn.style.display = "none";
    }
  }

  document.addEventListener("change", (e) => {
    if (e.target.classList.contains("select-pedido")) atualizarBotaoMassa();
  });

  // ----- Áudio -----

  function liberarAudio() {
    if (audioLiberado) return;
    Object.values(audioMap).forEach(a => a.play().then(() => a.pause()).catch(() => {}));
    audioLiberado = true;
  }

  document.body.addEventListener("click", liberarAudio, { once: true });
  document.body.addEventListener("touchstart", liberarAudio, { once: true });

  function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function tocarAudioComReset(audio) {
    return new Promise(resolve => {
      if (!isSoundEnabled || audioAbortController.aborted) return resolve();
      let finalizado = false;
      const finalizar = () => {
        if (finalizado) return;
        finalizado = true;
        audio.removeEventListener("ended", finalizar);
        audio.removeEventListener("error", finalizar);
        resolve();
      };
      audio.pause();
      audio.currentTime = 0;
      audio.addEventListener("ended", finalizar);
      audio.addEventListener("error", finalizar);
      audio.play().catch(finalizar);
      setTimeout(finalizar, 3000);
    });
  }

  async function processarFilaPedidos() {
    if (processandoFilaPedidos || filaPedidos.length === 0) return;
    processandoFilaPedidos = true;
    try {
      const { pedido } = filaPedidos.shift();
      criarCardPedidoAgrupado(pedido);
      await esperar(100);
      if (isSoundEnabled && audioLiberado) {
        const audio = audioMap[pedido.nome_loja];
        if (audio) {
          for (let i = 0; i < REPETICOES_PADRAO; i++) {
            if (!isSoundEnabled || audioAbortController.aborted) break;
            await Promise.race([tocarAudioComReset(audio), esperar(2000)]);
            if (i < REPETICOES_PADRAO - 1) await esperar(PAUSA_ENTRE_SONS);
          }
        }
      }
      await esperar(1000);
    } catch (err) {
      console.error("Erro na fila de pedidos:", err);
    } finally {
      processandoFilaPedidos = false;
      processarFilaPedidos();
    }
  }

  function enfileirarSom(loja) {
    if (!isSoundEnabled || !audioLiberado) return;
    const audio = audioMap[loja];
    if (!audio) return;
    audioQueue.push({ audio, repeticoes: REPETICOES_PADRAO, pausa: PAUSA_ENTRE_SONS });
    tocarProximoSom();
  }

  async function tocarProximoSom() {
    if (isPlayingAudio || audioQueue.length === 0) return;
    if (!isSoundEnabled) { audioQueue = []; return; }
    isPlayingAudio = true;
    const tarefa = audioQueue.shift();
    for (let i = 0; i < tarefa.repeticoes; i++) {
      if (!isSoundEnabled) break;
      await tocarAudioComReset(tarefa.audio);
      if (i < tarefa.repeticoes - 1) await esperar(tarefa.pausa);
    }
    await esperar(1000);
    isPlayingAudio = false;
    if (isSoundEnabled) tocarProximoSom();
  }

  // ----- Criação de card de pedido -----

  function criarCardPedidoAgrupado(pedido) {
    if (document.getElementById(`pedido-${pedido.idPedido}`)) return;

    const card = document.createElement("div");
    card.className = "card-pedido";
    card.id = `pedido-${pedido.idPedido}`;

    if (pedido.conferencia === true) card.classList.add("pedido-conferido-sucesso");
    if (pedido.status_classe === "status-alerta") card.classList.add("alerta-logistica");

    const itensHTML = pedido.itens.map(item => {
      const imagemHTML = item.imagem_url
        ? `<img src="${item.imagem_url}" alt="${item.nome}" class="item-imagem" onerror="this.style.display='none'">`
        : `<div class="item-imagem-placeholder"></div>`;
      const classeQtd = item.quantidade > 1 ? "qtd-destaque" : "";
      return `
        <li class="item-do-pedido">
          ${imagemHTML}
          <div class="item-info">
            <span class="item-nome">${item.nome}</span>
            <span class="item-sku">SKU: <strong>${item.codigo}</strong> | <span class="${classeQtd}">Qtd: ${item.quantidade}</span></span>
          </div>
        </li>`;
    }).join("");

    const estaConferido = pedido.conferencia === true;
    const etiquetaGerada = String(pedido.etiqueta_status).toLowerCase() === "gerada";
    const disabledAttr = !estaConferido ? "disabled" : "";

    let btnEtiquetaText, btnEtiquetaStyle;
    if (!estaConferido) {
      btnEtiquetaText = "Aguardando Conferência";
      btnEtiquetaStyle = "background-color: #f1f5f9; color: #94a3b8; border: 1px solid #e2e8f0; cursor: not-allowed;";
    } else {
      btnEtiquetaText = etiquetaGerada ? "Imprimir Etiqueta" : "Gerar Etiqueta";
      btnEtiquetaStyle = etiquetaGerada
        ? "background-color: #10b981; color: white; border: none;"
        : "background-color: transparent; color: #2563eb; border: 1px solid #2563eb;";
    }

    const rastreioInfo = etiquetaGerada && pedido.codigo_rastreio
      ? `<div class="rastreio-info">📦 Rastreio: <strong>${pedido.codigo_rastreio}</strong></div>`
      : "";

    card.innerHTML = `
      <div class="pedido-select">
        <input type="checkbox" class="select-pedido" value="${pedido.idPedido}">
      </div>
      <span class="status-pedido ${pedido.status_classe}">${pedido.status_texto}</span>
      <div class="info-pedido-principal">
        <div style="margin-bottom:15px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <span class="label">Marketplace</span>
            <span class="loja-valor">${pedido.nome_loja}</span>
            ${estaConferido ? '<span class="badge-conferido" style="margin-left:10px;font-size:10px;background:#dcfce7;color:#166534;padding:2px 6px;border-radius:10px;">✅ CONFERIDO</span>' : ""}
          </div>
          <div style="text-align:right;">
            <span class="label" style="display:block;">Coletado em</span>
            <span style="font-size:0.8rem;font-weight:bold;color:#475569;">
              ${pedido.data.split("-").reverse().join("/")} às ${pedido.Horario}
            </span>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <div>
            <span class="label">ID Pedido</span>
            <strong style="font-size:0.9rem;">#${pedido.idPedido}</strong>
          </div>
          <div>
            <span class="label">Método Frete</span>
            <span style="font-size:0.85rem;color:#64748b;">${pedido.frete}</span>
          </div>
        </div>
        <div style="margin-top:10px;">
          <span class="label">Cliente</span>
          <span style="font-size:0.9rem;font-weight:500;">${pedido.cliente}</span>
        </div>
        <div class="rastreio-container">${rastreioInfo}</div>
      </div>
      <ul class="lista-itens-pedido">${itensHTML}</ul>
      <div class="card-footer">
        <button class="btn-etiqueta" style="${btnEtiquetaStyle}" ${disabledAttr}>${btnEtiquetaText}</button>
        <button class="btn-confirmar" ${disabledAttr} style="${!estaConferido ? "opacity:0.5;cursor:not-allowed;" : ""}"}>Confirmar Envio</button>
      </div>`;

    // Evento: Confirmar Envio
    card.querySelector(".btn-confirmar").addEventListener("click", () => {

  // Verifica o estado REAL do card no momento do clique
  const conferidoAtual = card.classList.contains("pedido-conferido-sucesso");

  if (!conferidoAtual) return;

  confirmarEnvio(pedido.idPedido, card);
});

    // Evento: Gerar / Imprimir Etiqueta
    const btnEtiqueta = card.querySelector(".btn-etiqueta");
    btnEtiqueta.addEventListener("click", async () => {
      const cardAtual = btnEtiqueta.closest(".card-pedido");
      const conferidoAtual = cardAtual.classList.contains("pedido-conferido-sucesso");
      if (!conferidoAtual || btnEtiqueta.disabled) return;

      const texto = btnEtiqueta.textContent.trim();

      // Ação: Gerar Etiqueta
      if (texto.includes("Gerar") || texto.includes("Tentar")) {
        btnEtiqueta.disabled = true;
        btnEtiqueta.textContent = "Gerando...";
        mostrarLoading("Gerando etiqueta e código de rastreio...");

        try {
          const resultado = await SimAPI.gerarEtiqueta(pedido.idPedido);
          if (resultado.status !== "sucesso") throw new Error(resultado.mensagem);

          btnEtiqueta.textContent = "Imprimir Etiqueta";
          btnEtiqueta.style.backgroundColor = "#10b981";
          btnEtiqueta.style.color = "white";
          btnEtiqueta.style.border = "none";
          btnEtiqueta.disabled = false;

          if (resultado.codigo_rastreio) {
            const container = card.querySelector(".rastreio-container");
            if (container) container.innerHTML = `<div class="rastreio-info">📦 Rastreio: <strong>${resultado.codigo_rastreio}</strong></div>`;
          }
        } catch (err) {
          console.error(err);
          btnEtiqueta.textContent = "Tentar Novamente";
          btnEtiqueta.style.backgroundColor = "#ef4444";
          btnEtiqueta.disabled = false;
          alert("Erro ao gerar etiqueta: " + err.message);
        } finally {
          esconderLoading();
        }
        return;
      }

      // Ação: Imprimir Etiqueta
      if (texto === "Imprimir Etiqueta") {
        btnEtiqueta.disabled = true;
        btnEtiqueta.textContent = "Enviando...";
        mostrarLoading("Preparando impressão conjunta...");

        try {
          const [dataZPL, dataPDF] = await Promise.all([
            SimAPI.imprimirEtiqueta(pedido.idPedido),
            SimAPI.imprimirDeclaracao(pedido.idPedido),
          ]);

          if (dataZPL.zpl) {
            atualizarLoading("Enviando para Zebra...");
            await imprimirZPL(dataZPL.zpl);
            await esperar(3000);
            await imprimirZPL(dataZPL.zpl); // 2ª via
            atualizarLoading("ZPL enviado! Preparando A4...");
            await esperar(4000);
          }

          if (dataPDF.pdfBase64) {
            atualizarLoading("Enviando Declaração para A4...");
            await imprimirPDF(dataPDF.pdfBase64);
            await esperar(2000);
          }
        } catch (err) {
          console.error(err);
          alert("Erro ao processar impressão.");
        } finally {
          btnEtiqueta.disabled = false;
          btnEtiqueta.textContent = "Imprimir Etiqueta";
          esconderLoading();
        }
      }
    });

    pedidosContainer.prepend(card);
    aplicarFiltroVisual();
  }

  // ----- Buscar e sincronizar pedidos -----
  // Substitui o fetch('/api/pedidos') por SimAPI.getPedidos()

  async function buscarPedidos() {
    try {
      // Em vez de fetch, lê direto do localStorage via SimAPI
      const pedidosPendentesAtuais = SimAPI.getPedidos();

      atualizarOpcoesFiltro(pedidosPendentesAtuais);

      const idsPedidosAtuais = new Set(pedidosPendentesAtuais.map(p => p.idPedido));

      // Remove pedidos que saíram da lista
      new Set(pedidosExibidos).forEach(id => {
        if (!idsPedidosAtuais.has(id)) {
          const card = document.getElementById(`pedido-${id}`);
          if (card) {
            card.style.transition = "opacity 0.5s ease";
            card.style.opacity = "0";
            setTimeout(() => card.remove(), 500);
          }
          pedidosExibidos.delete(id);
        }
      });

      // Processa novos pedidos ou atualiza existentes
      pedidosPendentesAtuais.forEach(pedido => {
        const cardExistente = document.getElementById(`pedido-${pedido.idPedido}`);

        if (!cardExistente && !pedidosExibidos.has(pedido.idPedido)) {
          pedidosExibidos.add(pedido.idPedido);
          filaPedidos.push({ pedido });
        } else if (cardExistente) {
          _sincronizarCard(cardExistente, pedido);
        }
      });

      processarFilaPedidos();
      aplicarFiltroVisual();
      validarBotoesMassa();
    } catch (err) {
      console.error("Erro ao buscar pedidos:", err);
    }
  }

  // Sincroniza visualmente um card existente com dados atualizados
  function _sincronizarCard(cardExistente, pedido) {
    const btnEtiqueta = cardExistente.querySelector(".btn-etiqueta");
    const btnConfirmar = cardExistente.querySelector(".btn-confirmar");
    const containerRastreio = cardExistente.querySelector(".rastreio-container");
    const rastreioInfoElem = cardExistente.querySelector(".rastreio-info");

    const estaConferido = pedido.conferencia === true || String(pedido.conferencia).toLowerCase() === "true";
    const textoBotaoAtual = btnEtiqueta.textContent.trim();
    const estadosTemporarios = ["Gerando...", "Enviando...", "Processando..."];

    // Sincroniza conferência
    if (estaConferido) {
      cardExistente.classList.add("pedido-conferido-sucesso");
      if (!cardExistente.querySelector(".badge-conferido")) {
        cardExistente.querySelector(".loja-valor")?.insertAdjacentHTML("afterend",
          '<span class="badge-conferido" style="margin-left:10px;font-size:10px;background:#dcfce7;color:#166534;padding:2px 6px;border-radius:10px;font-weight:bold;border:1px solid #bbf7d0;">✅ CONFERIDO</span>');
      }
      btnConfirmar.disabled = false;
      btnConfirmar.style.opacity = "1";
      btnConfirmar.style.cursor = "pointer";
    } else {
      cardExistente.classList.remove("pedido-conferido-sucesso");
      cardExistente.querySelector(".badge-conferido")?.remove();
      btnConfirmar.disabled = true;
      btnConfirmar.style.opacity = "0.5";
      btnConfirmar.style.cursor = "not-allowed";
    }

    // Sincroniza botão de etiqueta (com proteção de estado temporário)
    if (!estadosTemporarios.includes(textoBotaoAtual)) {
      if (!estaConferido) {
        btnEtiqueta.disabled = true;
        btnEtiqueta.textContent = "Aguardando Conferência";
        Object.assign(btnEtiqueta.style, { backgroundColor: "#f1f5f9", color: "#94a3b8", border: "1px solid #e2e8f0", cursor: "not-allowed" });
      } else {
        const etiquetaGerada = String(pedido.etiqueta_status).toLowerCase() === "gerada";
        if (etiquetaGerada && textoBotaoAtual !== "Imprimir Etiqueta") {
          btnEtiqueta.disabled = false;
          btnEtiqueta.textContent = "Imprimir Etiqueta";
          Object.assign(btnEtiqueta.style, { backgroundColor: "#10b981", color: "white", border: "none", cursor: "pointer" });
        } else if (!etiquetaGerada && textoBotaoAtual !== "Gerar Etiqueta") {
          btnEtiqueta.disabled = false;
          btnEtiqueta.textContent = "Gerar Etiqueta";
          Object.assign(btnEtiqueta.style, { backgroundColor: "transparent", color: "#2563eb", border: "1px solid #2563eb", cursor: "pointer" });
        }
      }
    }

    // Sincroniza rastreio
    if (pedido.codigo_rastreio && String(pedido.etiqueta_status).toLowerCase() === "gerada") {
      const htmlRastreio = `📦 Rastreio: <strong>${pedido.codigo_rastreio}</strong>`;
      if (rastreioInfoElem) rastreioInfoElem.innerHTML = htmlRastreio;
      else if (containerRastreio) containerRastreio.innerHTML = `<div class="rastreio-info">${htmlRastreio}</div>`;
    } else {
      rastreioInfoElem?.remove();
    }
  }

  // ----- Filtro de lojas -----

  function atualizarOpcoesFiltro(pedidos) {
    const lojasNovas = [...new Set(pedidos.map(p => p.nome_loja).filter(Boolean))].sort();
    const valorAtual = filtroLoja.value;
    const lojasAtuais = Array.from(filtroLoja.options).map(o => o.value).filter(v => v !== "todas");

    if (JSON.stringify(lojasNovas) !== JSON.stringify(lojasAtuais)) {
      filtroLoja.innerHTML = '<option value="todas">Todas as Lojas</option>';
      lojasNovas.forEach(loja => {
        const opt = document.createElement("option");
        opt.value = loja;
        opt.textContent = loja;
        filtroLoja.appendChild(opt);
      });
      filtroLoja.value = lojasNovas.includes(valorAtual) ? valorAtual : "todas";
      aplicarFiltroVisual();
    }
  }

  function aplicarFiltroVisual() {
    const filtro = document.getElementById("filtro-loja");
    const displayTitulo = document.getElementById("loja-titulo-display");
    const lojaSelecionada = filtro.value;

    if (displayTitulo) {
      displayTitulo.textContent = lojaSelecionada === "todas" ? "" : `(Loja: ${lojaSelecionada})`;
    }

    document.querySelectorAll(".card-pedido").forEach(card => {
      const loja = card.querySelector(".loja-valor")?.textContent;
      card.style.display = (lojaSelecionada === "todas" || loja === lojaSelecionada) ? "" : "none";
    });
  }

  if (filtroLoja) filtroLoja.addEventListener("change", aplicarFiltroVisual);

  // ----- Confirmar envio -----

  async function confirmarEnvio(pedidoId, cardElement) {
    try {
      const resultado = SimAPI.confirmarEnvio(pedidoId);
      if (resultado.status === "sucesso") {
        cardElement.style.transition = "opacity 0.5s ease";
        cardElement.style.opacity = "0";
        setTimeout(() => {
          cardElement.remove();
          pedidosExibidos.delete(pedidoId);
        }, 500);
      } else {
        alert("Falha ao confirmar o pedido.");
      }
    } catch (err) {
      console.error("Erro ao confirmar envio:", err);
      alert("Erro ao confirmar envio.");
    }
  }

  // ----- Gerar etiquetas em massa -----

  async function gerarEtiquetasEmMassa() {
    const checkboxes = document.querySelectorAll(".select-pedido:checked");
    if (checkboxes.length === 0) { alert("Selecione pelo menos um pedido."); return; }

    mostrarLoading("Preparando etiquetas de postagem...");
    const ids = Array.from(checkboxes).map(cb => cb.value);

    try {
      const data = await SimAPI.gerarEtiquetasMassa(ids);
      alert(data.mensagem || "Processamento concluído");
    } catch (err) {
      console.error("Erro no lote:", err);
      alert("Erro ao gerar etiquetas em massa");
    } finally {
      esconderLoading();
    }
  }

  // ----- Imprimir selecionados em lote -----

  const btnImprimirMassa = document.getElementById("btn-imprimir-massa");
  if (btnImprimirMassa) btnImprimirMassa.addEventListener("click", imprimirSelecionados);

  async function imprimirSelecionados() {
    const checkboxes = document.querySelectorAll(".select-pedido:checked");
    if (checkboxes.length === 0) { alert("Nenhum pedido selecionado."); return; }

    mostrarLoading("Preparando lote de impressão...");
    const ids = Array.from(checkboxes).map(cb => cb.value);
    const btnMassa = document.getElementById("btn-imprimir-massa");
    if (btnMassa) { btnMassa.disabled = true; btnMassa.textContent = "Imprimindo Lote..."; }

    try {
      // Fase 1: ZPL em lote
      let zplCompleto = "";
      for (const id of ids) {
        const dataZPL = await SimAPI.imprimirEtiqueta(id);
        if (dataZPL.status === "sucesso" && dataZPL.zpl) {
          zplCompleto += dataZPL.zpl + "\n";
        }
      }

      if (zplCompleto.trim()) {
        atualizarLoading("Enviando ZPL para Zebra...");
        await imprimirZPL(zplCompleto);
        atualizarLoading("ZPL enviado ✅");
        await esperar(1500);
      }

      // Fase 2: PDFs A4
      atualizarLoading("Preparando documentos A4...");
      await esperar(ids.length >= 3 ? 6000 : 4000);

      for (const id of ids) {
        const dataPDF = await SimAPI.imprimirDeclaracao(id);
        if (dataPDF.pdfBase64) {
          await imprimirPDF(dataPDF.pdfBase64);
          await esperar(2000);
        }
      }

      atualizarLoading("Finalizando lote...");
      await esperar(1500);
    } catch (err) {
      console.error("Erro no lote:", err);
      alert("Erro ao processar o lote.");
    } finally {
      esconderLoading();
      if (btnMassa) { btnMassa.disabled = false; btnMassa.textContent = "Imprimir Selecionados"; }
    }
  }

  // ----- Botão de som -----

  soundToggleButton.addEventListener("click", () => {
    isSoundEnabled = !isSoundEnabled;
    if (isSoundEnabled) {
      audioAbortController.aborted = false;
      soundToggleButton.classList.add("active");
      soundToggleButton.classList.remove("muted");
      if (soundIcon) soundIcon.textContent = "🔊";
      if (soundText) soundText.textContent = "Som Ativado";
    } else {
      audioAbortController.aborted = true;
      soundToggleButton.classList.remove("active");
      soundToggleButton.classList.add("muted");
      if (soundIcon) soundIcon.textContent = "🔈";
      if (soundText) soundText.textContent = "Som Desativado";
      Object.values(audioMap).forEach(a => { a.pause(); a.currentTime = 0; });
    }
  });

  // ----- Picking list -----


  let currentBlobUrl = null;

function abrirModalHTML(htmlCompleto) {

    const blob = new Blob(
        [htmlCompleto],
        { type: "text/html" }
    );

    if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
    }

    currentBlobUrl = URL.createObjectURL(blob);

    const iframe = document.getElementById("iframe-pdf");

    iframe.onload = () => {
        document
            .getElementById("modal-impressao")
            ?.classList.remove("hidden");
    };

    iframe.src = currentBlobUrl;
}
 

async function imprimirPedidosSelecionadosHeader() {
  const ids = [...document.querySelectorAll(".select-pedido:checked")].map(cb => cb.value);
  if (ids.length === 0) { alert("Nenhum pedido selecionado."); return; }

  mostrarLoading("Gerando Picking List...");
  try {
    const data = await SimAPI.gerarPickingList(ids);
    if (!data.htmlConteudo) throw new Error("HTML não gerado");
    abrirModalHTML(data.htmlConteudo);
  } catch (err) {
    console.error("Erro na impressão:", err);
    alert("Erro ao imprimir pedidos.");
  } finally {
    esconderLoading();
  }
}

  const btnImprimirPedidos = document.getElementById("btn-imprimir-pedidos");
  if (btnImprimirPedidos) btnImprimirPedidos.addEventListener("click", imprimirPedidosSelecionadosHeader);

  // ----- Botão imprimir do modal -----

  const btnImprimirModal = document.getElementById("btn-imprimir-modal");
  if (btnImprimirModal) {
    btnImprimirModal.addEventListener("click", async function () {
      if (!currentPdfBase64) { alert("Nenhum PDF carregado."); return; }
      mostrarLoading("Enviando para A4...");
      this.disabled = true;
      try {
        await imprimirPDF(currentPdfBase64);
        setTimeout(() => { esconderLoading(); fecharModalPDF(); this.disabled = false; }, 1000);
      } catch (err) {
        esconderLoading();
        this.disabled = false;
        alert("Erro ao enviar para impressora.");
      }
    });
  }

  // ----- Execução inicial -----
  buscarPedidos();

  // Polling: busca pedidos a cada 5s (como no original)
  // + simula chegada de novos pedidos a cada 15s
  setInterval(buscarPedidos, 5000);
  setInterval(() => {
    simularChegadaDePedidos();
    buscarPedidos();
  }, 3000);


  // ============================================================
  // MÓDULO 10 — MODO CONFERÊNCIA
  // Mantido praticamente igual; apenas o fetch foi substituído
  // por SimAPI.buscarPedidoPorBipi e SimAPI.confirmarConferencia
  // ============================================================

 

  if (inputScanner) {
    inputScanner.addEventListener("keydown", function (e) {
      if (e.key !== "Enter") return;
      const codigo = inputScanner.value.trim();
      inputScanner.value = "";
      inputScanner.focus();
      if (estadoAtual === "AGUARDANDO") carregarPedido(codigo);
      else if (estadoAtual === "PEDIDO") conferirProduto(codigo);
    });
  }

  function renderizarProdutos() {
    const tbody = document.getElementById("tabela-body");
    if (!tbody) return;
    tbody.innerHTML = "";
    pedidoAtual.produtos.forEach(produto => {
      const tr = document.createElement("tr");
      if (produto.conferido === produto.qtd) tr.classList.add("linha-ok");
      tr.innerHTML = `<td>${produto.codigo}</td><td>${produto.nome}</td><td>${produto.qtd}</td><td>${produto.conferido}/${produto.qtd}</td>`;
      tbody.appendChild(tr);
    });
  }

  // Substitui o fetch('/api/conferencia') por SimAPI.buscarPedidoPorBipi
  async function carregarPedido(bipi) {
    const dados = SimAPI.buscarPedidoPorBipi(bipi);

    if (!dados) {
      alert("Pedido não encontrado. Verifique o ID e tente novamente.");
      return;
    }

    pedidoAtual = {
      idPedido: dados.idPedido,
      numero: dados.numero,
      cliente: dados.cliente,
      loja: dados.loja,
      produtos: dados.itens.map(item => ({
        codigo: item.codigo,
        nome: item.nome,
        qtd: item.quantidade,
        conferido: 0,
      })),
    };

    window.pedidoAtual = pedidoAtual;

    document.getElementById("numero-pedido").innerText = "Pedido #" + pedidoAtual.numero;
    document.getElementById("cliente-pedido").innerText = "Cliente: " + pedidoAtual.cliente;
    document.getElementById("transportadora-pedido").innerText = "Loja: " + pedidoAtual.loja;

    estadoAtual = "PEDIDO";
    document.getElementById("estado-aguardando").classList.add("hidden");
    document.getElementById("estado-pedido").classList.remove("hidden");
    renderizarProdutos();
  }

  function conferirProduto(codigo) {
    codigo = codigo.trim();
    const mensagem = document.getElementById("mensagem-conferencia");
    const produto = pedidoAtual.produtos.find(p => p.codigo.trim() === codigo);

    if (!produto) {
      mensagem.innerText = "❌ Produto não pertence a este pedido!";
      mensagem.style.display = "block";
      mensagem.className = "mensagem erro";
      setTimeout(() => { mensagem.style.display = "none"; mensagem.classList.add("hidden"); }, 2500);
      return;
    }

    if (produto.conferido >= produto.qtd) {
      mensagem.innerText = "⚠️ Este produto já foi totalmente conferido!";
      mensagem.className = "mensagem erro";
      mensagem.style.display = "block";
      setTimeout(() => { mensagem.style.display = "none"; }, 2000);
      return;
    }

    produto.conferido++;
    mensagem.innerText = "✔ Produto conferido";
    mensagem.className = "mensagem sucesso";
    mensagem.style.display = "block";
    setTimeout(() => { mensagem.style.display = "none"; }, 1500);

    renderizarProdutos();
    atualizarProgresso();
    verificarFinalizacao();
    setTimeout(() => inputScanner.focus(), 50);
  }

  function atualizarProgresso() {
    let total = 0, conferido = 0;
    pedidoAtual.produtos.forEach(p => { total += p.qtd; conferido += p.conferido; });
    const pct = (conferido / total) * 100;
    const barra = document.getElementById("progresso");
    if (barra) barra.style.width = pct + "%";
  }

  function verificarFinalizacao() {
    const todosOk = pedidoAtual.produtos.every(p => p.conferido === p.qtd);
    if (todosOk) document.getElementById("btn-confirmar")?.classList.remove("hidden");
  }

  function resetConferencia() {
    estadoAtual = "AGUARDANDO";
    pedidoAtual = null;
    document.getElementById("estado-pedido")?.classList.add("hidden");
    document.getElementById("estado-aguardando")?.classList.remove("hidden");
    document.getElementById("btn-confirmar")?.classList.add("hidden");
    const tbody = document.getElementById("tabela-body");
    if (tbody) tbody.innerHTML = "";
    const barra = document.getElementById("progresso");
    if (barra) barra.style.width = "0%";
  }

  // Botão confirmar conferência — substitui fetch('/api/confirmar_conferencia')
  document.getElementById("btn-confirmar")?.addEventListener("click", function () {
    const mensagem = document.getElementById("mensagem-conferencia");
    if (mensagem) {
      mensagem.className = "mensagem sucesso";
      mensagem.innerText = "🏷️ Etiqueta disponível para gerar";
      mensagem.classList.remove("hidden");
    }
    this.classList.add("hidden");

    if (pedidoAtual) {
      SimAPI.confirmarConferencia(pedidoAtual.idPedido);
    }

    document.getElementById("modal-sucesso")?.classList.remove("hidden");
  });

  document.getElementById("btn-ok")?.addEventListener("click", function () {
    document.getElementById("modal-sucesso")?.classList.add("hidden");
    resetConferencia();
    document.getElementById("mensagem-conferencia")?.classList.add("hidden");
  });

  // Expõe funções para debug/demonstração no console
  window.carregarPedido = carregarPedido;
  window.conferirProduto = conferirProduto;

}); // fim DOMContentLoaded


// ============================================================
// MÓDULO 11 — EFEITO VISUAL (boneco Mario — sem alterações)
// ============================================================

window.addEventListener("load", function () {
  const overlay = document.getElementById("overlay-loading");
  const loadingText = document.getElementById("loading-text");
  const mario = document.getElementById("boneco-mario");
  const caixa = document.getElementById("img-caixa");

  let animacaoEmCurso = false;
  let livroElement = null;
  const imgLivro = new Image();
  imgLivro.src = "image/livros.png";

  function gerenciarLivro() {
    if (!document.getElementById("livro-flutuando")) {
      livroElement = document.createElement("img");
      livroElement.id = "livro-flutuando";
      livroElement.src = imgLivro.src;
      document.getElementById("overlay-loading")?.appendChild(livroElement);
    }
  }

  function seguirMario() {
    if (!livroElement || livroElement.style.display === "none") return;
    const mRect = mario.getBoundingClientRect();
    livroElement.style.left = (mRect.left - 10) + "px";
    livroElement.style.top = (mRect.top + 20) + "px";
    requestAnimationFrame(seguirMario);
  }

  function esperar(ms) { return new Promise(r => setTimeout(r, ms)); }

  async function iniciarCena() {
    if (animacaoEmCurso) return;
    animacaoEmCurso = true;
    gerenciarLivro();
    const caixaSection = document.querySelector(".video-section");
    if (!caixaSection) { animacaoEmCurso = false; return; }
    const rect = caixaSection.getBoundingClientRect();

    livroElement.style.display = "none";
    mario.src = "image/boneco.gif";
    mario.classList.remove("mario-pulando", "mario-saindo", "olhando-esquerda");
    mario.style.transition = "none";
    mario.style.opacity = "1";
    mario.style.left = "-150px";
    const chaoY = window.innerHeight - rect.bottom + 15;
    mario.style.bottom = `${chaoY}px`;
    await esperar(500);

    const pontoParada = rect.left - 60;
    mario.style.transition = "left 2s linear";
    mario.style.left = `${pontoParada}px`;
    await esperar(2000);

    caixa?.classList.add("caixa-impacto");
    await esperar(400);
    mario.classList.add("mario-pulando");
    mario.style.transition = "left 0.8s ease-in";
    mario.style.left = `${rect.left + 40}px`;
    await esperar(850);
    caixa?.classList.remove("caixa-impacto");

    mario.classList.remove("mario-pulando");
    mario.style.opacity = "0";
    await esperar(500);

    gerenciarLivro();
    livroElement.style.display = "block";
    livroElement.classList.add("livro-aparecendo");
    seguirMario();
    mario.style.transition = "none";
    mario.style.left = `${rect.left - 40}px`;
    mario.classList.add("olhando-esquerda", "mario-saindo-caixa");
    await esperar(1200);

    mario.classList.remove("mario-saindo-caixa");
    mario.style.opacity = "1";
    await esperar(500);

    mario.style.transition = "left 1.5s linear";
    mario.style.left = "-250px";
    await esperar(1500);

    animacaoEmCurso = false;
    livroElement.style.display = "none";
    if (overlay?.classList.contains("active")) iniciarCena();
  }

  window.mostrarLoading = function (texto) {
    if (!overlay || !loadingText) return;
    loadingText.textContent = texto || "Carregando...";
    overlay.classList.add("active");
    animacaoEmCurso = false;
    iniciarCena();
  };

  window.esconderLoading = function () {
    overlay?.classList.remove("active");
    animacaoEmCurso = false;
    if (livroElement) livroElement.style.display = "none";
  };

  window.atualizarLoading = function (texto) {
    if (loadingText) loadingText.textContent = texto;
  };
});


// ============================================================
// MÓDULO 12 — MODAL DE IMPRESSÃO PDF
// ============================================================

document.getElementById("fechar-modal")?.addEventListener("click", function (e) {
  e.preventDefault();
  e.stopPropagation();
  fecharModalPDF();
});

let currentBlobUrl = null;
let currentPdfBase64 = null;

function fecharModalPDF() {
  const modal = document.getElementById("modal-impressao");
  const iframe = document.getElementById("iframe-pdf");
  if (!modal || !iframe) return;
  iframe.onload = null;
  modal.classList.add("hidden");
  iframe.src = "about:blank";
  if (currentBlobUrl) { URL.revokeObjectURL(currentBlobUrl); currentBlobUrl = null; }
}



function b64toBlob(b64Data, contentType = "", sliceSize = 512) {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = Array.from(slice).map(c => c.charCodeAt(0));
    byteArrays.push(new Uint8Array(byteNumbers));
  }
  return new Blob(byteArrays, { type: contentType });
}