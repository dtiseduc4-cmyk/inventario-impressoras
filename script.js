// ======================
// 🔥 Conexão Firestore
// ======================
const db = firebase.firestore();

// ======================
// 🧩 Função de mensagem visual
// ======================
function showMessage(msg, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ======================
// 🖨️ Cadastro de impressoras
// ======================
const form = document.getElementById("formCadastro");
const limparBtn = document.getElementById("limparForm");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const modelo = document.getElementById("modelo").value.trim();
    const toner = document.getElementById("toner").value.trim();
    const escola = document.getElementById("escola").value.trim();
    const propriedade = document.getElementById("propriedade").value;

    if (!modelo || !toner || !escola) {
      showMessage("⚠️ Preencha todos os campos obrigatórios!", "error");
      return;
    }

    try {
      // Verifica se já existe escola + toner
      const querySnapshot = await db.collection("impressoras")
        .where("escola", "==", escola)
        .where("toner", "==", toner)
        .get();

      if (!querySnapshot.empty) {
        showMessage("❌ Essa escola já possui este modelo de toner cadastrado!", "error");
        return;
      }

      await db.collection("impressoras").add({
        modelo,
        toner,
        escola,
        propriedade,
        dataCadastro: new Date()
      });

      showMessage("✅ Impressora cadastrada com sucesso!");
      form.reset();
    } catch (error) {
      console.error(error);
      showMessage("❌ Erro ao cadastrar impressora.", "error");
    }
  });

  limparBtn?.addEventListener("click", () => form.reset());
}

// ======================
// 📋 Listagem de impressoras
// ======================
async function listarImpressoras(filtroEscola = "", filtroToner = "") {
  const lista = document.getElementById("lista");
  if (!lista) return; // se estiver na página de cadastro, não faz nada
  lista.innerHTML = "";

  let query = db.collection("impressoras");
  if (filtroEscola) query = query.where("escola", "==", filtroEscola);
  if (filtroToner) query = query.where("toner", "==", filtroToner);

  try {
    const snapshot = await query.get();

    if (snapshot.empty) {
      lista.innerHTML = `<tr><td colspan="6" class="muted">Nenhuma impressora encontrada.</td></tr>`;
      return;
    }

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${data.modelo}</td>
        <td>${data.toner}</td>
        <td>${data.escola}</td>
        <td>${data.propriedade}</td>
        <td>${new Date(data.dataCadastro.seconds * 1000).toLocaleString()}</td>
        <td><button class="excluir small" data-id="${docSnap.id}">Excluir</button></td>
      `;
      lista.appendChild(tr);
    });

    // Adiciona evento de exclusão
    document.querySelectorAll(".excluir").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        if (confirm("Deseja realmente excluir esta impressora?")) {
          await db.collection("impressoras").doc(id).delete();
          showMessage("🗑️ Impressora removida com sucesso!");
          listarImpressoras(filtroEscola, filtroToner);
        }
      });
    });
  } catch (err) {
    console.error(err);
    showMessage("❌ Erro ao carregar lista de impressoras.", "error");
  }
}

// ======================
// 🔍 Filtros de busca
// ======================
const filtroEscolaInput = document?.getElementById("filtroEscola");
const filtroTonerInput = document?.getElementById("filtroToner");

[filtroEscolaInput, filtroTonerInput]?.forEach(input => {
  input?.addEventListener("input", () => {
    listarImpressoras(filtroEscolaInput?.value || "", filtroTonerInput?.value || "");
  });
});

// ======================
// 🚀 Inicialização automática
// ======================
window.onload = () => listarImpressoras();
