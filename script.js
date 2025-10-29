// script.js - Conecta ao Firebase e controla cadastro, lista, edição, exclusão e impressão

// Referência ao Firestore
db = firebase.firestore();

// --- Cadastro de impressoras ---
const form = document.getElementById('formCadastro');
if(form){
    form.addEventListener('submit', async e=>{
        e.preventDefault();
        const modelo = form.modelo.value.trim();
        const toner = form.toner.value.trim();
        const escola = form.escola.value.trim();
        const propriedade = form.propriedade.value;
        if(!modelo || !toner || !escola){ alert('Preencha todos os campos obrigatórios.'); return; }
        await db.collection('impressoras').add({modelo, toner, escola, propriedade, createdAt: firebase.firestore.FieldValue.serverTimestamp()});
        alert('Impressora salva com sucesso!');
        form.reset();
        window.location.href='lista.html';
    });
    document.getElementById('limparForm')?.addEventListener('click', ()=>form.reset());
}

// --- Renderizar tabela na lista ---
async function renderTable(){
    const tbody = document.querySelector('#tabela tbody');
    if(!tbody) return;
    tbody.innerHTML = '';
    const searchQuery = (document.getElementById('search')?.value||'').toLowerCase();
    const filterProp = document.getElementById('filterPropriedade')?.value || '';
    const snapshot = await db.collection('impressoras').orderBy('createdAt', 'desc').get();
    snapshot.forEach(doc=>{
        const r = doc.data();
        if(filterProp && r.propriedade!==filterProp) return;
        if(searchQuery && !(r.modelo+' '+r.toner+' '+r.escola).toLowerCase().includes(searchQuery)) return;
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
              <button onclick="deleteRegistro('${doc.id}')" class="small" style="background:#fee2e2;color:#b91c1c">Remover</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// --- Salvar edições ---
async function saveEdits(){
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
}

// --- Remover registro ---
async function deleteRegistro(id){
    if(!confirm('Remover este registro?')) return;
    await db.collection('impressoras').doc(id).delete();
    renderTable();
}

// --- Impressão ---
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

// --- Buscar e filtrar ---
document.getElementById('search')?.addEventListener('input', renderTable);
document.getElementById('filterPropriedade')?.addEventListener('change', renderTable);

// Renderizar tabela ao carregar a página
if(document.getElementById('tabela')) renderTable();
