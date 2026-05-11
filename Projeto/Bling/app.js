// app.js

const refreshTerminal = document.getElementById("refresh-terminal");
const stockTerminal = document.getElementById("stock-terminal");

const refreshLogs = [
  ["info","[INFO] Inicializando serviço Node.js..."],
  ["info","[INFO] Verificando container Docker..."],
  ["success","[SUCCESS] Container refresh_token_service ONLINE"],
  ["info","[INFO] Conectando ao MariaDB..."],
  ["success","[SUCCESS] Banco conectado com sucesso"],
  ["info","[INFO] Buscando refresh token atual..."],
  ["success","[SUCCESS] Refresh token localizado"],
  ["info","[INFO] Solicitando novo access token..."],
  ["success","[SUCCESS] Token renovado com sucesso"],
  ["info","[INFO] Atualizando credenciais no banco..."],
  ["success","[SUCCESS] Banco atualizado"],
  ["info","[INFO] Próxima renovação em 05:29:59"]
];

const stockLogs = [
  ["info","[INFO] Iniciando automação.py..."],
  ["success","[SUCCESS] Worker ONLINE"],
  ["info","[INFO] Buscando pedidos do Bling..."],
  ["success","[SUCCESS] Pedido #58421 encontrado"],
  ["info","[INFO] Coletando itens vendidos..."],
  ["info","[INFO] SKU localizado: CAMISETA-PRETA-M"],
  ["info","[INFO] Verificando mapa.json..."],
  ["success","[SUCCESS] SKU espelhado encontrado"],
  ["info","[INFO] Sincronizando estoque..."],
  ["success","[SUCCESS] Estoque sincronizado"],
  ["info","[INFO] Atualizando baixa_processadas.json"],
  ["success","[SUCCESS] Processo concluído"]
];

function addLog(terminal,type,text){

  const log = document.createElement("div");

  log.className = `log ${type}`;

  log.textContent = text;

  terminal.appendChild(log);

  terminal.scrollTop = terminal.scrollHeight;

  if(terminal.children.length > 80){
    terminal.removeChild(terminal.children[0]);
  }
}

function randomLog(logs){
  return logs[Math.floor(Math.random() * logs.length)];
}

setInterval(()=>{

  const [type,text] = randomLog(refreshLogs);

  addLog(refreshTerminal,type,text);

},1600);

setInterval(()=>{

  const [type,text] = randomLog(stockLogs);

  addLog(stockTerminal,type,text);

},1300);

function updateStats(){

  document.getElementById("cpu-usage").textContent =
    `${Math.floor(Math.random()*35)+8}%`;

  document.getElementById("ram-usage").textContent =
    `${(Math.random()*3+1).toFixed(1)}GB`;

  document.getElementById("orders-count").textContent =
    Math.floor(Math.random()*40)+260;

  document.getElementById("sync-count").textContent =
    Math.floor(Math.random()*40)+240;

  document.getElementById("queue-count").textContent =
    Math.floor(Math.random()*6);

}

setInterval(updateStats,3000);

let seconds = 0;

setInterval(()=>{

  seconds++;

  const hrs = String(Math.floor(seconds / 3600)).padStart(2,"0");
  const mins = String(Math.floor((seconds % 3600)/60)).padStart(2,"0");
  const secs = String(seconds % 60).padStart(2,"0");

  document.getElementById("uptime").textContent =
    `${hrs}:${mins}:${secs}`;

},1000);

document.getElementById("restart-refresh")
.addEventListener("click",()=>{

  addLog(
    refreshTerminal,
    "warn",
    "[SYSTEM] Reiniciando serviço refresh_token_service..."
  );

});

document.getElementById("restart-stock")
.addEventListener("click",()=>{

  addLog(
    stockTerminal,
    "warn",
    "[SYSTEM] Reiniciando worker automacao.py..."
  );

});

document.getElementById("run-refresh")
.addEventListener("click",()=>{

  addLog(
    refreshTerminal,
    "success",
    "[MANUAL] Execução manual iniciada"
  );

});

document.getElementById("run-stock")
.addEventListener("click",()=>{

  addLog(
    stockTerminal,
    "success",
    "[MANUAL] Novo ciclo iniciado"
  );

});