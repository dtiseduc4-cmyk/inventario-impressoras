// Conexão Firestore
const db = firebase.firestore();

// ================= Cadastro de impressoras =================
const form = document.getElementById("formCadastro");
const limparBtn = document.getElementById("limparForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const modelo = document.getElementById("modelo").value.trim();
  const toner = document.getElementById("toner").value.trim();
  const escola = document.getElementById("escola").value.trim();
  const propriedade = document.getElementById("propriedade").value;

  if (!modelo || !toner || !escola) {
    alert("Preencha todos os campos obrigatórios!");
    return;
  }

  try {
    // Verifica se já existe escola + toner
    const querySnapshot = await db.collection("impressoras")
      .where("escola", "==", escola)
      .where("toner", "==", toner)
      .get();

    if (!querySnapshot.empty) {
      alert("Essa combinação de escola e modelo de toner já está cadastrada!");
      return;
    }

    await db.collection("impressoras").add({
      modelo,
      toner,
      escola,
      propriedade,
      dataCadastro: new Date()
    });

    alert("Impressora cadastrada com sucesso!");
    form.reset();
  } catch (error) {
    console.error(error);
    alert("Erro ao cadastrar impressora.");
  }
});

limparBtn.addEventListener("click", () => form.reset());

// ================= Listagem de impressoras =================
async function listarImpressoras(filtroEscola = "", filtroToner = "") {
  const lista = document.getElementById("lista");
  if (!lista) return; // se estiver na página de cadastro, não faz nada
  lista.innerHTML = "";

  let query = db.collection("impressoras");

  if (filtroEscola) query = query.where("escola", "==", filtroEscola);
  if (filtroToner) query = query.where("toner", "==", filtroToner);

  const snapshot = await query.get();
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${data.modelo}</td>
      <td>${data.toner}</td>
      <td>${data.escola}</td>
      <td>${data.propriedade}</td>
      <td>${new Date(data.dataCadastro.seconds * 1000).toLocaleString()}</td>
      <td><button class="excluir" data-id="${docSnap.id}">Excluir</button></td>
    `;
    lista.appendChild(tr);
  });

  // Adiciona evento de exclusão
  document.querySelectorAll(".excluir").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      if (confirm("Deseja realmente excluir esta impressora?")) {
        await db.collection("impressoras").doc(id).delete();
        listarImpressoras(filtroEscola, filtroToner);
      }
    });
  });
}

// ================= Filtros =================
const filtroEscolaInput = document?.getElementById("filtroEscola");
const filtroTonerInput = document?.getElementById("filtroToner");

[filtroEscolaInput, filtroTonerInput]?.forEach(input => {
  input?.addEventListener("input", () => {
    listarImpressoras(filtroEscolaInput?.value || "", filtroTonerInput?.value || "");
  });
});

// Chama a listagem automaticamente se existir lista
window.onload = () => listarImpressoras();
