// script_lista.js - Firebase Firestore para lista.html

const tbody = document.querySelector('#tabela tbody');
const searchInput = document.getElementById('search');
const filterSelect = document.getElementById('filterPropriedade');

// Função para renderizar a tabela
async function renderTable(){
  if(!tbody) return;
  tbody.innerHTML = '';
  
  const snapshot = await db.collection('impressoras').get();
  snapshot.forEach(doc => {
    const r = doc.data();
    const q = (searchInput?.value||'').toLowerCase();
    const prop = filterSelect?.value || '';

    if(prop && r.propriedade!==prop) return;
    if(q && !(r.modelo+' '+r.toner+' '+r.escola).toLowerCase().includes(q)) return;

    const tr = document.createElement('tr');
    tr.dataset.id = doc.id;
    tr.innerHTML = `
      <td contenteditable>${r.modelo}</td>
      <td contenteditable>${r.toner}</td>
      <td contenteditable>${r.escola}</td>
      <td>
        <select>
          <option ${r.propriedade==='Propria'?'selected':''}>Propria</option>
          <option ${r.propriedade==='Alugada'?'selected':''}>Alugada</option>
        </select>
      </td>
      <td>
        <button class="small" style="background:#fee2e2;color:#b91c1c" onclick="deleteRegistro('${doc.id}')">Remover</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Salvar alterações
document.getElementById('saveBtn')?.addEventListener('click', async ()=>{
  document.querySelectorAll('#tabela tbody tr').forEach(async tr=>{
    const id = tr.dataset.id;
    await db.collection('impressoras').doc(id).update({
      modelo: tr.cells[0].innerText.trim(),
      toner: tr.cells[1].innerText.trim(),
      escola: tr.cells[2].innerText.trim(),
      propriedade: tr.cells[3].querySelector('select').value
    });
  });
  alert('Alterações salvas com sucesso!');
  renderTable();
});

// Remover registro
async function deleteRegistro(id){
  if(!confirm('Remover este registro?')) return;
  await db.collection('impressoras').doc(id).delete();
  renderTable();
}

// Impressão da tabela
document.getElementById('printBtn')?.addEventListener('click', ()=>{
  const table = document.getElementById('tabela');
  if(!table) return;
  const win = window.open('', '', 'width=900,height=600');
  win.document.write('<html><head><title>Impressoras Cadastradas</title>');
  win.document.write('<style>table{width:100%;border-collapse:collapse;} th,td{padding:8px;border:1px solid #000;text-align:left;} th{background:#0b63d6;color:#fff;}</style>');
  win.document.write('</head><body>');
  win.document.write('<h2>Lista de Impressoras Cadastradas</h2>');
  win.document.write(table.outerHTML);
  win.document.write('</body></html>');
  win.document.close();
  win.focus();
  win.print();
});

// Buscar e filtrar
searchInput?.addEventListener('input', renderTable);
filterSelect?.addEventListener('change', renderTable);

// Renderizar tabela ao abrir a página
renderTable();
