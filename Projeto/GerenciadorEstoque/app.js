// ==========================================================
//   GERENCIADOR DE ESTOQUE — VERSÃO PORTFÓLIO / SIMULADOR
//   Refatorado para funcionar 100% no Front-End (sem backend)
//   Todas as chamadas à API Flask foram substituídas por lógica
//   local usando localStorage e arrays em memória.
// ==========================================================


// ==========================================================
//   BANCO DE DADOS SIMULADO (substitui o MySQL + Bling API)
// ==========================================================

/**
 * ALTERAÇÃO: Em vez de consultar o banco de dados MySQL ou a API Bling,
 * usamos um catálogo de produtos de demonstração em memória.
 * Esses produtos simulam o retorno real da API do Bling.
 */
const PRODUTOS_DEMO = [
  { id: 1001, nome: "Camiseta Básica Branca P", codigo: "CAM-BRA-P", formato: "S", imagemURL: "", situacao: "A", estoque_unico: 45 },
  { id: 1002, nome: "Camiseta Básica Branca M", codigo: "CAM-BRA-M", formato: "S", imagemURL: "", situacao: "A", estoque_unico: 60 },
  { id: 1003, nome: "Camiseta Básica Branca G", codigo: "CAM-BRA-G", formato: "S", imagemURL: "", situacao: "A", estoque_unico: 30 },
  { id: 1004, nome: "Camiseta Básica Preta P",  codigo: "CAM-PRE-P", formato: "S", imagemURL: "", situacao: "A", estoque_unico: 55 },
  { id: 1005, nome: "Camiseta Básica Preta M",  codigo: "CAM-PRE-M", formato: "S", imagemURL: "", situacao: "A", estoque_unico: 80 },
  { id: 1006, nome: "Camiseta Básica Preta G",  codigo: "CAM-PRE-G", formato: "S", imagemURL: "", situacao: "A", estoque_unico: 25 },
  { id: 1007, nome: "Calça Jeans Slim 38",      codigo: "CAL-JEA-38", formato: "S", imagemURL: "", situacao: "A", estoque_unico: 18 },
  { id: 1008, nome: "Calça Jeans Slim 40",      codigo: "CAL-JEA-40", formato: "S", imagemURL: "", situacao: "A", estoque_unico: 22 },
  { id: 1009, nome: "Calça Jeans Slim 42",      codigo: "CAL-JEA-42", formato: "S", imagemURL: "", situacao: "A", estoque_unico: 14 },
  { id: 1010, nome: "Tênis Runner Branco 38",   codigo: "TEN-RUN-38", formato: "S", imagemURL: "", situacao: "A", estoque_unico: 10 },
  { id: 1011, nome: "Tênis Runner Branco 40",   codigo: "TEN-RUN-40", formato: "S", imagemURL: "", situacao: "A", estoque_unico: 8 },
  { id: 1012, nome: "Tênis Runner Preto 38",    codigo: "TEN-PRE-38", formato: "S", imagemURL: "", situacao: "A", estoque_unico: 12 },
  { id: 1013, nome: "Moletom Canguru Cinza M",  codigo: "MOL-CIN-M", formato: "S", imagemURL: "", situacao: "A", estoque_unico: 35 },
  { id: 1014, nome: "Moletom Canguru Cinza G",  codigo: "MOL-CIN-G", formato: "S", imagemURL: "", situacao: "A", estoque_unico: 28 },
  { id: 1015, nome: "Boné Aba Reta Preto",      codigo: "BON-PRE-UN", formato: "S", imagemURL: "", situacao: "A", estoque_unico: 50 },
  { id: 1016, nome: "Boné Aba Reta Branco",     codigo: "BON-BRA-UN", formato: "S", imagemURL: "", situacao: "A", estoque_unico: 42 },
  { id: 1017, nome: "Shorts Tactel Azul P",     codigo: "SHO-AZU-P",  formato: "S", imagemURL: "", situacao: "A", estoque_unico: 33 },
  { id: 1018, nome: "Shorts Tactel Azul M",     codigo: "SHO-AZU-M",  formato: "S", imagemURL: "", situacao: "A", estoque_unico: 40 },
  { id: 1019, nome: "Meia Esportiva Par",       codigo: "MEI-ESP-UN",  formato: "S", imagemURL: "", situacao: "A", estoque_unico: 120 },
  { id: 1020, nome: "Regata Dry-Fit Verde M",   codigo: "REG-VER-M",   formato: "S", imagemURL: "", situacao: "A", estoque_unico: 16 },
];

/**
 * ALTERAÇÃO: Depósitos fixos em vez de consumir a rota /api/depositos do Bling.
 */
const DEPOSITOS_DEMO = {
  "1": "Geral",
  "2": "Filial SP",
  "3": "Filial RJ",
  "4": "E-commerce",
};

/**
 * ALTERAÇÃO: Credencial única de demonstração em vez de autenticação via MySQL + bcrypt.
 * Login: admin | Senha: admin
 */
const CREDENCIAIS_DEMO = {
  username: "admin",
  password: "admin",
  full_name: "Administrador Demo"
};

// ==========================================================
//   CAMADA DE PERSISTÊNCIA LOCAL (substitui o banco de dados)
// ==========================================================

/**
 * ALTERAÇÃO: Funções que lêem e escrevem no localStorage,
 * substituindo as consultas SQL do backend Flask.
 */
const DB = {
  /**
   * Carrega o catálogo de produtos. Se já houver dados no localStorage
   * (após uma "importação" simulada), usa eles. Caso contrário, usa os dados demo.
   */
  getProdutos() {
    const saved = localStorage.getItem("estoque_produtos");
    return saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(PRODUTOS_DEMO));
  },

  /**
   * ALTERAÇÃO: Salva o catálogo de produtos no localStorage (simula o arquivo JSON do backend).
   */
  saveProdutos(produtos) {
    localStorage.setItem("estoque_produtos", JSON.stringify(produtos));
    localStorage.setItem("estoque_timestamp", new Date().toISOString());
  },

  /**
   * ALTERAÇÃO: Retorna o timestamp da última "importação", equivalente ao last_update.txt do backend.
   */
  getTimestamp() {
    const ts = localStorage.getItem("estoque_timestamp");
    if (!ts) return null;
    return new Date(ts).toLocaleString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    });
  },

  /**
   * ALTERAÇÃO: Lê o saldo de um produto específico no depósito selecionado.
   * O backend consultava o Bling API; aqui lemos do localStorage.
   */
  getSaldo(produtoId, depositoId) {
    const chave = `saldo_${produtoId}_${depositoId}`;
    const salvo = localStorage.getItem(chave);
    if (salvo !== null) return parseInt(salvo, 10);
    // fallback: usa o saldo_unico do produto demo
    const produto = this.getProdutos().find(p => p.id === produtoId);
    return produto ? produto.estoque_unico : 0;
  },

  /**
   * ALTERAÇÃO: Persiste o saldo de um produto no localStorage,
   * simulando a escrita no banco Bling.
   */
  setSaldo(produtoId, depositoId, novoSaldo) {
    const chave = `saldo_${produtoId}_${depositoId}`;
    localStorage.setItem(chave, novoSaldo);
  },

  /**
   * ALTERAÇÃO: Registra uma movimentação no histórico local.
   * No backend, isso seria um INSERT no banco de dados.
   */
  registrarMovimentacao(sku, operacao, quantidade, novoSaldo, user) {
    const historico = JSON.parse(localStorage.getItem("estoque_historico") || "[]");
    historico.unshift({
      sku,
      operacao,
      quantidade,
      novoSaldo,
      usuario: user?.full_name || user?.username || "Demo",
      data: new Date().toLocaleString("pt-BR")
    });
    // mantém apenas os últimos 200 registros
    localStorage.setItem("estoque_historico", JSON.stringify(historico.slice(0, 200)));
  }
};

// ==========================================================
//   CAMADA DE API SIMULADA (substitui os fetch() para o Flask)
// ==========================================================

/**
 * ALTERAÇÃO PRINCIPAL: Todo o objeto `api` antes fazia chamadas HTTP para o backend Flask.
 * Agora cada método é implementado com lógica 100% Front-End, usando os helpers do DB acima.
 * A interface de retorno é mantida idêntica para que o restante do código não precise mudar.
 */
const api = {

  /**
   * ALTERAÇÃO: Antes: POST /api/login → MySQL + bcrypt.
   * Agora: comparação simples com as credenciais de demonstração.
   */
  async login(username, password) {
    await _delay(400); // simula latência de rede para parecer real
    if (
      username === CREDENCIAIS_DEMO.username &&
      password === CREDENCIAIS_DEMO.password
    ) {
      return {
        success: true,
        user: {
          username: CREDENCIAIS_DEMO.username,
          full_name: CREDENCIAIS_DEMO.full_name
        }
      };
    }
    return { success: false, message: "Usuário ou senha inválidos." };
  },

  /**
   * ALTERAÇÃO: Antes: GET /api/data-status → lia o arquivo last_update.txt.
   * Agora: lê o timestamp do localStorage.
   */
  async getDataStatus() {
    const ts = DB.getTimestamp();
    return { timestamp: ts || "Nenhum dado local. Clique em Importar." };
  },

  /**
   * ALTERAÇÃO: Antes: POST /api/import-products → chamava a API do Bling (demorava minutos).
   * Agora: simula a importação salvando os dados demo no localStorage com progresso animado.
   */
  async importProducts() {
    await _delay(200);
    // Os dados já estão em memória; apenas "persiste" no localStorage
    DB.saveProdutos(JSON.parse(JSON.stringify(PRODUTOS_DEMO)));
    return { success: true, message: `${PRODUTOS_DEMO.length} produtos importados com sucesso.` };
  },

  /**
   * ALTERAÇÃO: Antes: GET /api/depositos → chamava a API do Bling.
   * Agora: retorna os depósitos de demonstração estáticos.
   */
  async getDepositos() {
    await _delay(300);
    return { success: true, depositos: DEPOSITOS_DEMO };
  },

  /**
   * ALTERAÇÃO: Antes: GET /api/search?q=... → filtrava o arquivo JSON do backend.
   * Agora: filtra o catálogo local usando a mesma lógica de relevância do Python original.
   */
  async search(query) {
    await _delay(250);
    const produtos = DB.getProdutos();
    return filtrarProdutosInteligentemente(produtos, query).slice(0, 50);
  },

  /**
   * ALTERAÇÃO: Antes: POST /api/get-stock-balance → consultava saldos no Bling API.
   * Agora: lê os saldos do localStorage para cada produto.
   */
  async getStockBalance(ids, depositoId) {
    await _delay(500);
    const saldos = {};
    ids.forEach(id => {
      saldos[id] = DB.getSaldo(id, depositoId);
    });
    return saldos;
  },

  /**
   * ALTERAÇÃO: Antes: POST /api/update-stock → chamava atualizar_estoque_bling_v3().
   * Agora: aplica a operação (Entrada/Saída/Substituir) sobre o saldo local.
   */
  async updateStock(data) {
    await _delay(400);
    try {
      const { id, sku, novaQtd, operacao, depositoId, user } = data;
      const produtoId = parseInt(id, 10);
      const quantidade = parseInt(novaQtd, 10);
      const depId = String(depositoId);

      if (isNaN(quantidade) || quantidade < 0) {
        return { success: false, message: "Quantidade inválida." };
      }

      const saldoAtual = DB.getSaldo(produtoId, depId);
      const novoSaldo = calcularNovoSaldo(saldoAtual, quantidade, operacao);

      if (novoSaldo < 0) {
        return { success: false, message: `Saldo insuficiente para Saída. Saldo atual: ${saldoAtual}.` };
      }

      DB.setSaldo(produtoId, depId, novoSaldo);
      DB.registrarMovimentacao(sku, operacao, quantidade, novoSaldo, user);

      return {
        success: true,
        message: `Estoque do SKU ${sku} atualizado com sucesso!`,
        novo_saldo: novoSaldo
      };
    } catch (e) {
      return { success: false, message: `Erro interno: ${e.message}` };
    }
  },

  /**
   * ALTERAÇÃO: Antes: POST /api/update-multiple-stocks → loop de atualizações no Bling.
   * Agora: aplica cada atualização localmente e acumula o resultado.
   */
  async updateMultipleStocks(updates, user) {
    await _delay(600);
    let sucessos = 0;
    let falhas = 0;
    const mensagensErro = [];

    for (const item of updates) {
      const produtoId = parseInt(item.id, 10);
      const quantidade = parseInt(item.novaQtd, 10);
      const depId = String(item.depositoId);

      if (isNaN(quantidade) || quantidade < 0) {
        falhas++;
        mensagensErro.push(`SKU ${item.sku}: quantidade inválida.`);
        continue;
      }

      const saldoAtual = DB.getSaldo(produtoId, depId);
      const novoSaldo = calcularNovoSaldo(saldoAtual, quantidade, item.operacao);

      if (novoSaldo < 0) {
        falhas++;
        mensagensErro.push(`SKU ${item.sku}: saldo insuficiente.`);
        continue;
      }

      DB.setSaldo(produtoId, depId, novoSaldo);
      DB.registrarMovimentacao(item.sku, item.operacao, quantidade, novoSaldo, user);
      sucessos++;
    }

    const msg = `${sucessos} de ${updates.length} produtos atualizados.` +
      (falhas > 0 ? ` Falhas: ${falhas}. ${mensagensErro.join("; ")}` : "");

    return { success: falhas === 0, message: msg };
  },

  /**
   * ALTERAÇÃO: Antes: POST /api/bipar-contagem → processava bipagens no Bling.
   * Agora: processa cada bip localmente usando o mesmo resultado lógico.
   */
  async biparContagem(payload) {
    await _delay(700);
    const { depositoId, bipados, user } = payload;
    const produtos = DB.getProdutos();
    const resultados = [];

    for (const item of bipados) {
      const { sku, modo, quantidade = 1 } = item;

      if (!sku) {
        resultados.push({ sku: null, success: false, message: "SKU ausente." });
        continue;
      }

      const produto = produtos.find(p =>
        String(p.codigo).trim().toLowerCase() === String(sku).trim().toLowerCase()
      );

      if (!produto) {
        resultados.push({ sku, success: false, message: "Produto não encontrado no catálogo." });
        continue;
      }

      const depId = String(depositoId);
      const saldoAtual = DB.getSaldo(produto.id, depId);
      const operacao = modo.charAt(0).toUpperCase() + modo.slice(1).toLowerCase();
      const novoSaldo = calcularNovoSaldo(saldoAtual, parseInt(quantidade, 10), operacao);

      if (novoSaldo < 0) {
        resultados.push({ sku, success: false, message: `Saldo insuficiente. Atual: ${saldoAtual}.` });
        continue;
      }

      DB.setSaldo(produto.id, depId, novoSaldo);
      DB.registrarMovimentacao(sku, operacao, quantidade, novoSaldo, user);
      resultados.push({ sku, produto_id: produto.id, success: true, message: "Bipagem processada." });
    }

    const sucessos = resultados.filter(r => r.success).length;
    const falhas = resultados.length - sucessos;
    return {
      success: falhas === 0,
      message: `${sucessos} de ${resultados.length} bipagens processadas.`,
      detalhes: resultados
    };
  },

  /**
   * ALTERAÇÃO: Antes: POST /api/register → gravava usuário no MySQL.
   * Agora: apenas simula o sucesso para fins de demonstração de portfólio.
   */
  async register(username, password, nomeCompleto, accessKey) {
    await _delay(500);
    // Chave de acesso de demonstração aceita: DEMO2024
    if (accessKey !== "DEMO2024" && accessKey !== "demo2024") {
      return { success: false, message: "Chave de acesso inválida. Use: DEMO2024" };
    }
    if (!username || !password) {
      return { success: false, message: "Usuário e senha são obrigatórios." };
    }
    return { success: true, message: "Usuário criado com sucesso! (modo demo)" };
  }
};


// ==========================================================
//   FUNÇÕES AUXILIARES (lógica de negócio reutilizável)
// ==========================================================

/**
 * ALTERAÇÃO: Implementa em JS a mesma lógica de filtro do Python original
 * (filtrar_produtos_inteligentemente), incluindo prioridade por prefixo e por termos.
 */
function filtrarProdutosInteligentemente(produtos, termoPesquisa) {
  const produtosSimples = produtos.filter(p => p.formato === "S");
  const termos = termoPesquisa.toLowerCase().split(/\s+/);
  const resultadosComRelevancia = [];
  const idsAdicionados = new Set();

  // Prioridade 0: começa com o termo (nome ou código)
  for (const p of produtosSimples) {
    const nomeLower = (p.nome || "").toLowerCase();
    const codigoLower = (p.codigo || "").toLowerCase();
    if (
      nomeLower.startsWith(termoPesquisa.toLowerCase()) ||
      codigoLower.startsWith(termoPesquisa.toLowerCase())
    ) {
      if (!idsAdicionados.has(p.id)) {
        resultadosComRelevancia.push([p, 0]);
        idsAdicionados.add(p.id);
      }
    }
  }

  // Prioridade 1: contém todos os termos no nome
  for (const p of produtosSimples) {
    const nomeLower = (p.nome || "").toLowerCase();
    if (termos.every(t => nomeLower.includes(t))) {
      if (!idsAdicionados.has(p.id)) {
        resultadosComRelevancia.push([p, 1]);
        idsAdicionados.add(p.id);
      }
    }
  }

  resultadosComRelevancia.sort((a, b) =>
    a[1] - b[1] || (a[0].nome || "").localeCompare(b[0].nome || "")
  );

  return resultadosComRelevancia.map(item => item[0]);
}

/**
 * ALTERAÇÃO: Aplica as operações de estoque (Entrada, Saída, Substituir),
 * replicando a lógica op_map do backend Python.
 * Retorna o novo saldo calculado.
 */
function calcularNovoSaldo(saldoAtual, quantidade, operacao) {
  switch (operacao) {
    case "Entrada":
    case "entrada":
      return saldoAtual + quantidade;
    case "Saída":
    case "Saida":
    case "saida":
      return saldoAtual - quantidade;
    case "Substituir":
    case "substituir":
      return quantidade;
    default:
      return saldoAtual + quantidade;
  }
}

/** Utilitário: simula latência de rede para tornar a UX mais realista. */
function _delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


// ==========================================================
//   INICIALIZAÇÃO DO SISTEMA (equivalente ao DOMContentLoaded)
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {

  // --- ELEMENTOS DO DOM ---
  const loginView = document.getElementById("login-view");
  const mainView = document.getElementById("main-view");
  const loginButton = document.getElementById("login-button");
  const logoutButton = document.getElementById("logout-button");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const loginError = document.getElementById("login-error");
  const userDisplay = document.getElementById("user-display");
  const dataStatus = document.getElementById("data-status");
  const importButton = document.getElementById("import-button");
  const depositoSelect = document.getElementById("deposito-select");
  const searchInput = document.getElementById("search-input");
  const resultsContainer = document.getElementById("results-container");
  const loader = document.getElementById("loader");

  // Mensagem de status da importação (inserida dinamicamente — mantido igual ao original)
  const importStatusMessage = document.createElement("p");
  importStatusMessage.id = "import-status-message";
  importStatusMessage.style.fontStyle = "italic";
  importStatusMessage.style.marginTop = "10px";
  importButton.parentNode.insertBefore(importStatusMessage, importButton.nextSibling);

  // Container de ações em lote (mantido igual ao original)
  const bulkActionContainer = document.createElement("div");
  bulkActionContainer.id = "bulk-action-container";
  bulkActionContainer.style.display = "none";
  resultsContainer.parentNode.insertBefore(bulkActionContainer, resultsContainer);

  // --- ESTADO DA APLICAÇÃO ---
  let currentUser = null;
  let searchTimeout = null;
  let inactivityTimer = null;
  let currentProductsOnScreen = [];
  let selectedProducts = new Map();

  // ===========================
  // TOGGLE LOGIN / CADASTRO
  // ===========================
  const container = document.getElementById("auth-container");
  const btnShowRegister = document.getElementById("btn-show-register");
  const btnShowLogin = document.getElementById("btn-show-login");

  if (btnShowRegister && btnShowLogin && container) {
    btnShowRegister.onclick = () => container.classList.add("active");
    btnShowLogin.onclick = () => container.classList.remove("active");
  }

  // --- FUNÇÕES DA INTERFACE ---

  function showLoader(show) {
    loader.style.display = show ? "block" : "none";
  }

  /**
   * ALTERAÇÃO: Antes chamava api.getDataStatus() que ia ao backend.
   * Agora chama a versão simulada que lê do localStorage.
   */
  function updateDataStatus() {
    api.getDataStatus().then(data => {
      dataStatus.textContent = `Cache de produtos: ${data.timestamp}`;
      importStatusMessage.textContent = "";
    });
  }

  function updateBulkActionBar() {
    const hasSelection = selectedProducts.size > 0;
    bulkActionContainer.className = `bulk-actions ${hasSelection ? "active" : "inactive"}`;
    const countText = hasSelection
      ? `${selectedProducts.size} produto(s) selecionado(s)`
      : "Nenhum produto selecionado";
    bulkActionContainer.innerHTML = `
      <span class="selection-count">${countText}</span>
      <button id="bulk-confirm-button" ${!hasSelection ? "disabled" : ""}>Confirmar Selecionados</button>
    `;
  }

  /**
   * ALTERAÇÃO: Antes chamava api.getDepositos() que ia ao Bling API.
   * Agora retorna os depósitos de demonstração.
   */
  function populateDepositos() {
    api.getDepositos().then(data => {
      if (data.success) {
        depositoSelect.innerHTML = "";
        for (const [id, nome] of Object.entries(data.depositos)) {
          const option = document.createElement("option");
          option.value = id;
          option.textContent = nome;
          if (nome.toLowerCase() === "geral") option.selected = true;
          depositoSelect.appendChild(option);
        }
      } else {
        alert(`Erro ao carregar depósitos: ${data.message}`);
      }
    });
  }

  function renderResults(products) {
    resultsContainer.innerHTML = "";
    currentProductsOnScreen = products;
    selectedProducts.clear();

    if (!products || products.length === 0 || products.error) {
      const message = (products && products.error) || "Nenhum produto encontrado.";
      resultsContainer.innerHTML = `<p>${message}</p>`;
      bulkActionContainer.style.display = "none";
      return;
    }

    bulkActionContainer.style.display = "flex";
    updateBulkActionBar();

    resultsContainer.innerHTML = `
      <div class="actions-header">
        <button id="show-stock-button">Atualizar Saldos</button>
        <span id="stock-loader" style="display:none; margin-left: 10px;">Buscando saldos...</span>
      </div>
    `;

    products.forEach(p => {
      const card = document.createElement("div");
      card.className = "product-card";
      card.id = `product-${p.id}`;
      const imageHtml = p.imagemURL
        ? `<img src="${p.imagemURL}" alt="${p.nome}" class="product-image">`
        : `<div class="product-image-placeholder">?</div>`;

      card.innerHTML = `
        <div class="product-info-left">
          <div class="product-selection">
            <input type="checkbox" class="product-checkbox" data-product-id="${p.id}">
          </div>
          <div class="product-image-container">${imageHtml}</div>
        </div>
        <div class="product-details">
          <h4>${p.nome}</h4>
          <code>${p.codigo}</code>
          <div class="stock-info">
            <span class="label">Estoque</span>
            <span class="value" id="stock-value-${p.id}">--</span>
          </div>
        </div>
        <form class="actions-form" data-product-id="${p.id}" data-sku="${p.codigo}">
          <div class="inputs">
            <input type="number" class="qty-input" placeholder="Qtd" min="0">
            <select class="op-select">
              <option value="Substituir">Substituir</option>
              <option value="Entrada">Entrada</option>
              <option value="Saída">Saída</option>
            </select>
          </div>
          <button type="submit">Confirmar</button>
        </form>
      `;
      resultsContainer.appendChild(card);
    });
  }

  /**
   * ALTERAÇÃO: Antes chamava api.search() que fazia GET /api/search no Flask.
   * Agora chama a versão simulada que filtra em memória.
   */
  function performSearch() {
    const query = searchInput.value.trim();
    if (query.length < 2) {
      resultsContainer.innerHTML = "";
      currentProductsOnScreen = [];
      bulkActionContainer.style.display = "none";
      return;
    }
    showLoader(true);
    resultsContainer.innerHTML = "";
    api.search(query)
      .then(renderResults)
      .catch(err => {
        resultsContainer.innerHTML = `<p class="error-message">Erro na busca: ${err.message}</p>`;
      })
      .finally(() => showLoader(false));
  }

  // ===========================
  // LOGIN
  // ===========================

  /**
   * ALTERAÇÃO: Antes chamava api.login() que fazia POST /api/login no Flask (MySQL + bcrypt).
   * Agora valida apenas com as credenciais demo: admin / admin.
   */
  loginButton.addEventListener("click", () => {
    const username = usernameInput.value;
    const password = passwordInput.value;
    loginError.textContent = "";
    loginButton.textContent = "Entrando...";
    loginButton.disabled = true;

    api.login(username, password).then(data => {
      if (data.success) {
        setLoggedInState(data.user);
      } else {
        loginError.textContent = data.message;
      }
    }).finally(() => {
      loginButton.textContent = "Entrar";
      loginButton.disabled = false;
    });
  });

  // Enter nos campos de login
  [usernameInput, passwordInput].forEach(input => {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        loginButton.click();
      }
    });
  });

  // ===========================
  // CADASTRO (SIMULADO)
  // ===========================

  const registerButton = document.getElementById("register-button");
  if (registerButton) {
    registerButton.addEventListener("click", async () => {
      const username = document.getElementById("register-username")?.value;
      const password = document.getElementById("register-password")?.value;
      const password2 = document.getElementById("register-password2")?.value;
      const accessKey = document.getElementById("register-key")?.value;

      if (password !== password2) {
        showToast("As senhas não coincidem.", "warning");
        return;
      }

      /**
       * ALTERAÇÃO: Antes: POST /api/register → MySQL + bcrypt + chave de acesso real.
       * Agora: simula o cadastro com chave demo "DEMO2024".
       * Nota para recrutadores: em produção, este endpoint gravava no banco de dados.
       */
      const data = await api.register(username, password, username, accessKey);

      if (data.success) {
        showToast("Usuário criado com sucesso!", "success");
        container.classList.remove("active");
      } else {
        showToast(data.message, "error");
      }
    });
  }

  // ===========================
  // ESTADO LOGADO / DESLOGADO
  // ===========================

  /**
   * ALTERAÇÃO: Remove o modal intermediário de escolha (Estoque / Código de Barras).
   * Novo fluxo: LOGIN → abre diretamente o Gerenciador de Estoque.
   * O fluxo original abria um modal-escolha; isso foi removido conforme solicitado.
   */
  function setLoggedInState(user) {
    currentUser = user;
    window.USER_DATA = user;
    window.CURRENT_USER = user;
    sessionStorage.setItem("currentUser", JSON.stringify(user));

    userDisplay.textContent = `Olá, ${user.full_name}`;

    // NOVO FLUXO: vai direto para o sistema sem modal intermediário
    loginView.style.display = "none";
    mainView.style.display = "block";

    // Esconde o modal de escolha caso esteja visível (backward compat.)
    const modalEscolha = document.getElementById("modal-escolha");
    if (modalEscolha) modalEscolha.style.display = "none";

    updateDataStatus();
    populateDepositos();
    resetInactivityTimer();
  }

  function setLoggedOutState() {
    clearTimeout(inactivityTimer);
    currentUser = null;
    window.USER_DATA = null;
    window.CURRENT_USER = null;
    sessionStorage.removeItem("currentUser");

    loginView.style.display = "flex";
    mainView.style.display = "none";

    const paginaCodigo = document.getElementById("pagina-codigo");
    if (paginaCodigo) paginaCodigo.classList.add("hidden");

    const modalEscolha = document.getElementById("modal-escolha");
    if (modalEscolha) modalEscolha.style.display = "none";

    usernameInput.value = "";
    passwordInput.value = "";
  }

  // Timer de inatividade (mantido igual ao original)
  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    if (currentUser) {
      inactivityTimer = setTimeout(() => {
        alert("Você foi desconectado por inatividade.");
        setLoggedOutState();
      }, 20 * 60 * 1000);
    }
  }

  ["click", "mousemove", "keydown", "scroll", "touchstart"].forEach(evt => {
    document.addEventListener(evt, () => {
      if (currentUser) resetInactivityTimer();
    });
  });

  logoutButton.addEventListener("click", setLoggedOutState);

  // ===========================
  // PROGRESS BAR (mantido igual)
  // ===========================
  const progressWrapper = document.getElementById("progressWrapper");
  const progressBar = document.querySelector(".progress-bar");
  const progressText = document.getElementById("progressText");
  const circumference = 2 * Math.PI * 50;
  let currentProgress = 0;

  function setProgress(percent) {
    if (!progressBar || !progressText) return;
    const offset = circumference - (percent / 100) * circumference;
    progressBar.style.strokeDashoffset = offset;
    progressText.innerText = percent + "%";
  }

  function smoothProgress(target) {
    currentProgress += (target - currentProgress) * 0.2;
    setProgress(Math.floor(currentProgress));
  }

  // ===========================
  // IMPORTAÇÃO SIMULADA
  // ===========================

  /**
   * ALTERAÇÃO: Antes chamava api.importProducts() e depois ficava fazendo polling em
   * GET /api/import-progress para acompanhar o progresso real.
   * Agora simula o progresso com um setInterval de 400ms durante ~3 segundos,
   * e salva os dados demo no localStorage ao concluir.
   * A UX visual é idêntica à versão original com backend.
   */
  importButton.addEventListener("click", () => {
    importButton.textContent = "Importando...";
    importButton.disabled = true;
    importStatusMessage.textContent = "Aguarde, carregando produtos de demonstração...";

    if (progressWrapper) progressWrapper.style.display = "block";
    currentProgress = 0;
    setProgress(0);

    // Simula o progresso assíncrono sem backend
    let simulatedPercent = 0;
    const interval = setInterval(() => {
      simulatedPercent = Math.min(99, simulatedPercent + Math.random() * 12 + 4);
      smoothProgress(simulatedPercent);
    }, 400);

    // Conclui após ~3 segundos
    setTimeout(async () => {
      clearInterval(interval);
      await api.importProducts();
      smoothProgress(100);

      setTimeout(() => {
        if (progressWrapper) progressWrapper.style.display = "none";
        importButton.disabled = false;
        importButton.textContent = "📥 Importar/Atualizar Produtos do Bling";
        importStatusMessage.textContent = "";
        updateDataStatus();
        showToast("Produtos importados com sucesso!", "success");
      }, 800);
    }, 3200);
  });

  // ===========================
  // BUSCA
  // ===========================
  searchInput.addEventListener("keyup", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performSearch, 500);
  });

  // ===========================
  // EVENTOS DOS CARDS
  // ===========================

  // Checkboxes de seleção de produto
  resultsContainer.addEventListener("change", function(event) {
    if (event.target.classList.contains("product-checkbox")) {
      const checkbox = event.target;
      const productId = parseInt(checkbox.dataset.productId);
      if (checkbox.checked) {
        const product = currentProductsOnScreen.find(p => p.id === productId);
        if (product) selectedProducts.set(productId, product);
      } else {
        selectedProducts.delete(productId);
      }
      updateBulkActionBar();
    }
  });

  // Botão "Atualizar Saldos"
  resultsContainer.addEventListener("click", function(event) {
    if (event.target.id === "show-stock-button") {
      const button = event.target;
      const stockLoader = document.getElementById("stock-loader");
      if (button.disabled) return;
      button.disabled = true;
      button.textContent = "Atualizando...";
      if (stockLoader) stockLoader.style.display = "inline";

      const productIds = currentProductsOnScreen.map(p => p.id);
      const depositoId = depositoSelect.value;

      /**
       * ALTERAÇÃO: Antes chamava api.getStockBalance() que consultava o Bling API.
       * Agora lê os saldos do localStorage.
       */
      api.getStockBalance(productIds, depositoId).then(saldos => {
        if (saldos.error) {
          alert(`Erro ao buscar saldos: ${saldos.error}`);
          return;
        }
        currentProductsOnScreen.forEach(p => {
          const el = document.getElementById(`stock-value-${p.id}`);
          if (el) el.textContent = saldos[p.id] !== undefined ? saldos[p.id] : "N/D";
        });
      }).catch(err => {
        alert(`Erro ao buscar saldos: ${err.message}`);
      }).finally(() => {
        button.disabled = false;
        button.textContent = "Atualizar Saldos";
        if (stockLoader) stockLoader.style.display = "none";
      });
    }
  });

  // Confirmação em lote
  bulkActionContainer.addEventListener("click", function(event) {
    if (event.target.id === "bulk-confirm-button") {
      const button = event.target;
      const depId = depositoSelect.value;
      const updates = [];
      let allValid = true;

      selectedProducts.forEach(product => {
        const card = document.getElementById(`product-${product.id}`);
        const qtyInput = card.querySelector(".qty-input");
        const opSelect = card.querySelector(".op-select");
        if (qtyInput.value === "" || qtyInput.value < 0) {
          alert(`Preencha uma quantidade válida para: ${product.nome}`);
          allValid = false;
        }
        updates.push({
          id: product.id,
          sku: product.codigo,
          novaQtd: qtyInput.value,
          operacao: opSelect.value,
          depositoId: depId
        });
      });

      if (!allValid) return;

      button.textContent = "Atualizando...";
      button.disabled = true;

      /**
       * ALTERAÇÃO: Antes chamava api.updateMultipleStocks() → POST Flask → Bling API.
       * Agora processa todas as atualizações localmente.
       */
      api.updateMultipleStocks(updates, currentUser).then(data => {
        showToast(data.message, data.success ? "success" : "warning");
        if (data.success) {
          selectedProducts.clear();
          document.querySelectorAll(".product-checkbox:checked").forEach(cb => {
            const card = cb.closest(".product-card");
            if (card) card.querySelector(".qty-input").value = "";
            cb.checked = false;
          });
          updateBulkActionBar();
          document.getElementById("show-stock-button")?.click();
        }
      }).catch(err => showToast(`Erro: ${err.message}`, "error"))
        .finally(() => {
          button.textContent = "Confirmar Selecionados";
          button.disabled = false;
        });
    }
  });

  // Submit individual de um card
  resultsContainer.addEventListener("submit", function(event) {
    event.preventDefault();
    if (event.target.classList.contains("actions-form")) {
      const form = event.target;
      const productId = form.dataset.productId;
      const sku = form.dataset.sku;
      const novaQtd = form.querySelector(".qty-input").value;
      const operacao = form.querySelector(".op-select").value;

      if (novaQtd === "" || novaQtd < 0) {
        alert("Por favor, insira uma quantidade válida.");
        return;
      }

      const updateData = {
        id: productId,
        sku,
        novaQtd,
        operacao,
        depositoId: depositoSelect.value,
        user: currentUser
      };

      const button = form.querySelector("button");
      button.textContent = "Atualizando...";
      button.disabled = true;

      /**
       * ALTERAÇÃO: Antes chamava api.updateStock() → POST Flask → Bling API.
       * Agora aplica a operação diretamente no localStorage.
       */
      api.updateStock(updateData).then(data => {
        if (data.success) {
          const el = document.getElementById(`stock-value-${productId}`);
          if (el) el.textContent = data.novo_saldo;
          form.querySelector(".qty-input").value = "";
          showToast(`SKU ${sku}: saldo atualizado para ${data.novo_saldo}.`, "success");
        } else {
          showToast(`Falha: ${data.message}`, "error");
        }
      }).catch(err => {
        showToast(`Erro: ${err.message}`, "error");
      }).finally(() => {
        button.textContent = "Confirmar";
        button.disabled = false;
      });
    }
  });

  // ===========================
  // INICIALIZAÇÃO DA SESSÃO
  // ===========================

  /**
   * ALTERAÇÃO: Mantém a lógica de sessionStorage para restaurar a sessão
   * ao recarregar a página (comportamento idêntico ao original).
   * NOVO FLUXO: vai direto para o estoque, sem modal de escolha.
   */
  const savedUser = sessionStorage.getItem("currentUser");
  if (savedUser) {
    setLoggedInState(JSON.parse(savedUser));
  } else {
    loginView.style.display = "flex";
    mainView.style.display = "none";
  }

  ["mousemove", "keydown", "click", "scroll"].forEach(eventName => {
    window.addEventListener(eventName, resetInactivityTimer);
  });

}); // fim do primeiro DOMContentLoaded


// ==========================================================
//   TOAST (mantido exatamente igual ao original)
// ==========================================================

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = "toastOut 0.4s forwards";
    setTimeout(() => toast.remove(), 400);
  }, 3500);
}


// ==========================================================
//   MODAL DE ESCOLHA INICIAL (mantido para compatibilidade
//   com o HTML existente, mas o fluxo agora vai direto
//   para o estoque sem exibir o modal)
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {

  const modalEscolha = document.getElementById("modal-escolha");
  const btnEstoque = document.getElementById("btn-estoque");
  const btnCodigo = document.getElementById("btn-codigo");
  const loginView = document.getElementById("login-view");
  const mainView = document.getElementById("main-view");
  const paginaCodigo = document.getElementById("pagina-codigo");

  /**
   * ALTERAÇÃO: O modal de escolha foi desativado do fluxo principal.
   * O sistema vai direto do login para o gerenciador de estoque.
   * Os elementos ainda existem no HTML para compatibilidade, mas o modal
   * não é exibido automaticamente mais.
   */
  if (modalEscolha) modalEscolha.style.display = "none";

  // Botão "Gerenciador de Estoque" no modal (ainda funciona se o modal for aberto)
  if (btnEstoque) {
    btnEstoque.addEventListener("click", () => {
      if (modalEscolha) modalEscolha.style.display = "none";
      if (mainView) mainView.style.display = "block";
    });
  }

  /**
   * ALTERAÇÃO: O botão "Código de Barras" antes redirecionava para /codigobarra (rota Flask).
   * Agora abre o módulo de código de barras inline (pagina-codigo), sem navegação de página.
   */
  if (btnCodigo) {
    btnCodigo.addEventListener("click", () => {
      if (modalEscolha) modalEscolha.style.display = "none";
      if (paginaCodigo) {
        paginaCodigo.classList.remove("hidden");
      } else {
        alert("Módulo de Código de Barras: abra o arquivo codigobarra/index.html separadamente.");
      }
    });
  }

  // Botão Sair (página de código de barras)
  const btnSairCodigo = document.createElement("button");
  btnSairCodigo.id = "btn-sair-codigo";
  btnSairCodigo.innerText = "Sair";
  Object.assign(btnSairCodigo.style, {
    position: "absolute", top: "10px", right: "10px",
    padding: "8px 14px", background: "#d9534f", color: "white",
    border: "none", borderRadius: "5px", cursor: "pointer", display: "none"
  });
  if (paginaCodigo) {
    paginaCodigo.appendChild(btnSairCodigo);
    new MutationObserver(() => {
      btnSairCodigo.style.display = paginaCodigo.classList.contains("hidden") ? "none" : "block";
    }).observe(paginaCodigo, { attributes: true, attributeFilter: ["class"] });
  }

  btnSairCodigo.addEventListener("click", () => {
    if (paginaCodigo) paginaCodigo.classList.add("hidden");
    if (mainView) mainView.style.display = "block";
  });

});


// ==========================================================
//   MÓDULO DE BIPAGEM (Leitor de Código de Barras)
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {

  const modal = document.getElementById("modalBipar");
  const biparButton = document.getElementById("bipar-button");
  const closeModal = document.getElementById("closeModalBipar");
  const biparInput = document.getElementById("biparInput");
  const biparList = document.getElementById("biparList");
  const btnEnviar = document.getElementById("confirmarBipagem");

  if (!biparButton || !modal) return; // módulo não presente no HTML atual

  let modoAtual = "entrada";
  let bipados = [];

  biparButton.addEventListener("click", () => {
    modal.style.display = "flex";
    if (biparInput) biparInput.focus();
  });

  closeModal?.addEventListener("click", () => {
    modal.style.display = "none";
    bipados = [];
    atualizarLista();
    if (biparInput) biparInput.value = "";
  });

  document.querySelectorAll(".mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      modoAtual = btn.dataset.mode;
    });
  });

  if (biparInput) {
    biparInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && biparInput.value.trim() !== "") {
        const sku = biparInput.value.trim();
        bipados.push({ sku, modo: modoAtual, timestamp: new Date().toLocaleString() });
        atualizarLista();
        biparInput.value = "";
        biparInput.focus();
      }
    });
  }

  function atualizarLista() {
    if (!biparList) return;
    biparList.innerHTML = bipados.map((item, index) => `
      <div class="bip-item">
        <div class="bip-info">
          <strong>${item.sku}</strong><br>
          <select class="modo-select" data-index="${index}">
            <option value="entrada"    ${item.modo === "entrada"    ? "selected" : ""}>Entrada</option>
            <option value="saida"      ${item.modo === "saida"      ? "selected" : ""}>Saída</option>
            <option value="substituir" ${item.modo === "substituir" ? "selected" : ""}>Substituir</option>
          </select>
          <br><small>${item.timestamp}</small>
        </div>
        <button class="delete-bip" data-index="${index}">❌</button>
      </div>
    `).join("");

    document.querySelectorAll(".delete-bip").forEach(btn => {
      btn.addEventListener("click", () => {
        bipados.splice(parseInt(btn.dataset.index), 1);
        atualizarLista();
      });
    });

    document.querySelectorAll(".modo-select").forEach(select => {
      select.addEventListener("change", () => {
        bipados[parseInt(select.dataset.index)].modo = select.value;
      });
    });

    const contador = document.getElementById("contadorBips");
    if (contador) contador.innerText = `Total bipado: ${bipados.length}`;
    if (biparInput) biparInput.focus();
  }

  /**
   * ALTERAÇÃO: Antes chamava POST /api/bipar-contagem no Flask.
   * Agora processa localmente via api.biparContagem().
   */
  btnEnviar?.addEventListener("click", async () => {
    if (!bipados || bipados.length === 0) {
      alert("Nenhum produto bipado.");
      return;
    }

    const depSelect = document.getElementById("deposito-select");
    const depositoIdRaw = depSelect ? depSelect.value : null;
    if (!depositoIdRaw) {
      alert("Selecione um depósito antes de enviar a contagem.");
      depSelect?.focus();
      return;
    }

    const depositoId = parseInt(depositoIdRaw, 10);
    if (isNaN(depositoId)) {
      alert("Depósito inválido.");
      return;
    }

    const user = window.USER_DATA || window.CURRENT_USER || {
      username: "demo",
      full_name: "Usuário Demo"
    };

    const payloadBips = bipados.map(it => ({
      sku: it.sku,
      modo: it.modo || "entrada",
      quantidade: it.quantidade ? Number(it.quantidade) : 1
    }));

    btnEnviar.disabled = true;
    const originalText = btnEnviar.innerText;
    btnEnviar.innerText = "Enviando...";

    try {
      const data = await api.biparContagem({ depositoId, bipados: payloadBips, user });

      if (data.success) {
        showToast(data.message || "Contagem processada com sucesso.", "success");
        bipados = [];
        atualizarLista();
      } else {
        const falhas = (data.detalhes || []).filter(d => !d.success);
        const sucessoCount = (data.detalhes || []).filter(d => d.success).length;
        let txt = `${sucessoCount} com sucesso, ${falhas.length} falhas.\n\n`;
        txt += falhas.map(f => `${f.sku}: ${f.message}`).join("\n");
        alert(txt);
      }
    } catch (err) {
      console.error("Erro no envio de bipagem:", err);
      alert("Erro ao processar a contagem. Veja o console para detalhes.");
    } finally {
      btnEnviar.disabled = false;
      btnEnviar.innerText = originalText;
    }
  });

}); // fim do DOMContentLoaded de bipagem