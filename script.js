const STORAGE_KEY = 'inventario_impressoras_v2';

function readStorage(){ try{ return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }catch(e){ return []; } }
function writeStorage(arr){ localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); }

function renderTable(){
    const tbody = document.querySelector('#tabela tbody');
    if(!tbody) return;
    const arr = readStorage();
    const q = (document.getElementById('search')?.value||'').toLowerCase();
    const prop = document.getElementById('filterPropriedade')?.value || '';
    const filtered = arr.filter(r=>{
        if(prop && r.propriedade!==prop) return false;
        if(!q) return true;
        return (r.modelo+' '+r.toner+' '+r.escola).toLowerCase().includes(q);
    });
    tbody.innerHTML = '';
    if(filtered.length===0){ tbody.innerHTML='<tr><td colspan="5" class="muted">Nenhuma impressora encontrada.</td></tr>'; return; }
    for(const r of filtered){
        const tr = document.createElement('tr');
        tr.dataset.id = r.id;
        tr.innerHTML = `
            <td contenteditable>${escapeHtml(r.modelo)}</td>
            <td contenteditable>${escapeHtml(r.toner)}</td>
            <td contenteditable>${escapeHtml(r.escola)}</td>
            <td>
                <select>
                    <option ${r.propriedade==='Propria'?'selected':''}>Propria</option>
                    <option ${r.propriedade==='Alugada'?'selected':''}>Alugada</option>
                </select>
            </td>
            <td>
                <button onclick="deleteRegistro(${r.id})" style="background:#fee2e2;color:#b91c1c" class="small">Remover</button>
            </td>
        `;
        tbody.appendChild(tr);
    }
}

function saveEdits(){
    const arr = readStorage();
    document.querySelectorAll('#tabela tbody tr').forEach(tr=>{
        const id = Number(tr.dataset.id);
        const registro = arr.find(r=>r.id===id);
        if(registro){
            const tds = tr.querySelectorAll('td');
            registro.modelo = tds[0].innerText.trim();
            registro.toner = tds[1].innerText.trim();
            registro.escola = tds[2].innerText.trim();
            registro.propriedade = tds[3].querySelector('select').value;
        }
    });
    writeStorage(arr);
    alert('Alterações salvas com sucesso!');
    renderTable();
}

function deleteRegistro(id){
    if(!confirm('Remover este registro?')) return;
    let arr = readStorage();
    arr = arr.filter(r=>r.id!==id);
    writeStorage(arr);
    renderTable();
}

document.addEventListener('DOMContentLoaded', ()=>{
    if(document.getElementById('tabela')) renderTable();
    document.getElementById('saveBtn')?.addEventListener('click', saveEdits);
    document.getElementById('search')?.addEventListener('input', renderTable);
    document.getElementById('filterPropriedade')?.addEventListener('change', renderTable);

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

    const form = document.getElementById('formCadastro');
    form?.addEventListener('submit', e=>{
        e.preventDefault();
        const modelo = form.modelo.value.trim();
        const toner = form.toner.value.trim();
        const escola = form.escola.value.trim();
        const propriedade = form.propriedade.value;
        if(!modelo || !toner || !escola){ alert('Preencha todos os campos obrigatórios.'); return; }
        const registro = {id:Date.now(), modelo, toner, escola, propriedade};
        const arr = readStorage(); arr.push(registro); writeStorage(arr);
        alert('Impressora salva com sucesso!');
        form.reset();
        window.location.href='lista.html';
    });
});
function escapeHtml(str){ return String(str||'').replace(/[&<>"]+/g, function(m){return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]||m);}); }
